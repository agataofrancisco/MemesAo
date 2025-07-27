/*
  # Esquema completo do MemesAo

  1. Novas Tabelas
    - `profiles` - Perfis de usuários com roles
    - `categories` - Categorias de memes com contadores
    - `memes` - Memes com metadados completos e status de moderação
    - `meme_tags` - Sistema de tags para memes
    - `meme_views` - Rastreamento de visualizações
    - `meme_downloads` - Rastreamento de downloads
    - `reports` - Sistema de denúncias

  2. Segurança
    - RLS habilitado em todas as tabelas
    - Políticas baseadas em roles (user/moderator/admin)
    - Memes aprovados são públicos
    - Usuários podem gerenciar seu próprio conteúdo

  3. Funcionalidades Automáticas
    - Perfil criado automaticamente no registro
    - Contadores atualizados em tempo real
    - Categorias padrão inseridas
*/

-- Criar tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  icon text,
  color text,
  meme_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de memes
CREATE TABLE IF NOT EXISTS memes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  description text,
  image_url text NOT NULL,
  image_path text NOT NULL,
  file_size integer,
  width integer,
  height integer,
  format text,
  ocr_text text,
  category_id uuid REFERENCES categories(id),
  uploaded_by uuid REFERENCES profiles(id),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de tags dos memes
CREATE TABLE IF NOT EXISTS meme_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id uuid REFERENCES memes(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(meme_id, tag)
);

-- Criar tabela de visualizações
CREATE TABLE IF NOT EXISTS meme_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id uuid REFERENCES memes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de downloads
CREATE TABLE IF NOT EXISTS meme_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id uuid REFERENCES memes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de reports
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id uuid REFERENCES memes(id) ON DELETE CASCADE,
  reported_by uuid REFERENCES profiles(id),
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  reviewed_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meme_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE meme_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE meme_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver conflito
DO $$ 
BEGIN
  -- Políticas para profiles
  DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  
  -- Políticas para categories
  DROP POLICY IF EXISTS "Anyone can read categories" ON categories;
  DROP POLICY IF EXISTS "Only admins can modify categories" ON categories;
  
  -- Políticas para memes
  DROP POLICY IF EXISTS "Anyone can read approved memes" ON memes;
  DROP POLICY IF EXISTS "Users can read own memes" ON memes;
  DROP POLICY IF EXISTS "Authenticated users can upload memes" ON memes;
  DROP POLICY IF EXISTS "Users can update own pending memes" ON memes;
  DROP POLICY IF EXISTS "Moderators can update meme status" ON memes;
  
  -- Políticas para meme_tags
  DROP POLICY IF EXISTS "Anyone can read tags for approved memes" ON meme_tags;
  DROP POLICY IF EXISTS "Users can manage tags for own memes" ON meme_tags;
  
  -- Políticas para meme_views
  DROP POLICY IF EXISTS "Anyone can insert views" ON meme_views;
  DROP POLICY IF EXISTS "Users can read own views" ON meme_views;
  
  -- Políticas para meme_downloads
  DROP POLICY IF EXISTS "Anyone can insert downloads" ON meme_downloads;
  DROP POLICY IF EXISTS "Users can read own downloads" ON meme_downloads;
  
  -- Políticas para reports
  DROP POLICY IF EXISTS "Authenticated users can create reports" ON reports;
  DROP POLICY IF EXISTS "Users can read own reports" ON reports;
  DROP POLICY IF EXISTS "Moderators can read all reports" ON reports;
  DROP POLICY IF EXISTS "Moderators can update reports" ON reports;
END $$;

-- Criar políticas para profiles
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Criar políticas para categories
CREATE POLICY "Anyone can read categories"
  ON categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only admins can modify categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  ));

-- Criar políticas para memes
CREATE POLICY "Anyone can read approved memes"
  ON memes
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Users can read own memes"
  ON memes
  FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

CREATE POLICY "Authenticated users can upload memes"
  ON memes
  FOR INSERT
  TO authenticated
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can update own pending memes"
  ON memes
  FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid() AND status = 'pending');

CREATE POLICY "Moderators can update meme status"
  ON memes
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('moderator', 'admin')
  ));

-- Criar políticas para meme_tags
CREATE POLICY "Anyone can read tags for approved memes"
  ON meme_tags
  FOR SELECT
  TO public
  USING (EXISTS (
    SELECT 1 FROM memes 
    WHERE memes.id = meme_tags.meme_id 
    AND memes.status = 'approved'
  ));

CREATE POLICY "Users can manage tags for own memes"
  ON meme_tags
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM memes 
    WHERE memes.id = meme_tags.meme_id 
    AND memes.uploaded_by = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM memes 
    WHERE memes.id = meme_tags.meme_id 
    AND memes.uploaded_by = auth.uid()
  ));

-- Criar políticas para meme_views
CREATE POLICY "Anyone can insert views"
  ON meme_views
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read own views"
  ON meme_views
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Criar políticas para meme_downloads
CREATE POLICY "Anyone can insert downloads"
  ON meme_downloads
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can read own downloads"
  ON meme_downloads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Criar políticas para reports
CREATE POLICY "Authenticated users can create reports"
  ON reports
  FOR INSERT
  TO authenticated
  WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Users can read own reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (reported_by = auth.uid());

CREATE POLICY "Moderators can read all reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('moderator', 'admin')
  ));

CREATE POLICY "Moderators can update reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('moderator', 'admin')
  ));

-- Criar bucket de storage para memes (se não existir)
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('memes', 'memes', true);
EXCEPTION WHEN unique_violation THEN
  -- Bucket já existe, não fazer nada
  NULL;
