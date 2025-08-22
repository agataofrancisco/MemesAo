import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'

export default function SimpleDebug() {
  const { user, profile, loading: authLoading } = useAuth()
  const { stats, loading: statsLoading, error } = useStats()

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        🔍 Debug dos Hooks
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auth Hook */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-blue-600 dark:text-blue-400">
            useAuth Hook
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Loading:</span>{' '}
              <span
                className={authLoading ? 'text-yellow-600' : 'text-green-600'}
              >
                {authLoading ? '⏳ Sim' : '✅ Não'}
              </span>
            </div>
            <div>
              <span className="font-medium">User:</span>{' '}
              <span className={user ? 'text-green-600' : 'text-red-600'}>
                {user ? `✅ ${user.email}` : '❌ Nenhum'}
              </span>
            </div>
            <div>
              <span className="font-medium">Profile:</span>{' '}
              <span className={profile ? 'text-green-600' : 'text-red-600'}>
                {profile ? `✅ ${profile.username || profile.id}` : '❌ Nenhum'}
              </span>
            </div>
            {user && (
              <div className="mt-3 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Stats Hook */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3 text-green-600 dark:text-green-400">
            useStats Hook
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Loading:</span>{' '}
              <span
                className={statsLoading ? 'text-yellow-600' : 'text-green-600'}
              >
                {statsLoading ? '⏳ Sim' : '✅ Não'}
              </span>
            </div>
            <div>
              <span className="font-medium">Error:</span>{' '}
              <span className={error ? 'text-red-600' : 'text-green-600'}>
                {error ? `❌ ${error}` : '✅ Nenhum'}
              </span>
            </div>
            <div>
              <span className="font-medium">Stats Object:</span>
              <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas Detalhadas */}
      <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3 text-purple-600 dark:text-purple-400">
          📊 Estatísticas Detalhadas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.userMemes || 0}
            </div>
            <div className="text-sm text-blue-600">Suas Publicações</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.userDownloads || 0}
            </div>
            <div className="text-sm text-green-600">Seus Downloads</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {stats.userFavorites || 0}
            </div>
            <div className="text-sm text-red-600">Seus Likes</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {stats.userShares || 0}
            </div>
            <div className="text-sm text-purple-600">Suas Partilhas</div>
          </div>
        </div>
      </div>

      {/* Botão de Refresh */}
      <div className="mt-6 text-center">
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          🔄 Recarregar Página
        </button>
      </div>
    </div>
  )
}
