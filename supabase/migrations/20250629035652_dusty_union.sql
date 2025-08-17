/*
  # Fix Categories and Add Featured Memes System

  1. Categories
    - Add default categories with conflict handling
    - Create view for category statistics
    - Update category meme count function

  2. Featured Memes
    - Create view based on user_favorites count
    - Order by favorite count and views

  3. Functions
    - Update category meme count trigger function
*/

-- Inserir categorias padrão apenas se não existirem (usando DO block para controle)
DO $$
BEGIN
  -- Inserir cada categoria individualmente com verificação
  INSERT INTO categories (name, slug, description, icon, color) 
  SELECT 'Reação', 'reacao', 'Expressões e reações', 'Smile', 'from-primary-500 to-blue-500'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'reacao');

  INSERT INTO categories (name, slug, description, icon, color) 
  SELECT 'Games', 'games', 'Mundo dos jogos', 'Gamepad', 'from-purple-500 to-pink-500'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'games');

  INSERT INTO categories (name, slug, description, icon, color) 
  SELECT 'Filmes/TV', 'filmes-tv', 'Cinema e televisão', 'Film', 'from-teal-500 to-green-500'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'filmes-tv');

  INSERT INTO categories (name, slug, description, icon, color) 
  SELECT 'Esportes', 'esportes', 'Futebol e outros esportes', 'Trophy', 'from-accent-500 to-red-500'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'esportes');

  INSERT INTO categories (name, slug, description, icon, color) 
  SELECT 'Trabalho', 'trabalho', 'Vida profissional', 'Briefcase', 'from-indigo-500 to-purple-500'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'trabalho');

  INSERT INTO categories (name, slug, description, icon, color) 
  SELECT 'Amor', 'amor', 'Relacionamentos', 'Heart', 'from-pink-500 to-red-500'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'amor');

  INSERT INTO categories (name, slug, description, icon, color) 
  SELECT 'Música', 'musica', 'Artistas e música', 'Music', 'from-green-500 to-teal-500'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'musica');

  INSERT INTO categories (name, slug, description, icon, color) 
  SELECT 'Cotidiano', 'cotidiano', 'Dia a dia angolano', 'Coffee', 'from-yellow-500 to-orange-500'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'cotidiano');

  INSERT INTO categories (name, slug, description, icon, color) 
  SELECT 'Política', 'politica', 'Política angolana', 'Users', 'from-red-500 to-orange-500'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'politica');

  INSERT INTO categories (name, slug, description, icon, color) 
  SELECT 'Humor', 'humor', 'Piadas e comédia', 'Smile', 'from-blue-500 to-purple-500'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'humor');

  INSERT INTO categories (name, slug, description, icon, color) 
  SELECT 'Outros', 'outros', 'Memes que não se encaixam em outras categorias', 'Tag', 'from-gray-500 to-gray-600'
  WHERE NOT EXISTS (SELECT 1 FROM categories WHERE slug = 'outros');
END $$;

-- Criar view para estatísticas de categorias com contagem real
DROP VIEW IF EXISTS category_stats;
CREATE VIEW category_stats AS
SELECT 
  c.id,
  c.name,
  c.slug,
  c.description,
  c.icon,
  c.color,
  COALESCE(COUNT(m.id), 0) as meme_count
FROM categories c
LEFT JOIN memes m ON c.id = m.category_id AND m.status = 'approved'
GROUP BY c.id, c.name, c.slug, c.description, c.icon, c.color
ORDER BY meme_count DESC, c.name;

-- Criar view para memes em destaque baseado em favoritos
DROP VIEW IF EXISTS featured_memes;
CREATE VIEW featured_memes AS
SELECT 
  m.*,
  c.name as category_name,
  COALESCE(COUNT(uf.id), 0) as favorite_count
FROM memes m
LEFT JOIN categories c ON m.category_id = c.id
LEFT JOIN user_favorites uf ON m.id = uf.meme_id
WHERE m.status = 'approved'
GROUP BY m.id, c.name
ORDER BY favorite_count DESC, m.view_count DESC, m.created_at DESC
LIMIT 6;

