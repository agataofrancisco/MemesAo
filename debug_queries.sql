-- ================================================
-- QUERIES DE DIAGNÓSTICO ESPECÍFICO
-- ================================================
-- Execute estas queries uma por uma no SQL Editor do Supabase

-- 1. Verificar memes aprovados
SELECT 
  id, title, status, category_id, created_at,
  (SELECT name FROM categories WHERE id = memes.category_id) as category_name
FROM memes 
WHERE status = 'approved' 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Verificar memes pendentes
SELECT 
  id, title, status, category_id, created_at,
  (SELECT name FROM categories WHERE id = memes.category_id) as category_name
FROM memes 
WHERE status = 'pending' 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Verificar estrutura exata da tabela memes
\d memes;

-- 4. Verificar se há problema com as foreign keys
SELECT 
  m.id, m.title, m.status, m.category_id,
  c.name as category_name,
  CASE 
    WHEN m.category_id IS NULL THEN 'SEM CATEGORIA'
    WHEN c.id IS NULL THEN 'CATEGORIA INEXISTENTE'
    ELSE 'OK'
  END as categoria_status
FROM memes m
LEFT JOIN categories c ON m.category_id = c.id
WHERE m.status = 'approved'
ORDER BY m.created_at DESC;

-- 5. Verificar se as queries do AdminDashboard funcionam
-- Esta é a query exata que o AdminDashboard usa:
SELECT 
  memes.*,
  categories.id as cat_id,
  categories.name as cat_name,
  categories.slug as cat_slug,
  categories.icon as cat_icon,
  categories.color as cat_color,
  profiles.username as profile_username,
  profiles.avatar_url as profile_avatar
FROM memes
LEFT JOIN categories ON memes.category_id = categories.id
LEFT JOIN profiles ON memes.uploaded_by = profiles.id
ORDER BY memes.created_at DESC
LIMIT 5;

-- 6. Verificar query de memes do AdminDashboard
SELECT 
  memes.*,
  profiles.username as profile_username,
  profiles.avatar_url as profile_avatar
FROM memes
LEFT JOIN profiles ON memes.uploaded_by = profiles.id
WHERE memes.status = 'pending'
ORDER BY memes.created_at DESC;

-- 7. Verificar se há problema com RLS (Row Level Security)
-- Mostrar políticas ativas
SELECT schemaname, tablename, policyname, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('memes', 'memes')
ORDER BY tablename, policyname;

-- 8. Testar acesso anônimo aos memes (como o site faz)
SET ROLE anon;
SELECT COUNT(*) as memes_visiveis_anon FROM memes WHERE status = 'approved';
RESET ROLE;

-- 9. Verificar se as categorias têm contadores corretos
SELECT 
  name, 
  slug, 
  meme_count,
  (SELECT COUNT(*) FROM memes WHERE category_id = categories.id AND status = 'approved') as real_count
FROM categories 
ORDER BY meme_count DESC;

-- 10. Verificar estrutura de dados que o frontend espera
SELECT 
  id,
  title,
  description,
  image_url,
  image_path,
  category_id,
  status,
  view_count,
  download_count,
  created_at,
  (
    SELECT json_build_object(
      'id', categories.id,
      'name', categories.name,
      'slug', categories.slug,
      'icon', categories.icon,
      'color', categories.color
    )
    FROM categories 
    WHERE categories.id = memes.category_id
  ) as categories
FROM memes 
WHERE status = 'approved'
LIMIT 3; 