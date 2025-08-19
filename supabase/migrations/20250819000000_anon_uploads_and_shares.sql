/*
  Permitir upload anónimo, adicionar rastreamento de compartilhamentos e ranking por compartilhamentos.

  Mudanças:
  - Adiciona coluna share_count em memes
  - Cria tabela meme_shares
  - Políticas RLS para permitir INSERT por public em memes (quando uploaded_by IS NULL)
  - Políticas RLS para permitir INSERT por public em meme_shares
  - Trigger para atualizar share_count ao inserir em meme_shares
  - Política no storage para permitir uploads públicos no bucket 'memes'
*/

-- Adicionar coluna de contagem de compartilhamentos em memes (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'memes' AND column_name = 'share_count'
  ) THEN
    ALTER TABLE public.memes ADD COLUMN share_count integer DEFAULT 0;
  END IF;
END $$;

-- Criar tabela de compartilhamentos de memes
CREATE TABLE IF NOT EXISTS public.meme_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meme_id uuid NOT NULL REFERENCES public.memes(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id),
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.meme_shares ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para meme_shares
DO $$
BEGIN
  -- Remover políticas conflituosas se existirem
  BEGIN
    DROP POLICY IF EXISTS "Anyone can insert shares" ON public.meme_shares;
    DROP POLICY IF EXISTS "Users can read own shares" ON public.meme_shares;
    DROP POLICY IF EXISTS "Moderators can read all shares" ON public.meme_shares;
  EXCEPTION WHEN others THEN NULL; END;

  -- Qualquer pessoa pode registrar um compartilhamento
  CREATE POLICY "Anyone can insert shares"
    ON public.meme_shares
    FOR INSERT
    TO public
    WITH CHECK (true);

  -- Usuários autenticados podem ler seus próprios compartilhamentos
  CREATE POLICY "Users can read own shares"
    ON public.meme_shares
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

  -- Moderadores/admins podem ler todos
  CREATE POLICY "Moderators can read all shares"
    ON public.meme_shares
    FOR SELECT
    TO authenticated
    USING (EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('moderator','admin')
    ));
END $$;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_meme_shares_meme_id ON public.meme_shares(meme_id);
CREATE INDEX IF NOT EXISTS idx_meme_shares_created_at ON public.meme_shares(created_at DESC);

-- Trigger para atualizar share_count
CREATE OR REPLACE FUNCTION public.update_meme_share_count()
RETURNS trigger AS $$
BEGIN
  UPDATE public.memes
  SET share_count = COALESCE(share_count, 0) + 1
  WHERE id = NEW.meme_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_meme_share_count ON public.meme_shares;
CREATE TRIGGER trigger_update_meme_share_count
  AFTER INSERT ON public.meme_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_meme_share_count();

-- Permitir upload anónimo em memes: inserir registros com uploaded_by IS NULL
DO $$
BEGIN
  -- Criar política adicional para INSERT por public
  BEGIN
    DROP POLICY IF EXISTS "Public can insert anonymous memes" ON public.memes;
  EXCEPTION WHEN others THEN NULL; END;

  CREATE POLICY "Public can insert anonymous memes"
    ON public.memes
    FOR INSERT
    TO public
    WITH CHECK (
      uploaded_by IS NULL
      AND status = 'pending'
    );
END $$;

-- Storage: permitir INSERT público no bucket 'memes'
DO $$
BEGIN
  BEGIN
    DROP POLICY IF EXISTS "Public can upload to memes bucket" ON storage.objects;
  EXCEPTION WHEN others THEN NULL; END;

  CREATE POLICY "Public can upload to memes bucket"
    ON storage.objects
    FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'memes');
END $$;

