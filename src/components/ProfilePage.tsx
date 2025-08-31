import React from 'react'

interface ProfilePageProps {
  user: { email: string; role: string } | null
}

export default function ProfilePage({ user }: ProfilePageProps) {
  console.log('🔍 ProfilePage: Renderizando com user:', user)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Perfil não encontrado
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Faça login para ver seu perfil
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Perfil do Usuário
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <p className="mt-1 text-lg text-gray-900 dark:text-white">
                {user.email}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Função
              </label>
              <p className="mt-1 text-lg text-gray-900 dark:text-white">
                {user.role === 'admin' ? 'Administrador' : 'Usuário'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
