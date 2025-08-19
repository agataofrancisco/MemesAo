import React from 'react'
import { useLocation, useParams } from 'react-router-dom'

export default function RouteTest() {
  const location = useLocation()
  const params = useParams()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Teste de Rotas
        </h2>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Pathname:</strong> {location.pathname}
          </p>
          <p>
            <strong>Params:</strong> {JSON.stringify(params)}
          </p>
          <p>
            <strong>Search:</strong> {location.search}
          </p>
          <p>
            <strong>Hash:</strong> {location.hash}
          </p>
        </div>
      </div>
    </div>
  )
}
