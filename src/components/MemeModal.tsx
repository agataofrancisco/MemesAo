import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Heart, Download, Share2, Eye, Trophy } from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import type { Meme } from '../lib/supabase'

interface MemeModalProps {
  isOpen: boolean
  onClose: () => void
  meme: Meme | null
}

export default function MemeModal({ isOpen, onClose, meme }: MemeModalProps) {
  const {
    toggleFavorite,
    favorites,
    downloadMeme,
    shareMemeWithUrl,
  } = useMemes()

  if (!meme) return null

  const isFavorite = favorites.includes(meme.id)
  const score =
    (meme.like_count || 0) +
    (meme.download_count || 0) * 2 +
    ((meme as any).share_count || 0) * 3

  const handleFavorite = async () => {
    await toggleFavorite(meme.id)
  }

  const handleDownload = async () => {
    await downloadMeme(meme)
  }

  const handleShare = async () => {
    await shareMemeWithUrl(meme)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {meme.title || 'Meme sem título'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Categoria: {meme.category || 'Sem categoria'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className="p-4 sm:p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Imagem do meme */}
              <div className="relative mb-6">
                <img
                  src={meme.image_url}
                  alt={meme.title || 'Meme'}
                  className="w-full h-auto max-h-96 object-contain bg-gray-100 dark:bg-gray-700 rounded-xl"
                  loading="lazy"
                />

                {/* Overlay com estatísticas */}
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{(meme.view_count || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center">
                      <Trophy className="h-4 w-4 mr-1" />
                      <span>{score.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações do meme */}
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {meme.description || 'Sem descrição'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Por: {meme.uploaded_by_name || 'Anônimo'}</span>
                  <span>•</span>
                  <span>
                    {new Date(meme.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Estatísticas detalhadas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(meme.like_count || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Likes
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Download className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(meme.download_count || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Downloads
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Share2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {((meme as any).share_count || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Partilhas
                  </div>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {score.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Score
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleFavorite}
                  className={`flex-1 flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isFavorite
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Heart
                    className={`h-5 w-5 mr-2 ${
                      isFavorite ? 'fill-current' : ''
                    }`}
                  />
                  {isFavorite ? 'Descurtir' : 'Curtir'}
                </button>

                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all duration-200"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download
                </button>

                <button
                  onClick={handleShare}
                  className="flex-1 flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all duration-200"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Partilhar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
