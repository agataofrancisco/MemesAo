import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Heart, Share2, LogOut, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useStats } from '../hooks/useStats'
import toast from 'react-hot-toast'

interface ProfilePageProps {
  onBack: () => void
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const { user, profile, signOut } = useAuth()
  const { stats } = useStats()

  const personalStats = useMemo(
    () => [
      { icon: Download, label: 'Seus Downloads', value: stats.userDownloads },
      { icon: Heart, label: 'Seus Likes', value: stats.userFavorites },
      { icon: Share2, label: 'Suas Partilhas', value: stats.userShares },
    ],
    [stats.userDownloads, stats.userFavorites, stats.userShares]
  )

  if (!user) {
    return (
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Área restrita</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Faça login para ver as suas estatísticas pessoais.</p>
            <button onClick={onBack} className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600">Voltar</button>
          </div>
        </div>
      </section>
    )
  }

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast.error('Erro ao sair')
    } else {
      toast.success('Sessão terminada')
      onBack()
    }
  }

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <button onClick={onBack} className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </button>
          <button onClick={handleSignOut} className="inline-flex items-center px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600">
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </button>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center text-lg font-bold mr-4">
              {profile?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile?.username || user.email}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Membro desde {new Date(user.created_at!).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <span className="text-gray-600 dark:text-gray-400 text-sm">{s.label}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{s.value.toLocaleString()}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}