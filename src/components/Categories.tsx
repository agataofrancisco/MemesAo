import React from 'react'
import { motion } from 'framer-motion'
import {
  Smile,
  Gamepad,
  Film,
  Trophy,
  Briefcase,
  Heart,
  Music,
  Coffee,
  Tag,
} from 'lucide-react'
import { useStats } from '../hooks/useStats'

const iconMap = {
  Smile: Smile,
  Gamepad: Gamepad,
  Film: Film,
  Trophy: Trophy,
  Briefcase: Briefcase,
  Heart: Heart,
  Music: Music,
  Coffee: Coffee,
  Tag: Tag,
}

// Categorias mock para quando não há dados no banco
const mockCategories = [
  {
    id: '1',
    name: 'Reação',
    count: 2,
    icon: 'Smile',
    color: 'from-primary-500 to-blue-500',
    description: 'Expressões e reações do dia a dia',
  },
  {
    id: '2',
    name: 'Games',
    count: 1,
    icon: 'Gamepad',
    color: 'from-purple-500 to-pink-500',
    description: 'Mundo dos jogos e gaming',
  },
  {
    id: '3',
    name: 'Filmes/TV',
    count: 0,
    icon: 'Film',
    color: 'from-teal-500 to-green-500',
    description: 'Cinema e televisão',
  },
  {
    id: '4',
    name: 'Esportes',
    count: 1,
    icon: 'Trophy',
    color: 'from-accent-500 to-red-500',
    description: 'Futebol e outros esportes',
  },
  {
    id: '5',
    name: 'Trabalho',
    count: 0,
    icon: 'Briefcase',
    color: 'from-indigo-500 to-purple-500',
    description: 'Vida profissional',
  },
  {
    id: '6',
    name: 'Amor',
    count: 0,
    icon: 'Heart',
    color: 'from-pink-500 to-red-500',
    description: 'Relacionamentos e amor',
  },
  {
    id: '7',
    name: 'Música',
    count: 0,
    icon: 'Music',
    color: 'from-green-500 to-teal-500',
    description: 'Artistas e música',
  },
  {
    id: '8',
    name: 'Cotidiano',
    count: 2,
    icon: 'Coffee',
    color: 'from-yellow-500 to-orange-500',
    description: 'Dia a dia angolano',
  },
]

interface CategoriesProps {
  onCategoryClick?: (categoryName: string) => void
}

export default function Categories({ onCategoryClick }: CategoriesProps) {
  const { categories: dbCategories, loading } = useStats()

  const handleCategoryClick = (categoryName: string) => {
    if (onCategoryClick) {
      onCategoryClick(categoryName)
    }
  }

  // Usar categorias do banco se disponíveis, senão usar mock
  const categoriesToShow =
    dbCategories.length > 0 ? dbCategories : mockCategories

  if (loading) {
    return (
      <section
        id="categorias"
        className="py-20 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Categorias Populares
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Explore os memes organizados por categoria para encontrar
              exatamente o que procura
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse"
              >
                <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-full mb-4" />
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="categorias"
      className="py-20 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Categorias Populares
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore os memes organizados por categoria para encontrar exatamente
            o que procura
          </p>
        </motion.div>

        {categoriesToShow.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Nenhuma categoria disponível no momento.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Configure o Supabase para ver as categorias da comunidade.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesToShow.map((category, index) => {
              const IconComponent =
                iconMap[category.icon as keyof typeof iconMap] || Tag

              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategoryClick(category.name)}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer group text-left w-full`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${category.color} rounded-full mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {category.count.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {category.count === 1 ? 'meme' : 'memes'}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Clique para explorar →
                  </div>
                </motion.button>
              )
            })}
          </div>
        )}

        {/* Aviso quando usando dados mock */}
        {dbCategories.length === 0 && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Modo Demo:</strong> Mostrando categorias de exemplo.{' '}
                Configure o banco de dados para ver dados reais.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
