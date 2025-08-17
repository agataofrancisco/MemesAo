import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Heart,
  Download,
  Eye,
  Star,
  Grid,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { useStats } from '../hooks/useStats'
import { useMemes } from '../hooks/useMemes'
import type { Meme } from '../lib/supabase'

interface FeaturedMemesProps {
  onCategoryClick?: (categoryName: string) => void
  onMemeClick?: (meme: Meme) => void
}

interface CategoryWithMemes {
  id: string
  name: string
  icon: string
  color: string
  count: number
  topMemes: Meme[]
}

export default function FeaturedMemes({ onCategoryClick, onMemeClick }: FeaturedMemesProps) {
  const { categories, loading: categoriesLoading } = useStats()
  const { memes: allMemes, loading: memesLoading } = useMemes()
  const [categoriesWithMemes, setCategoriesWithMemes] = useState<CategoryWithMemes[]>([])

  useEffect(() => {
    if (!categoriesLoading && !memesLoading && allMemes.length > 0) {
      const categoriesWithTopMemes = categories.map(category => {
        const categoryMemes = allMemes
          .filter(meme => meme.category?.id === category.id)
          .sort((a, b) => (b.view_count + b.download_count) - (a.view_count + a.download_count))
          .slice(0, 3) // Top 3 memes por categoria

        return {
          ...category,
          topMemes: categoryMemes
        }
      }).filter(cat => cat.topMemes.length > 0) // Só mostrar categorias com memes

      setCategoriesWithMemes(categoriesWithTopMemes)
    }
  }, [allMemes, categories, categoriesLoading, memesLoading])

  const handleCategoryClick = (categoryName: string) => {
    if (onCategoryClick) {
      onCategoryClick(categoryName)
    }
  }

  const handleMemeClick = (meme: Meme) => {
    if (onMemeClick) {
      onMemeClick(meme)
    }
  }

  if (categoriesLoading || memesLoading) {
    return (
      <section
        id="explorar"
        className="py-20 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore os Memes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Descubra os memes mais populares organizados por categoria
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-32" />
                  <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      id="explorar"
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
            Explore os Memes
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Descubra os memes mais populares organizados por categoria
          </p>
        </motion.div>

        {categoriesWithMemes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Nenhum meme disponível no momento.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              Seja o primeiro a compartilhar um meme!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {categoriesWithMemes.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                {/* Header da Categoria */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-3 bg-gradient-to-r ${category.color} rounded-xl`}
                    >
                      <Grid className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category.count} {category.count === 1 ? 'meme' : 'memes'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCategoryClick(category.name)}
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm flex items-center space-x-1"
                  >
                    <span>Ver todos</span>
                    <TrendingUp className="h-4 w-4" />
                  </button>
                </div>

                {/* Grid de Memes */}
                <div className="grid grid-cols-3 gap-3">
                  {category.topMemes.map((meme, memeIndex) => (
                    <motion.button
                      key={meme.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMemeClick(meme)}
                      className="group relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
                    >
                      <img
                        src={meme.image_url}
                        alt={meme.title || 'Meme'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      
                      {/* Overlay com estatísticas */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                        <div className="flex items-center justify-between text-white text-xs">
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{meme.view_count}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Download className="h-3 w-3" />
                            <span>{meme.download_count}</span>
                          </div>
                        </div>
                      </div>

                      {/* Badge de posição para o primeiro meme */}
                      {memeIndex === 0 && (
                        <div className="absolute top-1 left-1 bg-yellow-500 text-white rounded-full p-1">
                          <Star className="h-3 w-3" />
                        </div>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Footer com ação */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => handleCategoryClick(category.name)}
                    className="w-full text-center py-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium text-sm transition-colors duration-200"
                  >
                    Explorar {category.name} →
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Não encontrou o que procurava?
            </h3>
            <p className="text-primary-100 mb-6 max-w-2xl mx-auto">
              Explore todas as categorias ou faça uma busca específica para encontrar
              exatamente o meme que você está procurando.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleCategoryClick('Todas')}
                className="bg-white text-primary-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Grid className="h-5 w-5" />
                <span>Ver Todos os Memes</span>
              </button>
              <button className="bg-primary-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-800 transition-colors duration-200 flex items-center justify-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Mais Recentes</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}