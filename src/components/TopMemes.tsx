import React, { useState } from 'react'

import { motion } from 'framer-motion'
import {
  Heart,
  Download,
  Star,
  Trophy,
  Flame,
  TrendingUp,
  Share2,
} from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import MemeViewModal from './MemeViewModal'
import type { Meme } from '../lib/supabase'

interface TopMemesProps {
  onMemeClick?: (meme: Meme) => void
}

export default function TopMemes({ onMemeClick }: TopMemesProps) {
  const { memes, loading, error, shareMemeWithUrl } = useMemes()
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Calcular top 3 memes baseado em pontuação ponderada
  const topMemes = React.useMemo(() => {
    if (!memes || memes.length === 0) return []

    return [...memes]
      .map((meme) => {
        // Fórmula de pontuação: likes*1 + downloads*2 + shares*3
        const likes = meme.like_count || 0
        const downloads = meme.download_count || 0
        const shares = (meme as any).share_count || 0

        const score = likes * 1 + downloads * 2 + shares * 3

        return { ...meme, score }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3) // Apenas top 3 memes
  }, [memes])

  const handleMemeClick = (meme: Meme) => {
    setSelectedMeme(meme)
    setIsModalOpen(true)

    if (onMemeClick) {
      onMemeClick(meme)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMeme(null)
  }

  if (loading) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Top 3 Memes
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Top 3 memes por pontuação: likes + downloads ×2 + partilhas ×3
            </p>
          </div>

          {/* Loading skeleton - mobile responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse"
              >
                <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Top 3 Memes
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (topMemes.length === 0) {
    return (
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Top 3 Memes
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto">
              <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum meme em destaque no momento
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <div className="flex items-center justify-center mb-4">
              <Flame className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500 mr-3" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                Top 3 Memes
              </h2>
            </div>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Os 3 memes mais compartilhados (em alta)
            </p>
          </motion.div>

          {/* Grid responsivo para mobile - apenas top 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 w-full max-w-full">
            {topMemes.map((meme, index) => (
              <motion.button
                key={meme.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMemeClick(meme)}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 text-left"
              >
                {/* Badge de posição - ouro, prata, bronze */}
                <div className="absolute -top-2 -right-2 z-10">
                  <div
                    className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full text-white font-bold text-sm ${
                      index === 0
                        ? 'bg-yellow-500'
                        : index === 1
                        ? 'bg-gray-400'
                        : 'bg-orange-600'
                    }`}
                  >
                    {index === 0 ? (
                      <Star className="h-4 w-4 sm:h-5 sm:w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                </div>

                {/* Imagem do meme */}
                <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-700">
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

                  {/* Overlay com estatísticas */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="flex items-center justify-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <Share2 className="h-4 w-4 mr-1" />
                          <span>
                            {((meme as any).share_count || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs mt-2 opacity-75">Clique para ver</p>
                    </div>
                  </div>
                </div>

                {/* Informações do meme */}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 text-sm sm:text-base">
                    {meme.title || 'Meme sem título'}
                  </h3>

                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
                    {typeof meme.category === 'string'
                      ? meme.category
                      : 'Sem categoria'}
                  </p>

                  {/* Estatísticas */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>{(meme.like_count || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>
                          {(meme.download_count || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>
                          {((meme as any).share_count || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-8 sm:mt-12"
          >
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4">
              Quer ver seu meme no pódio? Faça upload e ganhe visualizações!
            </p>
            <button className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 text-sm sm:text-base">
              Publicar meme
            </button>
          </motion.div>
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
