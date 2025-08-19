-- =====================================================
-- EXECUTE ESTE CÓDIGO NO SQL EDITOR DO SUPABASE
-- =====================================================

-- 1. Primeiro, vamos remover todas as políticas de DELETE existentes (se houver)
DROP POLICY IF EXISTS "Admins can delete any meme" ON memes;
DROP POLICY IF EXISTS "Admins can delete any favorite" ON user_favorites;
DROP POLICY IF EXISTS "Admins can delete any download record" ON meme_downloads;
DROP POLICY IF EXISTS "Admins can delete any view record" ON meme_views;
DROP POLICY IF EXISTS "Admins can delete any tag" ON meme_tags;

-- 2. Criar política de DELETE para a tabela MEMES (principal)
CREATE POLICY "Admins can delete any meme"
ON memes
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- 3. Criar política de DELETE para USER_FAVORITES
CREATE POLICY "Admins can delete any favorite"
ON user_favorites
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- 4. Criar política de DELETE para MEME_DOWNLOADS
CREATE POLICY "Admins can delete any download record"
ON meme_downloads
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- 5. Criar política de DELETE para MEME_VIEWS
CREATE POLICY "Admins can delete any view record"
ON meme_views
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- 6. Criar política de DELETE para MEME_TAGS
CREATE POLICY "Admins can delete any tag"
ON meme_tags
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  )
);

-- 7. Verificar se seu usuário tem role de admin
SELECT 
  auth.uid() as seu_user_id,
  profiles.role as sua_role,
  profiles.username as seu_username
FROM profiles 
WHERE profiles.id = auth.uid();

-- 8. Verificar se as políticas foram criadas corretamente
SELECT 
  tablename as tabela,
  policyname as politica,
  cmd as comando
FROM pg_policies 
WHERE tablename IN ('memes', 'user_favorites', 'meme_downloads', 'meme_views', 'meme_tags')
  AND cmd = 'DELETE'
ORDER BY tablename;

-- 9. Se sua role não for 'admin' ou 'moderator', execute este comando para se tornar admin:
-- UPDATE profiles SET role = 'admin' WHERE id = auth.uid();

SELECT 'Políticas de DELETE criadas com sucesso! Agora você pode deletar memes no Admin Dashboard.' as resultado; 