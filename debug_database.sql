-- ================================================
-- QUERIES DE DEBUG PARA VERIFICAR O BANCO
-- ================================================
-- Execute estas queries no SQL Editor do Supabase para verificar os dados

-- 1. Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('memes', 'pending_memes', 'categories', 'profiles');

-- 2. Contar registros em cada tabela
SELECT 
  (SELECT COUNT(*) FROM memes) as total_memes,
  (SELECT COUNT(*) FROM memes WHERE status = 'approved') as memes_aprovados,
  (SELECT COUNT(*) FROM pending_memes) as total_pending,
  (SELECT COUNT(*) FROM pending_memes WHERE status = 'pending') as pending_aguardando,
  (SELECT COUNT(*) FROM categories) as total_categorias,
  (SELECT COUNT(*) FROM profiles) as total_usuarios;

-- 3. Verificar estrutura da tabela memes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'memes' 
ORDER BY ordinal_position;

-- 4. Verificar estrutura da tabela pending_memes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pending_memes' 
ORDER BY ordinal_position;

-- 5. Listar categorias existentes
SELECT id, name, slug, meme_count 
FROM categories 
ORDER BY name;

-- 6. Listar memes aprovados (últimos 5)
SELECT id, title, status, category_id, created_at
FROM memes 
WHERE status = 'approved'
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Listar memes pendentes (últimos 5)
SELECT id, title, status, category_id, created_at
FROM pending_memes 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Verificar se há memes sem categoria
SELECT COUNT(*) as memes_sem_categoria
FROM memes 
WHERE category_id IS NULL;

-- 9. Verificar políticas RLS ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('memes', 'pending_memes', 'categories')
ORDER BY tablename, policyname;

-- 10. Verificar se a função check_meme_duplicates existe
SELECT proname, proargnames, prosrc
FROM pg_proc 
WHERE proname = 'check_meme_duplicates';

-- ================================================
-- QUERIES PARA CORRIGIR PROBLEMAS COMUNS
-- ================================================

-- Se não houver categorias, inserir algumas básicas:
INSERT INTO categories (name, slug, description, icon, color) VALUES
('Cotidiano', 'cotidiano', 'Memes do dia a dia', 'Coffee', 'from-yellow-500 to-orange-500'),
('Humor', 'humor', 'Memes engraçados', 'Smile', 'from-blue-500 to-purple-500'),
('Reação', 'reacao', 'Memes de reação', 'Smile', 'from-primary-500 to-blue-500')
ON CONFLICT (slug) DO NOTHING;

-- Se houver memes na tabela principal sem categoria, associar à categoria padrão:
UPDATE memes 
SET category_id = (SELECT id FROM categories WHERE slug = 'cotidiano' LIMIT 1)
WHERE category_id IS NULL;

-- Atualizar contadores das categorias:
UPDATE categories 
SET meme_count = (
  SELECT COUNT(*) 
  FROM memes 
  WHERE category_id = categories.id 
  AND status = 'approved'
);

-- ================================================
-- TESTE DE INSERÇÃO (OPCIONAL)
-- ================================================

-- Inserir um meme de teste na tabela principal (SE NECESSÁRIO):
/*
INSERT INTO memes (
  title, 
  description, 
  image_url, 
  image_path, 
  category_id, 
  status, 
  view_count, 
  download_count
) VALUES (
  'Meme de Teste',
  'Este é um meme de teste para verificar se o sistema está funcionando',
  'https://via.placeholder.com/400x400.png?text=Teste',
  'teste.png',
  (SELECT id FROM categories WHERE slug = 'cotidiano' LIMIT 1),
  'approved',
  100,
  25
);
*/

-- Inserir um meme pendente de teste (SE NECESSÁRIO):
/*
INSERT INTO pending_memes (
  title, 
  description, 
  image_url, 
  image_path, 
  category_id, 
  status
) VALUES (
  'Meme Pendente de Teste',
  'Este é um meme pendente para testar o painel administrativo',
  'https://via.placeholder.com/400x400.png?text=Pendente',
  'pendente.png',
  (SELECT id FROM categories WHERE slug = 'humor' LIMIT 1),
  'pending'
);
*/ 