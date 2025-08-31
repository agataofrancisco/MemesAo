import React from 'react'
import { Download, AlertTriangle } from 'lucide-react'

interface DownloadStatusProps {
  className?: string
  showDetails?: boolean
}

export default function DownloadStatus({
  className = '',
  showDetails = false,
}: DownloadStatusProps) {
  return (
    <div
      className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 ${className}`}
    >
      <div className="flex items-center space-x-3">
        <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Status de Downloads
          </h3>
          {showDetails && (
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Usuários anônimos podem baixar até 3 memes por dia. Faça login
              para downloads ilimitados.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
