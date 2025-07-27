/*
  # Correção das políticas RLS e funções

  1. Correções
    - Remove todas as políticas existentes da tabela memes
    - Recria políticas com permissões corretas
    - Adiciona trigger para definir uploaded_by automaticamente
    - Melhora função handle_new_user
    - Adiciona memes de exemplo

  2. Segurança
    - Políticas permissivas para upload
    - Leitura pública de memes aprovados
    - Usuários podem ver seus próprios memes
*/

-- Remover TODAS as políticas existentes da tabela memes
DROP POLICY IF EXISTS "Authenticated users can upload memes" ON memes;
DROP POLICY IF EXISTS "Anyone can read approved memes" ON memes;
DROP POLICY IF EXISTS "Users can read own memes" ON memes;
DROP POLICY IF EXISTS "Users can update own pending memes" ON memes;
DROP POLICY IF EXISTS "Moderators can update meme status" ON memes;

-- Recriar políticas com nomes únicos
CREATE POLICY "memes_upload_policy"
  ON memes
  FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Permitir qualquer usuário autenticado fazer upload

CREATE POLICY "memes_public_read_policy"
  ON memes
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "memes_owner_read_policy"
  ON memes
  FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

CREATE POLICY "memes_owner_update_policy"
  ON memes
  FOR UPDATE
  TO authenticated
  USING (uploaded_by = auth.uid() AND status = 'pending')
  WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "memes_moderator_update_policy"
  ON memes
  FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('moderator', 'admin')
  ));

-- Função para definir uploaded_by automaticamente
CREATE OR REPLACE FUNCTION set_uploaded_by()
RETURNS trigger AS $$
BEGIN
  -- Se uploaded_by não foi definido, usar o usuário atual
  IF NEW.uploaded_by IS NULL THEN
    NEW.uploaded_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger para definir uploaded_by automaticamente
DROP TRIGGER IF EXISTS trigger_set_uploaded_by ON memes;
CREATE TRIGGER trigger_set_uploaded_by
  BEFORE INSERT ON memes
  FOR EACH ROW EXECUTE FUNCTION set_uploaded_by();

-- Melhorar função handle_new_user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING; -- Evitar erro se perfil já existir
  RETURN new;
END;
$$ language plpgsql security definer;

-- Inserir alguns memes de exemplo para teste
DO $$
DECLARE
  categoria_reacao_id uuid;
  categoria_games_id uuid;
  categoria_cotidiano_id uuid;
  exemplo_count integer;
BEGIN
  -- Verificar se já existem memes de exemplo
  SELECT COUNT(*) INTO exemplo_count FROM memes WHERE image_path LIKE 'exemplo%';
  
  -- Só inserir se não existirem memes de exemplo
  IF exemplo_count = 0 THEN
    -- Obter IDs das categorias
    SELECT id INTO categoria_reacao_id FROM categories WHERE slug = 'reacao' LIMIT 1;
    SELECT id INTO categoria_games_id FROM categories WHERE slug = 'games' LIMIT 1;
    SELECT id INTO categoria_cotidiano_id FROM categories WHERE slug = 'cotidiano' LIMIT 1;

    -- Inserir memes de exemplo
    INSERT INTO memes (
      title, 
      description, 
      image_url, 
      image_path, 
      category_id, 
      ocr_text, 
      status,
      view_count,
      download_count
    ) VALUES 
    (
      'Quando é sexta-feira',
      'A alegria de chegar ao fim da semana',
      'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
      'exemplo1.jpg',
      categoria_reacao_id,
      'sexta-feira chegou finalmente',
      'approved',
      1234,
      567
    ),
    (
      'Segunda-feira chegando',
      'O terror de começar uma nova semana',
      'https://images.pexels.com/photos/1264210/pexels-photo-1264210.jpeg?auto=compress&cs=tinysrgb&w=800',
      'exemplo2.jpg',
      categoria_games_id,
      'segunda-feira de novo não',
      'approved',
      2134,
      789
    ),
    (
      'Quando termina o mês',
      'A realidade financeira angolana',
      'https://images.pexels.com/photos/1382741/pexels-photo-1382741.jpeg?auto=compress&cs=tinysrgb&w=800',
      'exemplo3.jpg',
      categoria_cotidiano_id,
      'quando o salário acaba antes do mês',
      'approved',
      3456,
      1234
    ),
    (
      'Futebol Angolano',
      'Paixão nacional pelos nossos clubes',
      'https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=800',
      'exemplo4.jpg',
      categoria_games_id,
      'golo do petro de luanda',
      'approved',
      987,
      432
    ),
    (
      'Quando chove em Luanda',
      'O caos que se instala na capital',
      'https://images.pexels.com/photos/1529881/pexels-photo-1529881.jpeg?auto=compress&cs=tinysrgb&w=800',
      'exemplo5.jpg',
      categoria_cotidiano_id,
      'chuva em luanda é o fim do mundo',
      'approved',
      1567,
      678
    ),
    (
      'Hora do almoço',
      'A fome que bate no meio do dia',
      'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
      'exemplo6.jpg',
      categoria_cotidiano_id,
      'hora de comer muamba',
      'approved',
      2345,
      890
    );
  END IF;
END $$;