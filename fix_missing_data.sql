-- ================================================
-- SCRIPT PARA CORRIGIR DADOS FALTANDO
-- ================================================
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, verificar se há categorias
SELECT COUNT(*) as total_categorias FROM categories;

-- 2. Se não houver categorias, inserir algumas básicas
INSERT INTO categories (name, slug, description, icon, color) VALUES
('Cotidiano', 'cotidiano', 'Memes do dia a dia angolano', 'Coffee', 'from-yellow-500 to-orange-500'),
('Humor', 'humor', 'Piadas e comédia', 'Smile', 'from-blue-500 to-purple-500'),
('Reação', 'reacao', 'Expressões e reações', 'Smile', 'from-primary-500 to-blue-500'),
('Games', 'games', 'Mundo dos jogos', 'Gamepad', 'from-purple-500 to-pink-500'),
('Filmes/TV', 'filmes-tv', 'Cinema e televisão', 'Film', 'from-teal-500 to-green-500'),
('Esportes', 'esportes', 'Futebol e outros esportes', 'Trophy', 'from-accent-500 to-red-500'),
('Trabalho', 'trabalho', 'Vida profissional', 'Briefcase', 'from-indigo-500 to-purple-500'),
('Amor', 'amor', 'Relacionamentos', 'Heart', 'from-pink-500 to-red-500'),
('Música', 'musica', 'Artistas e música', 'Music', 'from-green-500 to-teal-500'),
('Política', 'politica', 'Política angolana', 'Users', 'from-red-500 to-orange-500'),
('Outros', 'outros', 'Memes diversos', 'Tag', 'from-gray-500 to-gray-600')
ON CONFLICT (slug) DO NOTHING;

-- 3. Verificar se há memes aprovados
SELECT COUNT(*) as memes_aprovados FROM memes WHERE status = 'approved';

-- 4. Se não houver memes, inserir alguns de exemplo
DO $$
DECLARE
  categoria_cotidiano_id UUID;
  categoria_humor_id UUID;
  categoria_reacao_id UUID;
  categoria_games_id UUID;
  meme_count INTEGER;
BEGIN
  -- Verificar se já existem memes
  SELECT COUNT(*) INTO meme_count FROM memes WHERE status = 'approved';
  
  -- Se não houver memes aprovados, criar alguns exemplos
  IF meme_count = 0 THEN
    -- Obter IDs das categorias
    SELECT id INTO categoria_cotidiano_id FROM categories WHERE slug = 'cotidiano' LIMIT 1;
    SELECT id INTO categoria_humor_id FROM categories WHERE slug = 'humor' LIMIT 1;
    SELECT id INTO categoria_reacao_id FROM categories WHERE slug = 'reacao' LIMIT 1;
    SELECT id INTO categoria_games_id FROM categories WHERE slug = 'games' LIMIT 1;
    
    -- Inserir memes de exemplo
    INSERT INTO memes (
      title, 
      description, 
      image_url, 
      image_path, 
      category_id, 
      status, 
      view_count, 
      download_count,
      ocr_text,
      created_at
    ) VALUES 
    (
      'Quando é sexta-feira',
      'A alegria de chegar ao fim da semana',
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&h=400&fit=crop',
      'sexta-feira.jpg',
      categoria_reacao_id,
      'approved',
      1234,
      567,
      'sexta feira finalmente chegou',
      NOW() - INTERVAL '2 days'
    ),
    (
      'Segunda-feira chegando',
      'O terror de começar uma nova semana',
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=400&fit=crop',
      'segunda-feira.jpg',
      categoria_humor_id,
      'approved',
      2134,
      789,
      'segunda feira de novo não',
      NOW() - INTERVAL '1 day'
    ),
    (
      'Quando termina o mês',
      'A realidade financeira angolana',
      'https://images.unsplash.com/photo-1554224154-26032fced8bd?w=400&h=400&fit=crop',
      'fim-mes.jpg',
      categoria_cotidiano_id,
      'approved',
      3456,
      1234,
      'quando o salário acaba antes do mês',
      NOW() - INTERVAL '6 hours'
    ),
    (
      'Futebol Angolano',
      'Paixão nacional pelos nossos clubes',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
      'futebol.jpg',
      categoria_games_id,
      'approved',
      987,
      432,
      'golo do petro de luanda',
      NOW() - INTERVAL '12 hours'
    ),
    (
      'Quando chove em Luanda',
      'O caos que se instala na capital',
      'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=400&fit=crop',
      'chuva-luanda.jpg',
      categoria_cotidiano_id,
      'approved',
      1567,
      678,
      'chuva em luanda é o fim do mundo',
      NOW() - INTERVAL '3 hours'
    ),
    (
      'Hora do almoço',
      'A fome que bate no meio do dia',
      'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
      'almoco.jpg',
      categoria_cotidiano_id,
      'approved',
      2345,
      890,
      'hora de comer muamba',
      NOW() - INTERVAL '1 hour'
    );
    
    RAISE NOTICE 'Memes de exemplo inseridos com sucesso!';
  ELSE
    RAISE NOTICE 'Já existem % memes aprovados. Nenhum exemplo inserido.', meme_count;
  END IF;
END $$;

-- 5. Atualizar contadores das categorias
UPDATE categories 
SET meme_count = (
  SELECT COUNT(*) 
  FROM memes 
  WHERE category_id = categories.id 
  AND status = 'approved'
);

-- 6. Inserir alguns memes pendentes de exemplo para testar o painel admin
DO $$
DECLARE
  categoria_humor_id UUID;
  categoria_reacao_id UUID;
  pending_count INTEGER;
BEGIN
  -- Verificar se já existem memes pendentes
  SELECT COUNT(*) INTO pending_count FROM memes WHERE status = 'pending';
  
  -- Se não houver memes pendentes, criar alguns exemplos
  IF pending_count = 0 THEN
    -- Obter IDs das categorias
    SELECT id INTO categoria_humor_id FROM categories WHERE slug = 'humor' LIMIT 1;
    SELECT id INTO categoria_reacao_id FROM categories WHERE slug = 'reacao' LIMIT 1;
    
    -- Inserir memes pendentes de exemplo
    INSERT INTO memes (
      title, 
      description, 
      image_url, 
      image_path, 
      category_id, 
      status,
      extracted_text,
      created_at
    ) VALUES 
    (
      'Meme Pendente 1',
      'Este meme está aguardando aprovação',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop',
      'pendente1.jpg',
      categoria_humor_id,
      'pending',
      'meme engraçado aguardando aprovação',
      NOW() - INTERVAL '30 minutes'
    ),
    (
      'Meme Pendente 2',
      'Outro meme para moderação',
      'https://images.unsplash.com/photo-1574790398297-6d9900ea3865?w=400&h=400&fit=crop',
      'pendente2.jpg',
      categoria_reacao_id,
      'pending',
      'reação engraçada para aprovar',
      NOW() - INTERVAL '15 minutes'
    );
    
    RAISE NOTICE 'Memes pendentes de exemplo inseridos!';
  ELSE
    RAISE NOTICE 'Já existem % memes pendentes.', pending_count;
  END IF;
END $$;

-- 7. Verificar resultado final
SELECT 
  (SELECT COUNT(*) FROM categories) as total_categorias,
  (SELECT COUNT(*) FROM memes WHERE status = 'approved') as memes_aprovados,
  (SELECT COUNT(*) FROM memes WHERE status = 'pending') as memes_pendentes,
  'Dados inseridos com sucesso!' as status;

-- 8. Listar categorias criadas
SELECT name, slug, meme_count FROM categories ORDER BY name; 