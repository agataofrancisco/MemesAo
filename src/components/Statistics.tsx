import React from 'react'
import { motion } from 'framer-motion'
import { Users, Image, Download, Heart } from 'lucide-react'
import { useStats } from '../hooks/useStats'
import { useAuth } from '../hooks/useAuth'

export default function Statistics() {
  const { stats, loading } = useStats()
  const { user } = useAuth()
  const isLogged = !!user

  const statsData = [
    {
      id: 1,
      icon: Image,
      value: loading ? '...' : stats.totalMemes.toString(),
      label: 'Memes no Acervo',
      color: 'from-primary-500 to-blue-500',
    },
    {
      id: 2,
      icon: Download,
      value: loading ? '...' : (isLogged ? stats.userDownloads.toString() : stats.totalDownloads.toString()),
      label: isLogged ? 'Seus Downloads' : 'Downloads Realizados',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 3,
      icon: Users,
      value: loading ? '...' : stats.totalUsers.toString(),
      label: 'Usuários Ativos',
      color: 'from-teal-500 to-green-500',
    },
    {
      id: 4,
      icon: Heart,
      value: loading ? '...' : (isLogged ? stats.userFavorites.toString() : stats.totalFavorites.toString()),
      label: isLogged ? 'Seus Likes' : 'Memes Curtidos',
      color: 'from-accent-500 to-red-500',
    },
  ]

  return (
    <section className="py-20 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Números que Impressionam
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            A maior comunidade de memes angolanos está crescendo todos os dias
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {statsData.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              <div
                className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${stat.color} rounded-full mb-6`}
              >
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <motion.h3
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                viewport={{ once: true }}
                className="text-4xl font-bold text-gray-900 dark:text-white mb-2"
              >
                {stat.value}
              </motion.h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
