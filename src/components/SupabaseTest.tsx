import React, { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export default function SupabaseTest() {
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const runTests = async () => {
      const results: any = {}

      try {
        // Teste 1: Configuração básica
        results.config = {
          isConfigured: isSupabaseConfigured,
          hasSupabase: !!supabase,
          url: supabase?.supabaseUrl,
        }

        // Teste 2: Acesso à tabela memes
        if (supabase) {
          try {
            const { data, error } = await supabase
              .from('memes')
              .select('count', { count: 'exact', head: true })

            results.memesTable = {
              success: !error,
              error: error?.message,
              count: data,
            }
          } catch (e) {
            results.memesTable = {
              success: false,
              error: e instanceof Error ? e.message : String(e),
            }
          }

          // Teste 3: Buscar alguns memes
          try {
            const { data, error } = await supabase
              .from('memes')
              .select('id, title, status')
              .limit(5)

            results.memesQuery = {
              success: !error,
              error: error?.message,
              data: data,
              count: data?.length || 0,
            }
          } catch (e) {
            results.memesQuery = {
              success: false,
              error: e instanceof Error ? e.message : String(e),
            }
          }

          // Teste 4: Verificar políticas
          try {
            const { data, error } = await supabase
              .from('memes')
              .select('id, title, status')
              .eq('status', 'approved')
              .limit(5)

            results.approvedMemes = {
              success: !error,
              error: error?.message,
              data: data,
              count: data?.length || 0,
            }
          } catch (e) {
            results.approvedMemes = {
              success: false,
              error: e instanceof Error ? e.message : String(e),
            }
          }
        }
      } catch (error) {
        results.generalError =
          error instanceof Error ? error.message : String(error)
      }

      setTestResults(results)
      setLoading(false)
    }

    runTests()
  }, [])

  if (loading) {
    return <div className="p-4">Testando conexão com Supabase...</div>
  }

  return (
    <div className="p-6 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
      <h2 className="text-xl font-bold text-yellow-800 dark:text-yellow-200 mb-4">
        Teste de Conexão Supabase
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">
            Configuração:
          </h3>
          <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(testResults.config, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">
            Acesso à Tabela:
          </h3>
          <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(testResults.memesTable, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">
            Query de Memes:
          </h3>
          <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(testResults.memesQuery, null, 2)}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">
            Memes Aprovados:
          </h3>
          <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(testResults.approvedMemes, null, 2)}
          </pre>
        </div>

        {testResults.generalError && (
          <div>
            <h3 className="font-semibold text-red-700 dark:text-red-300">
              Erro Geral:
            </h3>
            <pre className="text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded overflow-auto">
              {testResults.generalError}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
