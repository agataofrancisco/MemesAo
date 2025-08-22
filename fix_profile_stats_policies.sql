-- Script para corrigir políticas RLS e permitir acesso às estatísticas do usuário
-- Execute este script no Supabase SQL Editor

-- 1. Verificar políticas existentes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('meme_downloads', 'user_favorites', 'meme_shares', 'memes')
ORDER BY tablename, policyname;

-- 2. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('meme_downloads', 'user_favorites', 'meme_shares', 'memes');

-- 3. Corrigir políticas para meme_downloads
-- Permitir que usuários autenticados leiam seus próprios downloads
DROP POLICY IF EXISTS "Users can read own downloads" ON public.meme_downloads;
CREATE POLICY "Users can read own downloads"
  ON public.meme_downloads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Permitir que moderadores/admins leiam todos
DROP POLICY IF EXISTS "Moderators can read all downloads" ON public.meme_downloads;
CREATE POLICY "Moderators can read all downloads"
  ON public.meme_downloads
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('moderator','admin')
  ));

-- 4. Corrigir políticas para user_favorites
-- Permitir que usuários autenticados leiam seus próprios favoritos
DROP POLICY IF EXISTS "Users can read own favorites" ON public.user_favorites;
CREATE POLICY "Users can read own favorites"
  ON public.user_favorites
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Permitir que moderadores/admins leiam todos
DROP POLICY IF EXISTS "Moderators can read all favorites" ON public.user_favorites;
CREATE POLICY "Moderators can read all favorites"
  ON public.user_favorites
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('moderator','admin')
  ));

-- 5. Corrigir políticas para meme_shares
-- Permitir que usuários autenticados leiam seus próprios compartilhamentos
DROP POLICY IF EXISTS "Users can read own shares" ON public.meme_shares;
CREATE POLICY "Users can read own shares"
  ON public.meme_shares
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Permitir que moderadores/admins leiam todos
DROP POLICY IF EXISTS "Moderators can read all shares" ON public.meme_shares;
CREATE POLICY "Moderators can read all shares"
  ON public.meme_shares
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role IN ('moderator','admin')
  ));

-- 6. Corrigir políticas para memes (para contar memes do usuário)
-- Permitir que usuários autenticados leiam seus próprios memes
DROP POLICY IF EXISTS "Users can read own memes" ON public.memes;
CREATE POLICY "Users can read own memes"
  ON public.memes
  FOR SELECT
  TO authenticated
  USING (uploaded_by = auth.uid());

-- 7. Verificar se as políticas foram criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('meme_downloads', 'user_favorites', 'meme_shares', 'memes')
ORDER BY tablename, policyname;

-- 8. Testar consultas (substitua 'USER_ID_AQUI' pelo ID real do usuário)
-- Teste 1: Contar downloads do usuário
SELECT COUNT(*) as user_downloads 
FROM public.meme_downloads 
WHERE user_id = '126e05ef-bc48-4358-b017-6b84ef5dbd37';

-- Teste 2: Contar favoritos do usuário
SELECT COUNT(*) as user_favorites 
FROM public.user_favorites 
WHERE user_id = '126e05ef-bc48-4358-b017-6b84ef5dbd37';

-- Teste 3: Contar compartilhamentos do usuário
SELECT COUNT(*) as user_shares 
FROM public.meme_shares 
WHERE user_id = '126e05ef-bc48-4358-b017-6b84ef5dbd37';

-- Teste 4: Contar memes do usuário
SELECT COUNT(*) as user_memes 
FROM public.memes 
WHERE uploaded_by = '126e05ef-bc48-4358-b017-6b84ef5dbd37';

-- 9. Verificar se há dados para o usuário
SELECT 
  'meme_downloads' as table_name,
  COUNT(*) as count
FROM public.meme_downloads 
WHERE user_id = '126e05ef-bc48-4358-b017-6b84ef5dbd37'
UNION ALL
SELECT 
  'user_favorites' as table_name,
  COUNT(*) as count
FROM public.user_favorites 
WHERE user_id = '126e05ef-bc48-4358-b017-6b84ef5dbd37'
UNION ALL
SELECT 
  'meme_shares' as table_name,
  COUNT(*) as count
FROM public.meme_shares 
WHERE user_id = '126e05ef-bc48-4358-b017-6b84ef5dbd37'
UNION ALL
SELECT 
  'memes' as table_name,
  COUNT(*) as count
FROM public.memes 
WHERE uploaded_by = '126e05ef-bc48-4358-b017-6b84ef5dbd37'; 