-- Atualizar função para atualizar contagem de memes por categoria
CREATE OR REPLACE FUNCTION update_category_meme_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar categoria antiga se existir
  IF TG_OP = 'UPDATE' AND OLD.category_id IS NOT NULL THEN
    UPDATE categories 
    SET meme_count = (
      SELECT COUNT(*) 
      FROM memes 
      WHERE category_id = OLD.category_id AND status = 'approved'
    )
    WHERE id = OLD.category_id;
  END IF;
  
  -- Atualizar categoria nova
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.category_id IS NOT NULL THEN
    UPDATE categories 
    SET meme_count = (
      SELECT COUNT(*) 
      FROM memes 
      WHERE category_id = NEW.category_id AND status = 'approved'
    )
    WHERE id = NEW.category_id;
  END IF;
  
  -- Para DELETE, atualizar categoria do meme deletado
  IF TG_OP = 'DELETE' AND OLD.category_id IS NOT NULL THEN
    UPDATE categories 
    SET meme_count = (
      SELECT COUNT(*) 
      FROM memes 
      WHERE category_id = OLD.category_id AND status = 'approved'
    )
    WHERE id = OLD.category_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Atualizar todas as contagens de categorias existentes
UPDATE categories 
SET meme_count = (
  SELECT COUNT(*) 
  FROM memes 
  WHERE category_id = categories.id AND status = 'approved'
);

-- Criar tabela para memes pendentes de aprovação
CREATE TABLE memes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Cotidiano',
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  extracted_text TEXT, -- Texto extraído por OCR para verificação de duplicados
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para memes
CREATE POLICY "Usuários podem inserir próprios memes pendentes" ON memes
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Usuários podem ver próprios memes pendentes" ON memes
  FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Admins podem ver todos os memes pendentes" ON memes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins podem atualizar memes pendentes" ON memes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins podem deletar memes pendentes" ON memes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Função para mover meme aprovado para tabela principal
CREATE OR REPLACE FUNCTION approve_pending_meme(pending_id UUID, reviewer_id UUID)
RETURNS UUID AS $$
DECLARE
  pending_meme RECORD;
  new_meme_id UUID;
BEGIN
  -- Buscar o meme pendente
  SELECT * INTO pending_meme FROM memes WHERE id = pending_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Meme pendente não encontrado ou já processado';
  END IF;
  
  -- Inserir na tabela principal
  INSERT INTO memes (
    title, description, image_url, category, tags, uploaded_by, created_at
  ) VALUES (
    pending_meme.title, pending_meme.description, pending_meme.image_url, 
    pending_meme.category, pending_meme.tags, pending_meme.uploaded_by, 
    pending_meme.uploaded_at
  ) RETURNING id INTO new_meme_id;
  
  -- Atualizar status do meme pendente
  UPDATE memes 
  SET status = 'approved', reviewed_by = reviewer_id, reviewed_at = NOW()
  WHERE id = pending_id;
  
  RETURN new_meme_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para rejeitar meme pendente
CREATE OR REPLACE FUNCTION reject_pending_meme(pending_id UUID, reviewer_id UUID, reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE memes 
  SET status = 'rejected', reviewed_by = reviewer_id, reviewed_at = NOW(), rejection_reason = reason
  WHERE id = pending_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_memes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_memes_updated_at_trigger
  BEFORE UPDATE ON memes
  FOR EACH ROW
  EXECUTE FUNCTION update_memes_updated_at();

-- Índices para performance
CREATE INDEX idx_memes_status ON memes(status);
CREATE INDEX idx_memes_uploaded_by ON memes(uploaded_by);
CREATE INDEX idx_memes_category ON memes(category);
CREATE INDEX idx_memes_extracted_text ON memes USING gin(to_tsvector('portuguese', extracted_text));