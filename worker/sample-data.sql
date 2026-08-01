-- Dados de exemplo do MemesAo (categorias + memes sample)
-- Compatível com D1/SQLite. Ids fixos para referências estáveis.

INSERT OR IGNORE INTO categories (id, name, slug, description, icon, color, created_at) VALUES
  ('cat-reacao', 'Reação', 'reacao', 'Expressões e reações', 'Smile', 'from-primary-500 to-blue-500', datetime('now')),
  ('cat-games', 'Games', 'games', 'Mundo dos jogos', 'Gamepad', 'from-purple-500 to-pink-500', datetime('now')),
  ('cat-filmes-tv', 'Filmes/TV', 'filmes-tv', 'Cinema e televisão', 'Film', 'from-teal-500 to-green-500', datetime('now')),
  ('cat-esportes', 'Esportes', 'esportes', 'Futebol e outros esportes', 'Trophy', 'from-accent-500 to-red-500', datetime('now')),
  ('cat-trabalho', 'Trabalho', 'trabalho', 'Vida profissional', 'Briefcase', 'from-indigo-500 to-purple-500', datetime('now')),
  ('cat-amor', 'Amor', 'amor', 'Relacionamentos', 'Heart', 'from-pink-500 to-red-500', datetime('now')),
  ('cat-musica', 'Música', 'musica', 'Artistas e música', 'Music', 'from-green-500 to-teal-500', datetime('now')),
  ('cat-cotidiano', 'Cotidiano', 'cotidiano', 'Dia a dia angolano', 'Coffee', 'from-yellow-500 to-orange-500', datetime('now')),
  ('cat-politica', 'Política', 'politica', 'Política angolana', 'Users', 'from-red-500 to-orange-500', datetime('now')),
  ('cat-humor', 'Humor', 'humor', 'Piadas e comédia', 'Smile', 'from-blue-500 to-purple-500', datetime('now')),
  ('cat-outros', 'Outros', 'outros', 'Memes que não se encaixam em outras categorias', 'Tag', 'from-gray-500 to-gray-600', datetime('now'));

INSERT OR IGNORE INTO memes (id, title, description, image_url, image_path, file_size, format, category_id, uploaded_by, status, view_count, download_count, share_count, ocr_text, created_at, updated_at) VALUES
  ('meme-1', 'Quando é sexta-feira', 'A alegria de chegar ao fim da semana', 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&h=400&fit=crop', NULL, NULL, 'jpg', 'cat-reacao', NULL, 'approved', 1234, 567, 89, 'sexta feira finalmente chegou', datetime('now', '-2 days'), datetime('now')),
  ('meme-2', 'Segunda-feira chegando', 'O terror de começar uma nova semana', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=400&fit=crop', NULL, NULL, 'jpg', 'cat-humor', NULL, 'approved', 2134, 789, 156, 'segunda feira de novo não', datetime('now', '-1 day'), datetime('now')),
  ('meme-3', 'Quando termina o mês', 'A realidade financeira angolana', 'https://images.unsplash.com/photo-1554224154-26032fced8bd?w=400&h=400&fit=crop', NULL, NULL, 'jpg', 'cat-cotidiano', NULL, 'approved', 3456, 1234, 234, 'quando o salário acaba antes do mês', datetime('now', '-6 hours'), datetime('now')),
  ('meme-4', 'Futebol Angolano', 'Paixão nacional pelos nossos clubes', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', NULL, NULL, 'jpg', 'cat-games', NULL, 'approved', 987, 432, 45, 'golo do petro de luanda', datetime('now', '-12 hours'), datetime('now')),
  ('meme-5', 'Quando chove em Luanda', 'O caos que se instala na capital', 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=400&h=400&fit=crop', NULL, NULL, 'jpg', 'cat-cotidiano', NULL, 'approved', 1567, 678, 112, 'chuva em luanda é o fim do mundo', datetime('now', '-3 hours'), datetime('now')),
  ('meme-6', 'Hora do almoço', 'A fome que bate no meio do dia', 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop', NULL, NULL, 'jpg', 'cat-cotidiano', NULL, 'approved', 2345, 890, 167, 'hora de comer muamba', datetime('now', '-1 hour'), datetime('now')),
  ('meme-7', 'Meme Pendente 1', 'Este meme está aguardando aprovação', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop', NULL, NULL, 'jpg', 'cat-humor', NULL, 'pending', 0, 0, 0, 'meme engraçado aguardando aprovação', datetime('now', '-30 minutes'), datetime('now')),
  ('meme-8', 'Meme Pendente 2', 'Outro meme para moderação', 'https://images.unsplash.com/photo-1574790398297-6d9900ea3865?w=400&h=400&fit=crop', NULL, NULL, 'jpg', 'cat-reacao', NULL, 'pending', 0, 0, 0, 'reação engraçada para aprovar', datetime('now', '-15 minutes'), datetime('now'));
