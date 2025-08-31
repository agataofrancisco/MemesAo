import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Lock, User, AlertTriangle } from 'lucide-react'
import { useDownloadLimit } from '../hooks/useDownloadLimit'
import { useAuth } from '../hooks/useAuth'

interface DownloadLimitNotificationProps {
  onClose?: () => void
}

export default function DownloadLimitNotification({
  onClose,
}: DownloadLimitNotificationProps) {
  const { getDownloadInfo, isAnonymous } = useDownloadLimit()
  const { user } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const downloadInfo = getDownloadInfo()

  useEffect(() => {
    // Mostrar notificação apenas para usuários anônimos que atingiram o limite
    if (isAnonymous && !downloadInfo.canDownload) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [isAnonymous, downloadInfo.canDownload])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  const handleLoginClick = () => {
    // Aqui você pode adicionar a lógica para abrir o modal de login
    // Por enquanto, vamos apenas fechar a notificação
    handleClose()
  }

  if (!isVisible || user) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="fixed top-4 right-4 z-50 max-w-sm w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-orange-200 dark:border-orange-800 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="h-5 w-5 text-white" />
                <h3 className="text-white font-semibold">Limite Atingido</h3>
              </div>
              <button
                onClick={handleClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                  Você atingiu o limite de {downloadInfo.total} downloads
                  gratuitos por dia.
                </p>

                <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-orange-700 dark:text-orange-300">
                      Downloads restantes:
                    </span>
                    <span className="font-bold text-orange-600 dark:text-orange-400">
                      {downloadInfo.remaining} / {downloadInfo.total}
                    </span>
                  </div>
                </div>

                {!showDetails && (
                  <button
                    onClick={() => setShowDetails(true)}
                    className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
                  >
                    Ver benefícios de fazer login
                  </button>
                )}

                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 mb-4"
                  >
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span>Downloads ilimitados</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span>Favoritar memes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span>Histórico pessoal</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      <span>Upload de memes</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 mt-4">
              <button
                onClick={handleLoginClick}
                className="flex-1 bg-gradient-to-r from-primary-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 text-sm"
              >
                <User className="h-4 w-4 mr-2 inline" />
                Fazer Login
              </button>

              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
              >
                Depois
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
