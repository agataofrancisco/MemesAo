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
  AlertCircle,
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

interface CategoriesProps {
  onCategoryClick?: (categoryName: string) => void
}

export default function Categories({ onCategoryClick }: CategoriesProps) {
  const { categories, loading, error } = useStats()

  const handleCategoryClick = (categoryName: string) => {
    if (onCategoryClick) {
      onCategoryClick(categoryName)
    }
  }

  if (loading) {
    return (
      <section
        id="categorias"
        className="py-12 sm:py-16 lg:py-20 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Top 3 Categorias
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              As categorias mais populares com mais memes
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-300 dark:bg-gray-700 rounded-full mb-4" />
                <div className="h-5 sm:h-6 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 sm:h-4 bg-gray-300 dark:bg-gray-700 rounded mb-4" />
                <div className="h-6 sm:h-8 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section
        id="categorias"
        className="py-12 sm:py-16 lg:py-20 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Top 3 Categorias
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              As categorias mais populares com mais memes
            </p>
          </div>

          <div className="text-center py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 sm:p-8 max-w-md mx-auto">
              <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
                Erro ao carregar categorias
              </h3>
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="categorias"
      className="py-12 sm:py-16 lg:py-20 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Top 3 Categorias
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            As categorias mais populares com mais memes
          </p>
        </motion.div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
              <Tag className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Nenhuma categoria encontrada
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Não há categorias com memes no banco de dados.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {categories.map((category, index) => {
              const IconComponent =
                iconMap[category.icon as keyof typeof iconMap] || Tag

              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCategoryClick(category.name)}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 cursor-pointer group text-left w-full"
                >
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r ${category.color} rounded-full mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                  </div>

                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {category.name}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 line-clamp-2">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                      {category.count.toLocaleString()}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {category.count === 1 ? 'meme' : 'memes'}
                    </span>
                  </div>

                  <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    Clique para explorar →
                  </div>

                  {/* Badge de posição para top 3 */}
                  {index === 0 && (
                    <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full p-1.5 sm:p-2">
                      <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                    </div>
                  )}
                </motion.button>
              )
            })}
          </div>
        )}

        {/* Call to action se houver menos de 3 categorias */}
        {categories.length > 0 && categories.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-12"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 sm:p-8 max-w-md mx-auto">
              <p className="text-blue-700 dark:text-blue-300 text-sm sm:text-base">
                <strong>Mostrando {categories.length} de 3 categorias.</strong>
                <br />
                Mais categorias aparecerão conforme novos memes forem
                adicionados.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
