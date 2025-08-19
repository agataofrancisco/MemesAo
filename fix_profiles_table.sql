-- SCRIPT PARA CORRIGIR TABELA PROFILES
-- Execute este script no SQL Editor do Supabase

-- =====================================================
-- 1. VERIFICAR TABELA PROFILES
-- =====================================================

-- Verificar se a tabela profiles existe
SELECT 
  'profiles table exists' as check_item,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') as result
UNION ALL
SELECT 
  'profiles has data' as check_item,
  EXISTS (SELECT 1 FROM public.profiles LIMIT 1) as result;

-- =====================================================
-- 2. VERIFICAR ESTRUTURA
-- =====================================================

-- Verificar estrutura da tabela profiles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =====================================================
-- 3. VERIFICAR RLS E POLÍTICAS
-- =====================================================

-- Verificar se RLS está habilitado
SELECT 
  'RLS enabled' as check_item,
  EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND rowsecurity = true
  ) as result;

-- Verificar políticas
SELECT 
  policyname,
  roles,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- =====================================================
-- 4. CORRIGIR SE NECESSÁRIO
-- =====================================================

-- Se a tabela não existir, criar
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  username text UNIQUE,
  role text DEFAULT 'user',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir leitura pública
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
CREATE POLICY "profiles_public_read"
ON public.profiles
FOR SELECT
TO public
USING (true);

-- =====================================================
-- 5. INSERIR PERFIL DE TESTE
-- =====================================================

-- Verificar se há usuários autenticados
SELECT COUNT(*) as total_users FROM auth.users;

-- Se houver usuários, criar perfis para eles
DO $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN SELECT id, email FROM auth.users LOOP
    -- Inserir perfil se não existir
    INSERT INTO public.profiles (id, username, role)
    VALUES (
      auth_user.id,
      COALESCE(auth_user.email, 'user_' || substr(auth_user.id::text, 1, 8)),
      'user'
    )
    ON CONFLICT (id) DO NOTHING;
  END LOOP;
  
  RAISE NOTICE 'Perfis criados para usuários autenticados';
END $$;

-- =====================================================
-- 6. VERIFICAR RELACIONAMENTOS
-- =====================================================

-- Verificar se a foreign key está funcionando
SELECT 
  'Foreign key working' as check_item,
  EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' 
    AND table_name = 'memes' 
    AND constraint_name = 'fk_memes_uploaded_by'
  ) as result;

-- =====================================================
-- 7. TESTE DE FUNCIONAMENTO
-- =====================================================

-- Teste de busca de perfil
SELECT 
  'Profile lookup working' as check_item,
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE username IS NOT NULL
    LIMIT 1
  ) as result;

-- =====================================================
-- 8. VERIFICAÇÃO FINAL
-- =====================================================

-- Contar perfis criados
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Verificar se há perfis com username
SELECT COUNT(*) as profiles_with_username FROM public.profiles WHERE username IS NOT NULL;

-- Mostrar alguns perfis de exemplo
SELECT id, username, role, created_at FROM public.profiles LIMIT 5;

-- =====================================================
-- 9. MENSAGEM DE SUCESSO
-- =====================================================

SELECT '✅ Tabela profiles corrigida e configurada!' as status;
SELECT '✅ RLS habilitado' as rls;
SELECT '✅ Políticas criadas' as policies;
SELECT '✅ Perfis criados para usuários existentes' as profiles;
SELECT '✅ Upload com conta deve funcionar agora!' as resultado; 