import React from 'react'
import { useLocation, useParams } from 'react-router-dom'

export default function RouteTest() {
  const location = useLocation()
  const params = useParams()

  return (
    <div className="p-8 bg-white dark:bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Teste de Rotas</h2>
      <div className="space-y-2">
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
  )
}
