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