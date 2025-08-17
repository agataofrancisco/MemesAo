-- ================================================
-- TABELA memes COM VERIFICAÇÃO OCR
-- ================================================
-- Execute este código no SQL Editor do Supabase

-- 1. Criar tabela memes
CREATE TABLE IF NOT EXISTS memes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  format TEXT,
  category_id UUID REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  extracted_text TEXT, -- Texto extraído por OCR para verificação de duplicados
  similarity_score NUMERIC DEFAULT 0, -- Score de similaridade com memes existentes
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_memes_status ON memes(status);
CREATE INDEX IF NOT EXISTS idx_memes_uploaded_by ON memes(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_memes_category ON memes(category_id);
CREATE INDEX IF NOT EXISTS idx_memes_extracted_text ON memes USING gin(to_tsvector('portuguese', extracted_text));
CREATE INDEX IF NOT EXISTS idx_memes_similarity ON memes(similarity_score DESC);

-- 4. Políticas RLS para memes
CREATE POLICY "Usuários podem inserir próprios memes pendentes" ON memes
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Usuários podem ver próprios memes pendentes" ON memes
  FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Admins podem ver todos os memes pendentes" ON memes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins podem atualizar memes pendentes" ON memes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins podem deletar memes pendentes" ON memes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- 5. Função para verificar duplicados por OCR
CREATE OR REPLACE FUNCTION check_meme_duplicates(new_ocr_text TEXT)
RETURNS TABLE(
  meme_id UUID,
  existing_text TEXT,
  similarity_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.ocr_text,
    ROUND(
      (similarity(COALESCE(new_ocr_text, ''), COALESCE(m.ocr_text, '')) * 100)::NUMERIC, 
      2
    ) as similarity_percentage
  FROM memes m
  WHERE m.status = 'approved'
    AND m.ocr_text IS NOT NULL
    AND LENGTH(m.ocr_text) > 5
    AND similarity(COALESCE(new_ocr_text, ''), COALESCE(m.ocr_text, '')) > 0.8
  ORDER BY similarity_percentage DESC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Função para aprovar meme pendente
CREATE OR REPLACE FUNCTION approve_pending_meme(pending_id UUID, reviewer_id UUID)
RETURNS UUID AS $$
DECLARE
  pending_meme RECORD;
  new_meme_id UUID;
BEGIN
  -- Buscar o meme pendente
  SELECT * INTO pending_meme FROM memes WHERE id = pending_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Meme pendente não encontrado ou já processado';
  END IF;
  
  -- Inserir na tabela principal
  INSERT INTO memes (
    title, description, image_url, image_path, file_size, width, height, format,
    category_id, ocr_text, uploaded_by, status, created_at
  ) VALUES (
    pending_meme.title, pending_meme.description, pending_meme.image_url, 
    pending_meme.image_path, pending_meme.file_size, pending_meme.width, 
    pending_meme.height, pending_meme.format, pending_meme.category_id,
    pending_meme.extracted_text, pending_meme.uploaded_by, 'approved',
    pending_meme.uploaded_at
  ) RETURNING id INTO new_meme_id;
  
  -- Inserir tags se existirem
  IF pending_meme.tags IS NOT NULL AND array_length(pending_meme.tags, 1) > 0 THEN
    INSERT INTO meme_tags (meme_id, tag)
    SELECT new_meme_id, unnest(pending_meme.tags);
  END IF;
  
  -- Atualizar status do meme pendente
  UPDATE memes 
  SET status = 'approved', reviewed_by = reviewer_id, reviewed_at = NOW()
  WHERE id = pending_id;
  
  RETURN new_meme_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Função para rejeitar meme pendente
CREATE OR REPLACE FUNCTION reject_pending_meme(pending_id UUID, reviewer_id UUID, reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE memes 
  SET status = 'rejected', reviewed_by = reviewer_id, reviewed_at = NOW(), rejection_reason = reason
  WHERE id = pending_id AND status = 'pending';
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_memes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_memes_updated_at_trigger
  BEFORE UPDATE ON memes
  FOR EACH ROW
  EXECUTE FUNCTION update_memes_updated_at();

-- 9. Trigger para verificar duplicados automaticamente
CREATE OR REPLACE FUNCTION check_pending_meme_duplicates()
RETURNS TRIGGER AS $$
DECLARE
  max_similarity NUMERIC := 0;
BEGIN
  -- Verificar similaridade com memes existentes
  SELECT COALESCE(MAX(similarity_percentage), 0) INTO max_similarity
  FROM check_meme_duplicates(NEW.extracted_text);
  
  -- Armazenar o score de similaridade
  NEW.similarity_score = max_similarity;
  
  -- Se similaridade > 85%, rejeitar automaticamente
  IF max_similarity > 85 THEN
    NEW.status = 'rejected';
    NEW.rejection_reason = 'Meme duplicado detectado automaticamente (similaridade: ' || max_similarity || '%)';
    NEW.reviewed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_pending_meme_duplicates_trigger
  BEFORE INSERT ON memes
  FOR EACH ROW
  EXECUTE FUNCTION check_pending_meme_duplicates();

-- 10. Função para obter estatísticas de memes pendentes
CREATE OR REPLACE FUNCTION get_memes_stats()
RETURNS TABLE(
  total_pending INTEGER,
  approved_today INTEGER,
  rejected_today INTEGER,
  avg_similarity NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM memes WHERE status = 'pending'),
    (SELECT COUNT(*)::INTEGER FROM memes WHERE status = 'approved' AND reviewed_at::DATE = CURRENT_DATE),
    (SELECT COUNT(*)::INTEGER FROM memes WHERE status = 'rejected' AND reviewed_at::DATE = CURRENT_DATE),
    (SELECT ROUND(AVG(similarity_score), 2) FROM memes WHERE status = 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- INSTRUÇÕES DE USO:
-- ================================================
-- 1. Execute este script no SQL Editor do Supabase
-- 2. A tabela memes será criada com verificação automática de duplicados
-- 3. Memes com similaridade > 85% são rejeitados automaticamente
-- 4. Use approve_pending_meme(id, reviewer_id) para aprovar
-- 5. Use reject_pending_meme(id, reviewer_id, 'motivo') para rejeitar
-- 6. Use get_memes_stats() para estatísticas 