// Script de debug para testar Supabase
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://zsiqcnwnisfdkaiibpxf.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXFjbnduaXNmZGthaWlicHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDMyNzQsImV4cCI6MjA2NjY3OTI3NH0.mgMcls6TaEkoTuxp6iLOlQ_m4NKri0vHHqEAfUV7lKg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testSupabase() {
  console.log('🔍 Testando conexão com Supabase...')
  console.log('URL:', supabaseUrl)
  console.log(
    'Chave:',
    supabaseAnonKey ? '✅ Configurada' : '❌ Não configurada',
  )

  try {
    // Teste 1: Verificar se conseguimos acessar a tabela memes
    console.log('\n📊 Teste 1: Acesso à tabela memes')
    const { data: memesCount, error: memesError } = await supabase
      .from('memes')
      .select('count', { count: 'exact', head: true })

    if (memesError) {
      console.error('❌ Erro ao acessar tabela memes:', memesError)
    } else {
      console.log('✅ Tabela memes acessível, total de registros:', memesCount)
    }

    // Teste 2: Buscar alguns memes
    console.log('\n🔍 Teste 2: Buscar memes')
    const { data: memes, error: memesQueryError } = await supabase
      .from('memes')
      .select('id, title, status, created_at')
      .limit(5)

    if (memesQueryError) {
      console.error('❌ Erro ao buscar memes:', memesQueryError)
    } else {
      console.log('✅ Memes encontrados:', memes?.length || 0)
      if (memes && memes.length > 0) {
        console.log('📝 Primeiros memes:')
        memes.forEach((meme, index) => {
          console.log(
            `  ${index + 1}. ID: ${meme.id}, Título: ${
              meme.title || 'Sem título'
            }, Status: ${meme.status}, Data: ${meme.created_at}`,
          )
        })
      }
    }

    // Teste 3: Verificar políticas de segurança
    console.log('\n🔒 Teste 3: Verificar políticas de segurança')
    const { data: approvedMemes, error: approvedError } = await supabase
      .from('memes')
      .select('id, title, status')
      .eq('status', 'approved')
      .limit(5)

    if (approvedError) {
      console.error('❌ Erro ao buscar memes aprovados:', approvedError)
    } else {
      console.log('✅ Memes aprovados encontrados:', approvedMemes?.length || 0)
      if (approvedMemes && approvedMemes.length > 0) {
        console.log('📝 Memes aprovados:')
        approvedMemes.forEach((meme, index) => {
          console.log(
            `  ${index + 1}. ID: ${meme.id}, Título: ${
              meme.title || 'Sem título'
            }`,
          )
        })
      }
    }

    // Teste 4: Verificar estrutura da tabela
    console.log('\n🏗️ Teste 4: Verificar estrutura da tabela')
    const { data: tableInfo, error: tableError } = await supabase
      .from('memes')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ Erro ao verificar estrutura:', tableError)
    } else if (tableInfo && tableInfo.length > 0) {
      console.log('✅ Estrutura da tabela:')
      const columns = Object.keys(tableInfo[0])
      columns.forEach((col) => console.log(`  - ${col}`))
    }
  } catch (error) {
    console.error('💥 Erro geral:', error)
  }
}

// Executar teste
testSupabase()
  .then(() => {
    console.log('\n✅ Teste concluído')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
