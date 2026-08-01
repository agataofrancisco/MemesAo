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
      className={`bg-gradient-to-r from-primary-50 to-primary-100 dark:from-gray-800 dark:to-gray-800 border border-primary-200 dark:border-gray-700 rounded-xl p-4 ${className}`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {canDownload ? (
            <Download className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          ) : (
            <Lock className="h-5 w-5 text-accent-600 dark:text-accent-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-primary-900 dark:text-primary-100">
                Downloads Restantes
              </h4>
              {showDetails && (
                <p className="text-xs text-primary-700 dark:text-primary-300 mt-1">
                  Faça login para downloads ilimitados
                </p>
              )}
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {remaining}
                </span>
                <span className="text-sm text-primary-600 dark:text-primary-400">
                  / {total}
                </span>
              </div>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="mt-2">
            <div className="w-full bg-primary-200 dark:bg-primary-800 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(remaining / total) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all duration-300"
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
          className="mt-3 p-3 bg-accent-50 dark:bg-accent-900/20 border border-accent-200 dark:border-accent-800 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-accent-600 dark:text-accent-400" />
            <span className="text-sm text-accent-800 dark:text-accent-200">
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
          className="mt-3 pt-3 border-t border-primary-200 dark:border-primary-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm text-primary-700 dark:text-primary-300">
                Benefícios de fazer login:
              </span>
            </div>
          </div>

          <div className="mt-2 space-y-1">
            <div className="flex items-center space-x-2 text-xs text-primary-600 dark:text-primary-400">
              <div className="w-1.5 h-1.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
              <span>Downloads ilimitados</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-primary-600 dark:text-primary-400">
              <div className="w-1.5 h-1.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
              <span>Favoritar memes</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-primary-600 dark:text-primary-400">
              <div className="w-1.5 h-1.5 bg-blue-600 dark:text-blue-400 rounded-full" />
              <span>Histórico pessoal</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
