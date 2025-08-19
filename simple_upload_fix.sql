-- Script simples para corrigir uploads anônimos
-- Execute no SQL Editor do Supabase

-- 1. Habilitar RLS na tabela memes
ALTER TABLE public.memes ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas conflituosas
DROP POLICY IF EXISTS "Public can insert anonymous memes" ON public.memes;
DROP POLICY IF EXISTS "Users can insert memes" ON public.memes;
DROP POLICY IF EXISTS "Public can insert memes" ON public.memes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.memes;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.memes;

-- 3. Criar política para permitir INSERT por qualquer pessoa
CREATE POLICY "Enable insert for everyone"
ON public.memes
FOR INSERT
TO public
WITH CHECK (true);

-- 4. Criar política para permitir SELECT de memes aprovados
CREATE POLICY "Enable select for approved memes"
ON public.memes
FOR SELECT
TO public
USING (status = 'approved');

-- 5. Verificar se o bucket 'memes' existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('memes', 'memes', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 6. Remover políticas conflituosas do storage
DROP POLICY IF EXISTS "Authenticated users can upload memes" ON storage.objects;
DROP POLICY IF EXISTS "storage_memes_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de meme" ON storage.objects;
DROP POLICY IF EXISTS "storage_memes_read_policy" ON storage.objects;
DROP POLICY IF EXISTS "Public can view memes" ON storage.objects;
DROP POLICY IF EXISTS "Memes são publicamente acessíveis" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own memes" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own memes" ON storage.objects;

-- 7. Criar política para permitir upload público
CREATE POLICY "storage_memes_public_upload"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'memes');

-- 8. Criar política para permitir leitura pública
CREATE POLICY "storage_memes_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'memes');

-- 9. Verificar se a coluna share_count existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'memes' AND column_name = 'share_count'
  ) THEN
    ALTER TABLE public.memes ADD COLUMN share_count integer DEFAULT 0;
  END IF;
END $$;

-- 10. Verificar se a tabela meme_shares existe
CREATE TABLE IF NOT EXISTS public.meme_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id uuid NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- 11. Habilitar RLS na tabela meme_shares
ALTER TABLE public.meme_shares ENABLE ROW LEVEL SECURITY;

-- 12. Políticas para meme_shares
DROP POLICY IF EXISTS "Anyone can insert shares" ON public.meme_shares;

CREATE POLICY "Anyone can insert shares"
  ON public.meme_shares
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 13. Verificar se a tabela profiles tem a coluna role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role text DEFAULT 'user';
  END IF;
END $$;

-- 14. Verificar se a tabela profiles existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  username text UNIQUE,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 15. Habilitar RLS na tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 16. Políticas para profiles
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;

CREATE POLICY "Public can view profiles"
  ON public.profiles
  FOR SELECT
  TO public
  USING (true);

-- 17. Verificar se a tabela categories existe
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  color text,
  meme_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 18. Habilitar RLS na tabela categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 19. Políticas para categories
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;

CREATE POLICY "Public can view categories"
  ON public.categories
  FOR SELECT
  TO public
  USING (true);

-- 20. Inserir categorias padrão
INSERT INTO public.categories (name, slug, description, icon, color) VALUES
  ('Reação', 'reacao', 'Memes de reação e expressões', 'Smile', 'from-yellow-400 to-orange-500'),
  ('Humor', 'humor', 'Memes engraçados e piadas', 'Laugh', 'from-blue-400 to-purple-500'),
  ('Política', 'politica', 'Memes políticos', 'Flag', 'from-red-400 to-pink-500'),
  ('Futebol', 'futebol', 'Memes de futebol', 'Zap', 'from-green-400 to-blue-500'),
  ('Trabalho', 'trabalho', 'Memes sobre trabalho', 'Briefcase', 'from-gray-400 to-blue-500')
ON CONFLICT (name) DO NOTHING;

-- 21. Verificar se a tabela meme_downloads existe
CREATE TABLE IF NOT EXISTS public.meme_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id uuid NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- 22. Habilitar RLS na tabela meme_downloads
ALTER TABLE public.meme_downloads ENABLE ROW LEVEL SECURITY;

