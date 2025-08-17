import React, { useState } from 'react'
import { RefreshCw, Database, Eye, EyeOff } from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useStats } from '../hooks/useStats'
import { isSupabaseConfigured } from '../lib/supabase'

export default function SimpleDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const {
    memes,
    loading: memesLoading,
    isBackendConfigured,
    refresh: refreshMemes,
  } = useMemes()
  const {
    categories,
    stats,
    loading: statsLoading,
    refresh: refreshStats,
  } = useStats()

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
          title="Mostrar Debug"
        >
          <Eye className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const handleRefresh = async () => {
    await Promise.all([refreshMemes(), refreshStats()])
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Debug Info
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Atualizar dados"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            title="Ocultar Debug"
          >
            <EyeOff className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        {/* Configuração */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Configuração
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Supabase:</span>
              <span
                className={
                  isSupabaseConfigured ? 'text-green-600' : 'text-red-600'
                }
              >
                {isSupabaseConfigured ? 'Configurado' : 'Não configurado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Backend:</span>
              <span
                className={
                  isBackendConfigured ? 'text-green-600' : 'text-red-600'
                }
              >
                {isBackendConfigured ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </div>
        </div>

        {/* Estados de carregamento */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Estados
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Memes Loading:</span>
              <span
                className={memesLoading ? 'text-yellow-600' : 'text-green-600'}
              >
                {memesLoading ? 'Carregando...' : 'Carregado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Stats Loading:</span>
              <span
                className={statsLoading ? 'text-yellow-600' : 'text-green-600'}
              >
                {statsLoading ? 'Carregando...' : 'Carregado'}
              </span>
            </div>
          </div>
        </div>

        {/* Dados */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Dados Carregados
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Memes:</span>
              <span className="font-mono">{memes.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Categorias:</span>
              <span className="font-mono">{categories.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Memes (Stats):</span>
              <span className="font-mono">{stats.totalMemes}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Usuários:</span>
              <span className="font-mono">{stats.totalUsers}</span>
            </div>
          </div>
        </div>

        {/* Categorias detalhadas */}
        {categories.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Categorias
            </h4>
            <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.id} className="flex justify-between">
                  <span className="truncate">{cat.name}</span>
                  <span className="font-mono ml-2">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Últimos memes */}
        {memes.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Últimos Memes
            </h4>
            <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
              {memes.slice(0, 5).map((meme) => (
                <div key={meme.id} className="flex justify-between">
                  <span className="truncate">{meme.title || 'Sem título'}</span>
                  <span className="ml-2 text-gray-500">{meme.category}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs de erro (se houver) */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <div>Última atualização: {new Date().toLocaleTimeString()}</div>
          <div>URL: {window.location.hostname}</div>
        </div>
      </div>
    </div>
  )
}
