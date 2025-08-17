// Script de debug para testar a funcionalidade de delete
// Execute este script no console do navegador (F12) quando estiver logado como admin

console.log('🔍 Iniciando diagnóstico da funcionalidade de DELETE...')

// 1. Verificar se o usuário está autenticado
const checkAuth = async () => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    console.log('👤 Usuário atual:', user?.id)

    if (!user) {
      console.error('❌ Usuário não autenticado')
      return false
    }

    // Verificar role do usuário
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('👑 Role do usuário:', profile?.role)

    if (!profile || !['admin', 'moderator'].includes(profile.role)) {
      console.error('❌ Usuário não tem permissão de admin/moderador')
      return false
    }

    return true
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error)
    return false
  }
}

// 2. Verificar políticas RLS
const checkPolicies = async () => {
  try {
    console.log('🔐 Verificando políticas RLS...')

    // Tentar fazer uma query para verificar permissões
    const { data: testMeme, error } = await supabase
      .from('memes')
      .select('id')
      .limit(1)

    if (error) {
      console.error('❌ Erro ao acessar tabela memes:', error)
      return false
    }

    console.log('✅ Acesso à tabela memes OK')

    // Se há memes, tentar fazer um DELETE de teste (que vai falhar mas mostra o erro)
    if (testMeme && testMeme.length > 0) {
      const { error: deleteError } = await supabase
        .from('memes')
        .delete()
        .eq('id', 'test-id-that-does-not-exist')

      if (deleteError) {
        console.log('🔍 Erro de DELETE de teste:', deleteError)

        if (deleteError.code === '42501') {
          console.error(
            '❌ PROBLEMA ENCONTRADO: Faltam políticas de DELETE para admins',
          )
          console.log(
            '💡 SOLUÇÃO: Execute o arquivo fix_delete_policies.sql no Supabase Dashboard',
          )
          return false
        }
      }
    }

    return true
  } catch (error) {
    console.error('❌ Erro ao verificar políticas:', error)
    return false
  }
}

// 3. Testar deleção de registros relacionados
const testRelatedTables = async () => {
  console.log('🔗 Testando acesso a tabelas relacionadas...')

  const tables = ['user_favorites', 'meme_downloads', 'meme_views', 'meme_tags']

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', 'test-id-that-does-not-exist')

      if (error && error.code === '42501') {
        console.error(`❌ Faltam políticas de DELETE para tabela: ${table}`)
      } else {
        console.log(`✅ Políticas OK para tabela: ${table}`)
      }
    } catch (error) {
      console.error(`❌ Erro ao testar tabela ${table}:`, error)
    }
  }
}

// Executar diagnóstico completo
const runDiagnostic = async () => {
  console.log('🚀 Executando diagnóstico completo...')

  const isAuthenticated = await checkAuth()
  if (!isAuthenticated) return

  const policiesOK = await checkPolicies()
  if (!policiesOK) {
    console.log('📋 Execute este SQL no Supabase Dashboard:')
    console.log(`
-- Corrigir políticas de DELETE para memes
CREATE POLICY "Admins can delete any meme" ON memes
FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'moderator')
));

-- Repetir para outras tabelas (ver arquivo fix_delete_policies.sql)
    `)
    return
  }

  await testRelatedTables()

  console.log('✅ Diagnóstico concluído!')
}

// Auto-executar se supabase estiver disponível
if (typeof supabase !== 'undefined') {
  runDiagnostic()
} else {
  console.error(
    '❌ Supabase não encontrado. Execute este script na página da aplicação.',
  )
}
