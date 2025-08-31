import React from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface DownloadLimitNotificationProps {
  onClose: () => void
}

export default function DownloadLimitNotification({
  onClose,
}: DownloadLimitNotificationProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 max-w-sm shadow-lg">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Limite de Downloads Atingido
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
            Você atingiu o limite de 3 downloads para usuários anônimos. Faça
            login para continuar baixando.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
