import React from 'react'

export default function Feed() {
  console.log('🔍 Feed: Componente SIMPLES iniciando renderização')


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">
          Feed de Memes - TESTE SIMPLES
        </h1>

        <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold text-blue-800 dark:text-blue-200 mb-4">
            Status do Componente
          </h2>
          <p className="text-blue-700 dark:text-blue-300">
            ✅ Este componente está funcionando! Se você vê esta mensagem, o
            problema não é no Feed.
          </p>
          <p className="text-blue-600 dark:text-blue-400 mt-2">
            🔍 Verifique o console para logs de debug
          </p>
        </div>

        <div className="mt-8 bg-green-100 dark:bg-green-900 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-2">
            Próximos Passos
          </h3>
          <ul className="text-green-700 dark:text-green-300 space-y-1">
            <li>• Componente Feed renderizando ✅</li>
            <li>• Verificar se Header está funcionando</li>
            <li>• Verificar se App.tsx está funcionando</li>
            <li>• Verificar se há erros no console</li>
          </ul>
        </div>

        <div className="mt-8 bg-yellow-100 dark:bg-yellow-900 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            Debug Info
          </h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            Timestamp: {new Date().toLocaleString()}
          </p>
          <p className="text-yellow-700 dark:text-yellow-300">
            User Agent: {navigator.userAgent}
          </p>
        </div>
      </div>
    </div>
  )
}
