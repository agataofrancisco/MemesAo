import React, { useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Heart, Share2, LogOut, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'
import toast from 'react-hot-toast'

interface ProfilePageProps {
  user: { email: string; role: string } | null
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, profile, signOut } = useAuth()
  const { stats, loading, error } = useStats()

  // Debug: Log dos dados recebidos
  useEffect(() => {
    console.log('🔍 ProfilePage - Debug dos dados:')
    console.log('👤 User:', user)
    console.log('👤 Profile:', profile)
    console.log('📊 Stats:', stats)
    console.log('⏳ Loading:', loading)
    console.log('❌ Error:', error)
  }, [user, profile, stats, loading, error])

  const personalStats = useMemo(
    () => [
      { icon: User, label: 'Suas Publicações', value: stats.userMemes || 0 },
      { icon: Download, label: 'Seus Downloads', value: stats.userDownloads },
      { icon: Heart, label: 'Seus Likes', value: stats.userFavorites },
      { icon: Share2, label: 'Suas Partilhas', value: stats.userShares },
    ],
    [
      stats.userMemes,
      stats.userDownloads,
      stats.userFavorites,
      stats.userShares,
    ],
  )

  // Debug: Log das estatísticas calculadas
  useEffect(() => {
    console.log('📊 ProfilePage - Estatísticas calculadas:', personalStats)
  }, [personalStats])

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

        {/* Debug: Mostrar estado de loading e erro */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-blue-600 dark:text-blue-300 text-sm">
              ⏳ Carregando estatísticas...
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-300 text-sm">
              ❌ Erro: {error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {personalStats.map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center mb-3">
                <s.icon className="w-5 h-5 text-primary-500 mr-2" />
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  {s.label}
                </span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {s.value.toLocaleString()}
              </div>
              {/* Debug: Mostrar valor bruto */}
              <div className="text-xs text-gray-400 mt-1">
                Debug: {s.value} (raw)
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
