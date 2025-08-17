import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Download, ArrowRight, Sparkles, Heart } from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useStats } from '../hooks/useStats'
import MemeViewModal from './MemeViewModal'
import type { Meme } from '../lib/supabase'

interface FeaturedMemesProps {
  onCategoryClick?: (categoryName: string) => void
  onMemeClick?: (meme: Meme) => void
}

export default function FeaturedMemes({
  onCategoryClick,
  onMemeClick,
}: FeaturedMemesProps) {
  const {
    categories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useStats()
  const {
    memes: allMemes,
    loading: memesLoading,
    error: memesError,
  } = useMemes()
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Usar useMemo para evitar recálculos desnecessários
  const categoriesWithMemes = useMemo(() => {
    // Só processar quando os dados estiverem carregados e sem erros
    if (categoriesLoading || memesLoading || categoriesError || memesError) {
      return []
    }

    // Se não há categorias ou memes, não há nada para mostrar
    if (categories.length === 0 || allMemes.length === 0) {
      console.log('Sem categorias ou memes para processar')
      return []
    }

    const categoriesWithTopMemes = categories.map((category) => {
      const categoryMemes = allMemes.filter((meme) => {
        return (
          meme.category === category.name ||
          (meme.category_id && meme.category_id === category.id)
        )
      })

      const sortedMemes = categoryMemes
        .sort((a, b) => {
          const aScore = a.download_count || 0
          const bScore = b.download_count || 0
          return bScore - aScore
        })
        .slice(0, 3)

      return {
        ...category,
        topMemes: sortedMemes,
      }
    })

    const categoriesWithValidMemes = categoriesWithTopMemes.filter(
      (cat) => cat.topMemes.length > 0,
    )

    console.log('Categorias com memes:', categoriesWithValidMemes.length)
    return categoriesWithValidMemes
  }, [
    allMemes,
    categories,
    categoriesLoading,
    memesLoading,
    categoriesError,
    memesError,
  ])

  const handleCategoryClick = useCallback(
    (categoryName: string) => {
      if (onCategoryClick) {
        onCategoryClick(categoryName)
      }
    },
    [onCategoryClick],
  )

  const handleMemeClick = useCallback(
    (meme: Meme) => {
      setSelectedMeme(meme)
      setIsModalOpen(true)
      if (onMemeClick) {
        onMemeClick(meme)
      }
    },
    [onMemeClick],
  )

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMeme(null)
  }

  if (categoriesLoading || memesLoading) {
    return (
      <section id="featured" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore os Memes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Descubra os memes mais populares por categoria
            </p>
          </div>

          <div className="space-y-16">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, j) => (
                    <div
                      key={j}
                      className="bg-gray-300 dark:bg-gray-700 rounded-xl aspect-square"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (categoriesError || memesError) {
    return (
      <section id="featured" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore os Memes
            </h2>
          </div>

          <div className="text-center py-12">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-300 text-sm">
                {categoriesError || memesError}
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (categoriesWithMemes.length === 0) {
    return (
      <section id="featured" className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Explore os Memes
            </h2>
          </div>

          <div className="text-center py-12">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 max-w-md mx-auto">
              <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Em breve...
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Novos memes estão chegando! Volte em breve.
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section id="featured" className="py-20 bg-white dark:bg-gray-900">
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

          <div className="space-y-16">
            {categoriesWithMemes.map((category, categoryIndex) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mr-4">
                      {category.name}
                    </h3>
                    <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full text-sm font-medium">
                      {category.count} memes
                    </span>
                  </div>

                  <button
                    onClick={() => handleCategoryClick(category.name)}
                    className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors group"
                  >
                    <span className="mr-2">Ver todos</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Memes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full max-w-full">
                  {category.topMemes.map((meme, memeIndex) => (
                    <motion.button
                      key={meme.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: memeIndex * 0.1 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMemeClick(meme)}
                      className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 text-left"
                    >
                      {/* Image */}
                      <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <img
                          src={meme.image_url}
                          alt={meme.title || 'Meme'}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src =
                              'https://via.placeholder.com/400x400.png?text=Erro'
                          }}
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="text-white text-center">
                            <div className="flex items-center justify-center space-x-4 text-sm">
                              <div className="flex items-center">
                                <Download className="h-4 w-4 mr-1" />
                                <span>{meme.download_count || 0}</span>
                              </div>
                            </div>
                            <p className="text-xs mt-2 opacity-75">
                              Clique para ver detalhes
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {meme.title || 'Meme sem título'}
                        </h4>

                        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              <span>
                                {(meme.like_count || 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Download className="h-3 w-3 mr-1" />
                              <span>
                                {(meme.download_count || 0).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de visualização */}
      <MemeViewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        meme={selectedMeme}
      />
    </>
  )
}
