import React, { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { Database, AlertCircle, X } from 'lucide-react'

export default function SimpleDebug() {
  const [counts, setCounts] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [loading, setLoading] = useState(false)

  const checkCounts = async () => {
    if (!isSupabaseConfigured) {
      setCounts({ error: 'Supabase não configurado' })
      return
    }

    setLoading(true)
    try {
      // Verificar contagens básicas
      const results = await Promise.allSettled([
        supabase.from('categories').select('*', { count: 'exact', head: true }),
        supabase
          .from('memes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved'),
        supabase
          .from('pending_memes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending'),
        supabase.from('memes').select('*', { count: 'exact', head: true }),
      ])

      setCounts({
        categories:
          results[0].status === 'fulfilled'
            ? results[0].value.count || 0
            : 'Erro',
        memesApproved:
          results[1].status === 'fulfilled'
            ? results[1].value.count || 0
            : 'Erro',
        pendingMemes:
          results[2].status === 'fulfilled'
            ? results[2].value.count || 0
            : 'Erro',
        totalMemes:
          results[3].status === 'fulfilled'
            ? results[3].value.count || 0
            : 'Erro',
        errors: results
          .filter((r) => r.status === 'rejected')
          .map((r: any) => r.reason?.message)
          .filter(Boolean),
      })
    } catch (error) {
      setCounts({ error: error.message })
    }
    setLoading(false)
  }

  useEffect(() => {
    checkCounts()
  }, [])

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-4 left-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full shadow-lg z-[9999] animate-pulse"
        title="Debug Info"
      >
        <AlertCircle className="h-4 w-4" />
      </button>
    )
  }

  return (
    <div className="fixed top-4 left-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 shadow-xl z-[9999] max-w-xs">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-red-800 dark:text-red-200 flex items-center text-sm">
          <Database className="h-4 w-4 mr-1" />
          DB Status
        </h3>
        <div className="flex gap-1">
          <button
            onClick={checkCounts}
            disabled={loading}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? '...' : '↻'}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-red-600 hover:text-red-800 dark:text-red-300"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {counts ? (
        <div className="space-y-2 text-xs">
          {counts.error ? (
            <div className="text-red-600 dark:text-red-400 font-medium">
              ❌ {counts.error}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-1">
                <div>Categorias:</div>
                <div
                  className={
                    counts.categories === 0
                      ? 'text-red-600 font-bold'
                      : 'text-green-600'
                  }
                >
                  {counts.categories}
                </div>

                <div>Memes OK:</div>
                <div
                  className={
                    counts.memesApproved === 0
                      ? 'text-red-600 font-bold'
                      : 'text-green-600'
                  }
                >
                  {counts.memesApproved}
                </div>

                <div>Pendentes:</div>
                <div className="text-blue-600">{counts.pendingMemes}</div>

                <div>Total:</div>
                <div>{counts.totalMemes}</div>
              </div>

              {/* Alertas */}
              {counts.categories === 0 && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 p-2 rounded text-xs">
                  ⚠️ Sem categorias! Execute fix_missing_data.sql
                </div>
              )}

              {counts.memesApproved === 0 && (
                <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-2 rounded text-xs">
                  ❌ Sem memes! Execute fix_missing_data.sql
                </div>
              )}

              {counts.errors && counts.errors.length > 0 && (
                <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-2 rounded text-xs">
                  🚨 Erros: {counts.errors.join(', ')}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="text-gray-500 text-xs">Carregando...</div>
      )}
    </div>
  )
}
