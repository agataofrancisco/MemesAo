import React, { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { AlertTriangle, Database, Check, X } from 'lucide-react'

interface DebugInfo {
  tables: string[]
  counts: {
    memes: number
    memesApproved: number
    pendingMemes: number
    pendingMemesPending: number
    categories: number
    profiles: number
  }
  errors: string[]
}

export default function DebugPanel() {
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  const runDiagnostics = async () => {
    if (!isSupabaseConfigured) {
      setDebugInfo({
        tables: [],
        counts: {
          memes: 0,
          memesApproved: 0,
          pendingMemes: 0,
          pendingMemesPending: 0,
          categories: 0,
          profiles: 0,
        },
        errors: ['Supabase não configurado'],
      })
      return
    }

    setLoading(true)
    const errors: string[] = []
    const tables: string[] = []
    const counts = {
      memes: 0,
      memesApproved: 0,
      pendingMemes: 0,
      pendingMemesPending: 0,
      categories: 0,
      profiles: 0,
    }

    try {
      // 1. Verificar tabelas existentes
      const { data: tablesData, error: tablesError } = await supabase.rpc(
        'exec',
        {
          sql: `
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('memes', 'memes', 'categories', 'profiles')
          `,
        },
      )

      if (tablesError) {
        // Fallback: tentar verificar tabelas individualmente
        const tableChecks = ['memes', 'memes', 'categories', 'profiles']
        for (const table of tableChecks) {
          try {
            const { error } = await supabase
              .from(table)
              .select('*', { count: 'exact', head: true })
            if (!error) {
              tables.push(table)
            }
          } catch (e) {
            errors.push(`Tabela ${table} não encontrada`)
          }
        }
      } else {
        tablesData?.forEach((row: any) => tables.push(row.table_name))
      }

      // 2. Contar registros
      if (tables.includes('memes')) {
        try {
          const { count: memesCount } = await supabase
            .from('memes')
            .select('*', { count: 'exact', head: true })
          counts.memes = memesCount || 0

          const { count: memesApprovedCount } = await supabase
            .from('memes')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'approved')
          counts.memesApproved = memesApprovedCount || 0
        } catch (e) {
          errors.push(`Erro ao contar memes: ${e.message}`)
        }
      }

      if (tables.includes('memes')) {
        try {
          const { count: pendingCount } = await supabase
            .from('memes')
            .select('*', { count: 'exact', head: true })
          counts.pendingMemes = pendingCount || 0

          const { count: pendingPendingCount } = await supabase
            .from('memes')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')
          counts.pendingMemesPending = pendingPendingCount || 0
        } catch (e) {
          errors.push(`Erro ao contar memes: ${e.message}`)
        }
      } else {
        errors.push(
          'Tabela memes não existe - execute o script create_memes_table.sql',
        )
      }

      if (tables.includes('categories')) {
        try {
          const { count: categoriesCount } = await supabase
            .from('categories')
            .select('*', { count: 'exact', head: true })
          counts.categories = categoriesCount || 0
        } catch (e) {
          errors.push(`Erro ao contar categories: ${e.message}`)
        }
      }

      if (tables.includes('profiles')) {
        try {
          const { count: profilesCount } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
          counts.profiles = profilesCount || 0
        } catch (e) {
          errors.push(`Erro ao contar profiles: ${e.message}`)
        }
      }
    } catch (error) {
      errors.push(`Erro geral: ${error.message}`)
    }

    setDebugInfo({ tables, counts, errors })
    setLoading(false)
  }

  useEffect(() => {
    runDiagnostics()
  }, [])

  if (!debugInfo) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 z-[9999]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
          <Database className="h-4 w-4 mr-2" />
          Debug Database
        </h3>
        <button
          onClick={runDiagnostics}
          disabled={loading}
          className="text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-3 text-sm">
        {/* Tabelas */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tabelas:
          </h4>
          <div className="space-y-1">
            {['memes', 'memes', 'categories', 'profiles'].map((table) => (
              <div key={table} className="flex items-center space-x-2">
                {debugInfo.tables.includes(table) ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <X className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={
                    debugInfo.tables.includes(table)
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }
                >
                  {table}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contadores */}
        <div>
          <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-1">
            Registros:
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Memes: {debugInfo.counts.memes}</div>
            <div>Aprovados: {debugInfo.counts.memesApproved}</div>
            <div>Pendentes: {debugInfo.counts.pendingMemes}</div>
            <div>Aguardando: {debugInfo.counts.pendingMemesPending}</div>
            <div>Categorias: {debugInfo.counts.categories}</div>
            <div>Usuários: {debugInfo.counts.profiles}</div>
          </div>
        </div>

        {/* Erros */}
        {debugInfo.errors.length > 0 && (
          <div>
            <h4 className="font-medium text-red-600 dark:text-red-400 mb-1 flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Problemas:
            </h4>
            <div className="space-y-1">
              {debugInfo.errors.map((error, index) => (
                <div
                  key={index}
                  className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-1 rounded"
                >
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações rápidas */}
        {debugInfo.errors.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ações:
            </h4>
            <div className="text-xs space-y-1">
              {!debugInfo.tables.includes('memes') && (
                <div className="text-blue-600 dark:text-blue-400">
                  → Execute create_memes_table.sql no Supabase
                </div>
              )}
              {debugInfo.counts.categories === 0 && (
                <div className="text-yellow-600 dark:text-yellow-400">
                  → Execute as queries de inserção de categorias
                </div>
              )}
              {debugInfo.counts.memes === 0 &&
                debugInfo.counts.pendingMemes === 0 && (
                  <div className="text-green-600 dark:text-green-400">
                    → Faça upload de alguns memes para testar
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
