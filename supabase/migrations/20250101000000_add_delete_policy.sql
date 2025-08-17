-- Adicionar política de DELETE para memes (faltava nas migrações anteriores)
-- Permite que administradores e moderadores deletem qualquer meme

CREATE POLICY "Admins can delete any meme"
  ON memes
  FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'moderator')
  ));

-- Adicionar políticas de DELETE para tabelas relacionadas (para permitir cascade manual)

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