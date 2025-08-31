import React from 'react'
import { motion } from 'framer-motion'
import { Download, Lock, User, AlertCircle } from 'lucide-react'
import { useDownloadLimit } from '../hooks/useDownloadLimit'

interface DownloadStatusProps {
  className?: string
  showDetails?: boolean
}

export default function DownloadStatus({
  className = '',
  showDetails = false,
}: DownloadStatusProps) {
  const { getDownloadInfo, isAnonymous } = useDownloadLimit()
  const downloadInfo = getDownloadInfo()

  if (!isAnonymous) {
    // Usuário logado - não mostrar limite
    return null
  }

  const { remaining, total, canDownload } = downloadInfo

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {canDownload ? (
            <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <Lock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Downloads Restantes
              </h4>
              {showDetails && (
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  Faça login para downloads ilimitados
                </p>
              )}
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {remaining}
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400">
                  / {total}
                </span>
              </div>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mt-2">
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(remaining / total) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Aviso quando não pode mais baixar */}
      {!canDownload && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            <span className="text-sm text-orange-800 dark:text-orange-200">
              Limite de downloads atingido. Faça login para continuar baixando.
            </span>
          </div>
        </motion.div>
      )}

      {/* Call to action para login */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Benefícios de fazer login:
              </span>
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              <span>Downloads ilimitados</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
              <span>Favoritar memes</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-blue-600 dark:text-blue-400">
              <div className="w-1.5 h-1.5 bg-blue-600 dark:text-blue-400 rounded-full" />
              <span>Histórico pessoal</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
