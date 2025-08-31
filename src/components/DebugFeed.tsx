import React from 'react'
import { useOptimizedMemes } from '../hooks/useOptimizedMemes'
import { useStats } from '../hooks/useStats'
import { useAuth } from '../hooks/useAuth'
import { useDownloadLimit } from '../hooks/useDownloadLimit'

export default function DebugFeed() {
  const optimizedMemes = useOptimizedMemes({
    pageSize: 20,
    preloadDistance: 800,
  })

  const stats = useStats()
  const auth = useAuth()
  const downloadLimit = useDownloadLimit()

  console.log('=== DEBUG FEED ===')
  console.log('OptimizedMemes:', {
    memes: optimizedMemes.memes,
    loading: optimizedMemes.loading,
    error: optimizedMemes.error,
    hasMore: optimizedMemes.hasMore,
    loadingMore: optimizedMemes.loadingMore,
  })

  console.log('Stats:', {
    categories: stats.categories,
    loading: stats.loading,
    error: stats.error,
  })

  console.log('Auth:', {
    user: auth.user,
    profile: auth.profile,
    isConfigured: auth.isConfigured,
  })

  console.log('DownloadLimit:', {
    canDownload: downloadLimit.canDownload,
    downloadCount: downloadLimit.downloadCount,
    isAnonymous: downloadLimit.isAnonymous,
  })

  return (
    <div className="p-8 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
      <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-4">
        Debug Feed - Estado Atual
      </h2>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-red-700 dark:text-red-300">
            OptimizedMemes:
          </h3>
          <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(
              {
                memesLength: optimizedMemes.memes?.length || 0,
                loading: optimizedMemes.loading,
                error: optimizedMemes.error,
                hasMore: optimizedMemes.hasMore,
                loadingMore: optimizedMemes.loadingMore,
              },
              null,
              2,
            )}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold text-red-700 dark:text-red-300">
            Stats:
          </h3>
          <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(
              {
                categoriesLength: stats.categories?.length || 0,
                loading: stats.loading,
                error: stats.error,
              },
              null,
              2,
            )}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold text-red-700 dark:text-red-300">
            Auth:
          </h3>
          <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(
              {
                user: !!auth.user,
                profile: !!auth.profile,
                isConfigured: auth.isConfigured,
              },
              null,
              2,
            )}
          </pre>
        </div>

        <div>
          <h3 className="font-semibold text-red-700 dark:text-red-300">
            DownloadLimit:
          </h3>
          <pre className="text-xs bg-white dark:bg-gray-800 p-2 rounded overflow-auto">
            {JSON.stringify(
              {
                canDownload: downloadLimit.canDownload,
                downloadCount: downloadLimit.downloadCount,
                isAnonymous: downloadLimit.isAnonymous,
              },
              null,
              2,
            )}
          </pre>
        </div>
      </div>
    </div>
  )
}
