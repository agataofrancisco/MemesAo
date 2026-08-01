-- Categorias padrão do MemesAo (usadas apenas se a migração não trouxer as originais)
INSERT OR IGNORE INTO categories (id, name, slug, description, icon, color, created_at) VALUES
  (lower(hex(randomblob(16))), 'Reação', 'reacao', 'Expressões e reações', 'Smile', 'from-primary-500 to-blue-500', datetime('now')),
  (lower(hex(randomblob(16))), 'Games', 'games', 'Mundo dos jogos', 'Gamepad', 'from-purple-500 to-pink-500', datetime('now')),
  (lower(hex(randomblob(16))), 'Filmes/TV', 'filmes-tv', 'Cinema e televisão', 'Film', 'from-teal-500 to-green-500', datetime('now')),
  (lower(hex(randomblob(16))), 'Esportes', 'esportes', 'Futebol e outros esportes', 'Trophy', 'from-accent-500 to-red-500', datetime('now')),
  (lower(hex(randomblob(16))), 'Trabalho', 'trabalho', 'Vida profissional', 'Briefcase', 'from-indigo-500 to-purple-500', datetime('now')),
  (lower(hex(randomblob(16))), 'Amor', 'amor', 'Relacionamentos', 'Heart', 'from-pink-500 to-red-500', datetime('now')),
  (lower(hex(randomblob(16))), 'Música', 'musica', 'Artistas e música', 'Music', 'from-green-500 to-teal-500', datetime('now')),
  (lower(hex(randomblob(16))), 'Cotidiano', 'cotidiano', 'Dia a dia angolano', 'Coffee', 'from-yellow-500 to-orange-500', datetime('now')),
  (lower(hex(randomblob(16))), 'Política', 'politica', 'Política angolana', 'Users', 'from-red-500 to-orange-500', datetime('now')),
  (lower(hex(randomblob(16))), 'Humor', 'humor', 'Piadas e comédia', 'Smile', 'from-blue-500 to-purple-500', datetime('now')),
  (lower(hex(randomblob(16))), 'Outros', 'outros', 'Memes que não se encaixam em outras categorias', 'Tag', 'from-gray-500 to-gray-600', datetime('now'));