END $$;

-- Remover políticas de storage existentes se houver
DO $$
BEGIN
  DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de memes" ON storage.objects;
  DROP POLICY IF EXISTS "Memes são publicamente acessíveis" ON storage.objects;
EXCEPTION WHEN OTHERS THEN
  -- Políticas não existem, continuar
  NULL;
END $$;

-- Criar políticas de storage
CREATE POLICY "Usuários autenticados podem fazer upload de memes"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'memes');

CREATE POLICY "Memes são publicamente acessíveis"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'memes');

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_memes_category ON memes(category_id);
CREATE INDEX IF NOT EXISTS idx_memes_created_at ON memes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memes_view_count ON memes(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_memes_download_count ON memes(download_count DESC);
CREATE INDEX IF NOT EXISTS idx_memes_status ON memes(status);
CREATE INDEX IF NOT EXISTS idx_memes_ocr_text ON memes USING gin(to_tsvector('portuguese', ocr_text));
CREATE INDEX IF NOT EXISTS idx_meme_tags_tag ON meme_tags(tag);
CREATE INDEX IF NOT EXISTS idx_meme_views_created_at ON meme_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meme_downloads_created_at ON meme_downloads(created_at DESC);

-- Função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Função para atualizar contador de visualizações
CREATE OR REPLACE FUNCTION update_meme_view_count()
RETURNS trigger AS $$
BEGIN
  UPDATE memes 
  SET view_count = view_count + 1 
  WHERE id = NEW.meme_id;
  RETURN NEW;
END;
$$ language plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_update_meme_view_count ON meme_views;

-- Criar trigger para atualizar contador de visualizações
CREATE TRIGGER trigger_update_meme_view_count
  AFTER INSERT ON meme_views
  FOR EACH ROW EXECUTE FUNCTION update_meme_view_count();

-- Função para atualizar contador de downloads
CREATE OR REPLACE FUNCTION update_meme_download_count()
RETURNS trigger AS $$
BEGIN
  UPDATE memes 
  SET download_count = download_count + 1 
  WHERE id = NEW.meme_id;
  RETURN NEW;
END;
$$ language plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_update_meme_download_count ON meme_downloads;

-- Criar trigger para atualizar contador de downloads
CREATE TRIGGER trigger_update_meme_download_count
  AFTER INSERT ON meme_downloads
  FOR EACH ROW EXECUTE FUNCTION update_meme_download_count();

-- Função para atualizar contador de memes por categoria
CREATE OR REPLACE FUNCTION update_category_meme_count()
RETURNS trigger AS $$
BEGIN
  -- Se é um INSERT ou UPDATE que muda a categoria
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.category_id != NEW.category_id) THEN
    -- Incrementar nova categoria
    IF NEW.category_id IS NOT NULL AND NEW.status = 'approved' THEN
      UPDATE categories 
      SET meme_count = meme_count + 1 
      WHERE id = NEW.category_id;
    END IF;
    
    -- Decrementar categoria antiga (apenas no UPDATE)
    IF TG_OP = 'UPDATE' AND OLD.category_id IS NOT NULL AND OLD.status = 'approved' THEN
      UPDATE categories 
      SET meme_count = meme_count - 1 
      WHERE id = OLD.category_id;
    END IF;
  END IF;
  
  -- Se é um DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.category_id IS NOT NULL AND OLD.status = 'approved' THEN
      UPDATE categories 
      SET meme_count = meme_count - 1 
      WHERE id = OLD.category_id;
    END IF;
    RETURN OLD;
  END IF;
  
  -- Se é um UPDATE de status
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status AND OLD.category_id = NEW.category_id THEN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
      -- Meme foi aprovado
      UPDATE categories 
      SET meme_count = meme_count + 1 
      WHERE id = NEW.category_id;
    ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
      -- Meme foi rejeitado/removido
      UPDATE categories 
      SET meme_count = meme_count - 1 
      WHERE id = OLD.category_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ language plpgsql;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_update_category_meme_count ON memes;

-- Criar trigger para atualizar contador de memes por categoria
CREATE TRIGGER trigger_update_category_meme_count
  AFTER INSERT OR UPDATE OR DELETE ON memes
  FOR EACH ROW EXECUTE FUNCTION update_category_meme_count();

-- Inserir categorias padrão
INSERT INTO categories (name, slug, description, icon, color) VALUES
  ('Reação', 'reacao', 'Memes de reação e expressões', 'Smile', 'from-primary-500 to-blue-500'),
  ('Games', 'games', 'Memes sobre jogos e gaming', 'Gamepad', 'from-purple-500 to-pink-500'),
  ('Filmes/TV', 'filmes-tv', 'Memes de filmes e séries', 'Film', 'from-teal-500 to-green-500'),
  ('Esportes', 'esportes', 'Memes sobre futebol e outros esportes', 'Trophy', 'from-accent-500 to-red-500'),
  ('Trabalho', 'trabalho', 'Memes sobre vida profissional', 'Briefcase', 'from-indigo-500 to-purple-500'),
  ('Amor', 'amor', 'Memes sobre relacionamentos', 'Heart', 'from-pink-500 to-red-500'),
  ('Música', 'musica', 'Memes sobre artistas e música', 'Music', 'from-green-500 to-teal-500'),
  ('Cotidiano', 'cotidiano', 'Memes do dia a dia angolano', 'Coffee', 'from-yellow-500 to-orange-500')
ON CONFLICT (slug) DO NOTHING;