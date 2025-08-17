import React, { useState } from 'react'
import { RefreshCw, Database, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useStats } from '../hooks/useStats'
import { isSupabaseConfigured } from '../lib/supabase'

export default function SimpleDebug() {
  const [isVisible, setIsVisible] = useState(false)
  const {
    memes,
    loading: memesLoading,
    error: memesError,
    isBackendConfigured,
    refresh: refreshMemes,
  } = useMemes()
  const {
    categories,
    stats,
    loading: statsLoading,
    error: statsError,
    refresh: refreshStats,
  } = useStats()

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className={`text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors ${
            memesError || statsError
              ? 'bg-red-600 animate-pulse'
              : 'bg-gray-800'
          }`}
          title={
            memesError || statsError
              ? 'Erro detectado - Clique para ver detalhes'
              : 'Mostrar Debug'
          }
        >
          {memesError || statsError ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    )
  }

  const handleRefresh = async () => {
    await Promise.all([refreshMemes(), refreshStats()])
  }

  const hasErrors = memesError || statsError
  const isLoading = memesLoading || statsLoading

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 max-w-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Debug Info
          {hasErrors && <AlertTriangle className="h-4 w-4 ml-2 text-red-500" />}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`p-1 transition-colors ${
              isLoading
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            title="Atualizar dados"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
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
        {/* Erros em destaque */}
        {hasErrors && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded">
            <h4 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Erros Detectados
            </h4>
            <div className="space-y-1 text-xs">
              {memesError && (
                <div className="text-red-700 dark:text-red-300">
                  <strong>Memes:</strong> {memesError}
                </div>
              )}
              {statsError && (
                <div className="text-red-700 dark:text-red-300">
                  <strong>Stats:</strong> {statsError}
                </div>
              )}
            </div>
          </div>
        )}

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
            <div className="flex justify-between">
              <span>Conexão:</span>
              <span className={!hasErrors ? 'text-green-600' : 'text-red-600'}>
                {!hasErrors ? 'OK' : 'Com Problemas'}
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
              <span>Memes:</span>
              <span
                className={
                  memesError
                    ? 'text-red-600'
                    : memesLoading
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }
              >
                {memesError
                  ? 'Erro'
                  : memesLoading
                  ? 'Carregando...'
                  : 'Carregado'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Stats:</span>
              <span
                className={
                  statsError
                    ? 'text-red-600'
                    : statsLoading
                    ? 'text-yellow-600'
                    : 'text-green-600'
                }
              >
                {statsError
                  ? 'Erro'
                  : statsLoading
                  ? 'Carregando...'
                  : 'Carregado'}
              </span>
            </div>
          </div>
        </div>

        {/* Dados */}
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            Dados do Banco
          </h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Memes Aprovados:</span>
              <span
                className={`font-mono ${
                  memes.length === 0 ? 'text-yellow-600' : 'text-green-600'
                }`}
              >
                {memes.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Categorias:</span>
              <span
                className={`font-mono ${
                  categories.length === 0 ? 'text-yellow-600' : 'text-green-600'
                }`}
              >
                {categories.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total Memes (DB):</span>
              <span className="font-mono">{stats.totalMemes}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Usuários:</span>
              <span className="font-mono">{stats.totalUsers}</span>
            </div>
          </div>
        </div>

        {/* Diagnóstico */}
        {!hasErrors && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded">
            <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
              Diagnóstico
            </h4>
            <div className="text-xs text-green-700 dark:text-green-300">
              {memes.length > 0 && categories.length > 0
                ? '✅ Sistema funcionando normalmente'
                : memes.length === 0 && categories.length === 0
                ? '⚠️ Banco de dados vazio - adicione categorias e memes'
                : memes.length === 0
                ? '⚠️ Sem memes aprovados - aguarde aprovações ou adicione memes'
                : '⚠️ Sem categorias - adicione categorias ao banco'}
            </div>
          </div>
        )}

        {/* Informações de sistema */}
        <div className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-2">
          <div>Última atualização: {new Date().toLocaleTimeString()}</div>
          <div>URL: {window.location.hostname}</div>
          <div>Modo: {process.env.NODE_ENV || 'development'}</div>
        </div>
      </div>
    </div>
  )
}
