import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function TestMemes() {
  const [memes, setMemes] = useState<any[]>([])
  const [pendingMemes, setPendingMemes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    testDatabase()
  }, [])

  const testDatabase = async () => {
    try {
      console.log('🔍 Testando conexão com Supabase...')

      // Testar memes aprovados
      const { data: memesData, error: memesError } = await supabase
        .from('memes')
        .select('*')
        .limit(5)

      console.log('📊 Memes aprovados:', memesData)
      console.log('❌ Erro memes:', memesError)

      // Testar memes pendentes
      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_memes')
        .select('*')
        .limit(5)

      console.log('⏳ Memes pendentes:', pendingData)
      console.log('❌ Erro pendentes:', pendingError)

      // Testar categorias
      const {
        data: categoriesData,
        error: categoriesError,
      } = await supabase.from('categories').select('*').limit(5)

      console.log('📂 Categorias:', categoriesData)
      console.log('❌ Erro categorias:', categoriesError)

      setMemes(memesData || [])
      setPendingMemes(pendingData || [])

      if (memesError || pendingError || categoriesError) {
        setError(
          `Erros: ${memesError?.message || ''} ${pendingError?.message || ''} ${
            categoriesError?.message || ''
          }`,
        )
      }
    } catch (err) {
      console.error('💥 Erro geral:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
        🔍 Testando banco de dados...
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 max-w-md">
      <h3 className="font-bold mb-2">🗄️ Status do Banco</h3>

      <div className="text-sm space-y-1">
        <p>
          📊 Memes: <strong>{memes.length}</strong>
        </p>
        <p>
          ⏳ Pendentes: <strong>{pendingMemes.length}</strong>
        </p>

        {error && <p className="text-red-500">❌ {error}</p>}

        {memes.length === 0 && (
          <p className="text-orange-500">⚠️ Nenhum meme aprovado encontrado</p>
        )}
      </div>

      <button
        onClick={testDatabase}
        className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
      >
        🔄 Testar novamente
      </button>
    </div>
  )
}
