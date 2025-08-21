-- MIGRAÇÃO PARA MULTI-CATEGORIAS
-- Execute este script no Supabase SQL Editor

-- 1. Criar tabela para relacionar memes com múltiplas categorias
CREATE TABLE IF NOT EXISTS meme_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meme_id UUID REFERENCES memes(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meme_id, category_id)
);

-- 2. Criar tabela para interesses dos usuários
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  weight INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category_id)
);

-- 3. Criar tabela para seguir usuários
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 4. Adicionar colunas ao perfil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- 5. Migrar dados existentes (cada meme mantém sua categoria principal)
INSERT INTO meme_categories (meme_id, category_id)
SELECT id, category_id FROM memes 
WHERE category_id IS NOT NULL 
AND NOT EXISTS (
  SELECT 1 FROM meme_categories mc WHERE mc.meme_id = memes.id
);

-- 6. Criar RLS policies para as novas tabelas
-- meme_categories
CREATE POLICY "Users can view meme categories" ON meme_categories
  FOR SELECT USING (true);

CREATE POLICY "Users can insert meme categories" ON meme_categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update meme categories" ON meme_categories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete meme categories" ON meme_categories
  FOR DELETE USING (auth.role() = 'authenticated');

-- user_interests
CREATE POLICY "Users can view their own interests" ON user_interests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own interests" ON user_interests
  FOR ALL USING (auth.uid() = user_id);

-- user_follows
CREATE POLICY "Users can view follows" ON user_follows
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own follows" ON user_follows
  FOR ALL USING (auth.uid() = follower_id);

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_meme_categories_meme_id ON meme_categories(meme_id);
CREATE INDEX IF NOT EXISTS idx_meme_categories_category_id ON meme_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower_id ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following_id ON user_follows(following_id);

-- 8. Função para obter categorias de um meme
CREATE OR REPLACE FUNCTION get_meme_categories(meme_uuid UUID)
RETURNS TABLE(category_id UUID, category_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name
  FROM meme_categories mc
  JOIN categories c ON mc.category_id = c.id
  WHERE mc.meme_id = meme_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Função para obter memes por categorias
CREATE OR REPLACE FUNCTION get_memes_by_categories(category_ids UUID[])
RETURNS TABLE(meme_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT mc.meme_id
  FROM meme_categories mc
  WHERE mc.category_id = ANY(category_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Verificar se as tabelas foram criadas
SELECT 
  'meme_categories' as table_name,
  COUNT(*) as record_count
FROM meme_categories
UNION ALL
SELECT 
  'user_interests' as table_name,
  COUNT(*) as record_count
FROM user_interests
UNION ALL
SELECT 
  'user_follows' as table_name,
  COUNT(*) as record_count
FROM user_follows; 