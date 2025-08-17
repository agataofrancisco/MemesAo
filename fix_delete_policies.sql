-- Script para corrigir políticas de DELETE faltantes
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se as políticas já existem e removê-las se necessário
DROP POLICY IF EXISTS "Admins can delete any meme" ON memes;
DROP POLICY IF EXISTS "Admins can delete any favorite" ON user_favorites;
DROP POLICY IF EXISTS "Admins can delete any download record" ON meme_downloads;
DROP POLICY IF EXISTS "Admins can delete any view record" ON meme_views;
DROP POLICY IF EXISTS "Admins can delete any tag" ON meme_tags;

-- 2. Criar políticas de DELETE para memes
CREATE POLICY "Admins can delete any meme"
  ON memes
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  ));

-- 3. Criar políticas de DELETE para tabelas relacionadas

-- user_favorites
CREATE POLICY "Admins can delete any favorite"
  ON user_favorites
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  ));

-- meme_downloads  
CREATE POLICY "Admins can delete any download record"
  ON meme_downloads
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  ));

-- meme_views
CREATE POLICY "Admins can delete any view record"
  ON meme_views
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  ));

-- meme_tags
CREATE POLICY "Admins can delete any tag"
  ON meme_tags
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  ));

-- 4. Verificar se o usuário atual tem role de admin
SELECT 
  auth.uid() as current_user_id,
  profiles.role as current_role
FROM profiles 
WHERE profiles.id = auth.uid();

-- 5. Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename IN ('memes', 'user_favorites', 'meme_downloads', 'meme_views', 'meme_tags')
  AND cmd = 'DELETE'
ORDER BY tablename, policyname; 