-- 23. Políticas para meme_downloads
DROP POLICY IF EXISTS "Anyone can insert downloads" ON public.meme_downloads;

CREATE POLICY "Anyone can insert downloads"
  ON public.meme_downloads
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 24. Verificar se a tabela user_favorites existe
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  meme_id uuid NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, meme_id)
);

-- 25. Habilitar RLS na tabela user_favorites
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- 26. Políticas para user_favorites
DROP POLICY IF EXISTS "Users can manage own favorites" ON public.user_favorites;

CREATE POLICY "Users can manage own favorites"
  ON public.user_favorites
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 27. Verificar se a tabela meme_views existe
CREATE TABLE IF NOT EXISTS public.meme_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id uuid NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- 28. Habilitar RLS na tabela meme_views
ALTER TABLE public.meme_views ENABLE ROW LEVEL SECURITY;

-- 29. Políticas para meme_views
DROP POLICY IF EXISTS "Anyone can insert views" ON public.meme_views;

CREATE POLICY "Anyone can insert views"
  ON public.meme_views
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 30. Verificar se a tabela reports existe
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id uuid NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES public.profiles(id),
  reason text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at timestamptz DEFAULT now()
);

-- 31. Habilitar RLS na tabela reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 32. Políticas para reports
DROP POLICY IF EXISTS "Anyone can insert reports" ON public.reports;

CREATE POLICY "Anyone can insert reports"
  ON public.reports
  FOR INSERT
  TO public
  WITH CHECK (true);

-- 33. Verificar se a tabela meme_tags existe
CREATE TABLE IF NOT EXISTS public.meme_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id uuid NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 34. Habilitar RLS na tabela meme_tags
ALTER TABLE public.meme_tags ENABLE ROW LEVEL SECURITY;

-- 35. Políticas para meme_tags
DROP POLICY IF EXISTS "Public can view meme tags" ON public.meme_tags;

CREATE POLICY "Public can view meme tags"
  ON public.meme_tags
  FOR SELECT
  TO public
  USING (true);

-- 36. Verificar se a tabela meme_tags tem índices
CREATE INDEX IF NOT EXISTS idx_meme_tags_meme_id ON public.meme_tags(meme_id);
CREATE INDEX IF NOT EXISTS idx_meme_tags_tag ON public.meme_tags(tag);

-- 37. Verificar se a tabela memes tem todas as colunas necessárias
DO $$
BEGIN
  -- Adicionar colunas que podem estar faltando
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'memes' AND column_name = 'ocr_text') THEN
    ALTER TABLE public.memes ADD COLUMN ocr_text text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'memes' AND column_name = 'like_count') THEN
    ALTER TABLE public.memes ADD COLUMN like_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'memes' AND column_name = 'share_count') THEN
    ALTER TABLE public.memes ADD COLUMN share_count integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'memes' AND column_name = 'updated_at') THEN
    ALTER TABLE public.memes ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- 38. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 39. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_memes_updated_at ON public.memes;
CREATE TRIGGER update_memes_updated_at
  BEFORE UPDATE ON public.memes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 40. Verificar se há dados de teste na tabela memes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.memes LIMIT 1) THEN
    -- Inserir um meme de teste se a tabela estiver vazia
    INSERT INTO public.memes (
      title, 
      description, 
      image_url, 
      image_path, 
      category_id,
      uploaded_by,
      status,
      view_count,
      download_count,
      created_at
    ) VALUES (
      'Meme de Teste',
      'Este é um meme de teste para verificar se o sistema está funcionando',
      'https://via.placeholder.com/400x300.png?text=Meme+de+Teste',
      'teste.jpg',
      (SELECT id FROM public.categories LIMIT 1),
      NULL,
      'approved',
      0,
      0,
      now()
    );
  END IF;
END $$;

-- 41. Finalizar com commit
COMMIT;

-- 42. Mensagem de sucesso
SELECT 'Configuração de upload anônimo concluída com sucesso!' as status; 