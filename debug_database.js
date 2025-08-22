// Script de debug para verificar a estrutura do banco de dados
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zsiqcnwnisfdkaiibpxf.supabase.co'
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXFjbnduaXNmZGthaWlicHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDMyNzQsImV4cCI6MjA2NjY3OTI3NH0.mgMcls6TaEkoTuxp6iLOlQ_m4NKri0vHHqEAfUV7lKg'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugDatabase() {
  console.log('🔍 Iniciando debug do banco de dados...')

  try {
    // 1. Verificar se as tabelas existem
    console.log('\n📋 Verificando existência das tabelas...')

    const tables = [
      'profiles',
      'memes',
      'meme_downloads',
      'user_favorites',
      'meme_shares',
      'categories',
    ]

    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1)

        if (error) {
          console.log(`❌ Tabela ${table}: ERRO - ${error.message}`)
        } else {
          console.log(`✅ Tabela ${table}: OK (${data?.length || 0} registros)`)
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: EXCEÇÃO - ${err.message}`)
      }
    }

    // 2. Verificar estrutura da tabela memes
    console.log('\n🔍 Verificando estrutura da tabela memes...')
    try {
      const { data: memes, error } = await supabase
        .from('memes')
        .select('*')
        .limit(5)

      if (error) {
        console.log(`❌ Erro ao buscar memes: ${error.message}`)
      } else {
        console.log(`✅ Memes encontrados: ${memes?.length || 0}`)
        if (memes && memes.length > 0) {
          console.log('📊 Exemplo de meme:', {
            id: memes[0].id,
            title: memes[0].title,
            status: memes[0].status,
            uploaded_by: memes[0].uploaded_by,
            share_count: memes[0].share_count,
            like_count: memes[0].like_count,
            download_count: memes[0].download_count,
          })
        }
      }
    } catch (err) {
      console.log(`❌ Exceção ao buscar memes: ${err.message}`)
    }

    // 3. Verificar estatísticas globais
    console.log('\n📊 Verificando estatísticas globais...')

    try {
      const [
        memesCount,
        usersCount,
        downloadsCount,
        favoritesCount,
      ] = await Promise.all([
        supabase
          .from('memes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase
          .from('meme_downloads')
          .select('*', { count: 'exact', head: true }),
        supabase
          .from('user_favorites')
          .select('*', { count: 'exact', head: true }),
      ])

      console.log(`✅ Memes aprovados: ${memesCount.count || 0}`)
      console.log(`✅ Usuários: ${usersCount.count || 0}`)
      console.log(`✅ Downloads: ${downloadsCount.count || 0}`)
      console.log(`✅ Favoritos: ${favoritesCount.count || 0}`)
    } catch (err) {
      console.log(`❌ Erro ao contar estatísticas: ${err.message}`)
    }

    // 4. Verificar políticas RLS
    console.log('\n🔒 Verificando políticas RLS...')

    try {
      const { data: policies, error } = await supabase
        .rpc('get_policies_info')
        .select()

      if (error) {
        console.log(`❌ Erro ao verificar políticas: ${error.message}`)
        console.log('💡 Execute: CREATE EXTENSION IF NOT EXISTS pg_policy;')
      } else {
        console.log(`✅ Políticas encontradas: ${policies?.length || 0}`)
      }
    } catch (err) {
      console.log(`❌ Exceção ao verificar políticas: ${err.message}`)
    }

    // 5. Verificar se há dados de teste
    console.log('\n🧪 Verificando dados de teste...')

    try {
      const { data: testUser, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)

      if (userError) {
        console.log(`❌ Erro ao buscar usuário de teste: ${userError.message}`)
      } else if (testUser && testUser.length > 0) {
        const userId = testUser[0].id
        console.log(
          `✅ Usuário de teste encontrado: ${
            testUser[0].username || testUser[0].id
          }`,
        )

        // Verificar estatísticas deste usuário
        const [
          userMemes,
          userDownloads,
          userFavorites,
          userShares,
        ] = await Promise.all([
          supabase
            .from('memes')
            .select('*', { count: 'exact', head: true })
            .eq('uploaded_by', userId),
          supabase
            .from('meme_downloads')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId),
          supabase
            .from('user_favorites')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId),
          supabase
            .from('meme_shares')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId),
        ])

        console.log(
          `📊 Estatísticas do usuário ${
            testUser[0].username || testUser[0].id
          }:`,
        )
        console.log(`   - Memes: ${userMemes.count || 0}`)
        console.log(`   - Downloads: ${userDownloads.count || 0}`)
        console.log(`   - Favoritos: ${userFavorites.count || 0}`)
        console.log(`   - Compartilhamentos: ${userShares.count || 0}`)
      }
    } catch (err) {
      console.log(`❌ Exceção ao verificar dados de teste: ${err.message}`)
    }
  } catch (error) {
    console.error('💥 Erro geral no debug:', error)
  }
}

// Executar debug
debugDatabase()
  .then(() => {
    console.log('\n✅ Debug concluído!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Erro fatal:', error)
    process.exit(1)
  })
