# Configuração do Supabase - Tabela pending_memes

## ⚠️ IMPORTANTE: Executar no SQL Editor do Supabase

Para implementar o sistema de moderação de memes, você precisa executar o seguinte código SQL no **SQL Editor** do seu projeto Supabase:

## 🗄️ Criar Tabela pending_memes

```sql
-- Criar tabela para memes pendentes de aprovação
CREATE TABLE pending_memes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Cotidiano',
  tags TEXT[] DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  extracted_text TEXT, -- Texto extraído por OCR para verificação de duplicados
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE pending_memes ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para pending_memes
CREATE POLICY "Usuários podem inserir próprios memes pendentes" ON pending_memes
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Usuários podem ver próprios memes pendentes" ON pending_memes
  FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Admins podem ver todos os memes pendentes" ON pending_memes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins podem atualizar memes pendentes" ON pending_memes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins podem deletar memes pendentes" ON pending_memes
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Função para mover meme aprovado para tabela principal
CREATE OR REPLACE FUNCTION approve_pending_meme(pending_id UUID, reviewer_id UUID)
RETURNS UUID AS $$
DECLARE
  pending_meme RECORD;
  new_meme_id UUID;
BEGIN
  -- Buscar o meme pendente
  SELECT * INTO pending_meme FROM pending_memes WHERE id = pending_id AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Meme pendente não encontrado ou já processado';
  END IF;

  -- Inserir na tabela principal
  INSERT INTO memes (
    title, description, image_url, category, tags, uploaded_by, created_at
  ) VALUES (
    pending_meme.title, pending_meme.description, pending_meme.image_url,
    pending_meme.category, pending_meme.tags, pending_meme.uploaded_by,
    pending_meme.uploaded_at
  ) RETURNING id INTO new_meme_id;

  -- Atualizar status do meme pendente
  UPDATE pending_memes
  SET status = 'approved', reviewed_by = reviewer_id, reviewed_at = NOW()
  WHERE id = pending_id;

  RETURN new_meme_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para rejeitar meme pendente
CREATE OR REPLACE FUNCTION reject_pending_meme(pending_id UUID, reviewer_id UUID, reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE pending_memes
  SET status = 'rejected', reviewed_by = reviewer_id, reviewed_at = NOW(), rejection_reason = reason
  WHERE id = pending_id AND status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_pending_memes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pending_memes_updated_at_trigger
  BEFORE UPDATE ON pending_memes
  FOR EACH ROW
  EXECUTE FUNCTION update_pending_memes_updated_at();

-- Índices para performance
CREATE INDEX idx_pending_memes_status ON pending_memes(status);
CREATE INDEX idx_pending_memes_uploaded_by ON pending_memes(uploaded_by);
CREATE INDEX idx_pending_memes_category ON pending_memes(category);
CREATE INDEX idx_pending_memes_extracted_text ON pending_memes USING gin(to_tsvector('portuguese', extracted_text));
```

## 📋 Passo a Passo

1. **Acesse seu projeto Supabase**
2. **Vá para SQL Editor** (na barra lateral esquerda)
3. **Cole todo o código SQL acima**
4. **Execute o script** (clique em "Run")
5. **Verifique se as tabelas foram criadas** em Database > Tables

## ✅ Funcionalidades Implementadas

### 🔍 **Sistema de Moderação**

- Todos os uploads vão para `pending_memes`
- Admins/moderadores aprovam ou rejeitam
- Memes aprovados são movidos para `memes` principal

### 🛡️ **Verificação de Duplicados OCR**

- Sistema inteligente de detecção de duplicados
- Compara texto extraído das imagens
- Bloqueia uploads similares (80% de similaridade)

### 👥 **Controle de Acesso**

- RLS policies protegem dados sensíveis
- Usuários só veem próprios memes pendentes
- Admins têm acesso completo

### 📊 **Admin Dashboard**

- Interface completa de moderação
- Estatísticas em tempo real
- Gestão de memes aprovados/pendentes

## 🚀 Como Testar

1. **Upload um meme** - vai para pending_memes
2. **Login como admin** - acesse o painel administrativo
3. **Modere memes** - aprove ou rejeite uploads
4. **Teste OCR** - tente fazer upload de imagem similar

## 👨‍💼 Como se tornar Admin

Atualize manualmente o campo `role` na tabela `profiles`:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'seu-email@exemplo.com';
```

## 🔧 Troubleshooting

### Erro: "function approve_pending_meme does not exist"

- Certifique-se de executar TODO o código SQL
- Verifique se não houve erros na execução

### Erro: "relation pending_memes does not exist"

- A tabela não foi criada
- Execute novamente a primeira parte do script

### Memes não aparecem no BrowseModal

- Verifique se existem memes com `status = 'approved'`
- Aprove alguns memes pendentes primeiro
