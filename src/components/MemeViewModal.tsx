import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Heart,
  Download,
  Calendar,
  User,
  Tag,
  Share2,
  Flag,
  Loader,
} from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useAuth } from '../hooks/useAuth'
import type { Meme } from '../lib/supabase'
import toast from 'react-hot-toast'

interface MemeViewModalProps {
  isOpen: boolean
  onClose: () => void
  meme: Meme | null
}

export default function MemeViewModal({
  isOpen,
  onClose,
  meme,
}: MemeViewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isFavoriting, setIsFavoriting] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const { downloadMeme, toggleFavorite, favorites } = useMemes()
  const { user } = useAuth()

  if (!isOpen || !meme) return null

  const isFavorited = favorites.includes(meme.id)
  const formattedDate = new Date(meme.created_at).toLocaleDateString('pt-BR')

  const handleDownload = async () => {
    if (isDownloading) return

    setIsDownloading(true)
    try {
      await downloadMeme(meme)
    } catch (error) {
      console.error('Erro no download:', error)
      toast.error('Erro ao baixar meme')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleFavorite = async () => {
    if (isFavoriting) return

    setIsFavoriting(true)
    try {
      await toggleFavorite(meme.id)
    } catch (error) {
      console.error('Erro ao curtir:', error)
      toast.error('Erro ao curtir meme')
    } finally {
      setIsFavoriting(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.title || 'Meme Engraçado',
          text: meme.description || 'Confira este meme!',
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback para copiar URL
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copiado para área de transferência!')
      } catch (error) {
        toast.error('Erro ao copiar link')
      }
    }
  }

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] my-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                {meme.title || 'Meme'}
              </h2>
              <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formattedDate}</span>
                </div>
                {meme.profile?.username && (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{meme.profile.username}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  <span>{meme.category || 'Sem categoria'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-4"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row max-h-[calc(90vh-140px)] overflow-hidden">
            {/* Image */}
            <div className="flex-1 flex items-center justify-center bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              )}
              <img
                src={meme.image_url}
                alt={meme.title || 'Meme'}
                className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src =
                    'https://via.placeholder.com/800x600.png?text=Erro+ao+carregar'
                  setImageLoaded(true)
                }}
              />
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto">
              {/* Actions */}
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleFavorite}
                    disabled={isFavoriting}
                    className={`flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isFavorited
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isFavoriting ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Heart
                          className={`h-5 w-5 mr-2 ${
                            isFavorited ? 'fill-current' : ''
                          }`}
                        />
                        <span className="hidden sm:inline">
                          {isFavorited ? 'Favoritado' : 'curtir'}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex items-center justify-center px-4 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">Baixar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Compartilhar</span>
                  </button>

                  <button
                    onClick={() => toast.success('Obrigado pelo feedback!')}
                    className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Reportar</span>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Estatísticas
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Download className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Downloads
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(meme.download_count || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Likes
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(meme.download_count || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {meme.description && (
                <div className="p-4 sm:p-6 flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Descrição
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {meme.description}
                  </p>
                </div>
              )}

              {/* OCR Text (if available) */}
              {meme.ocr_text && (
                <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Texto Detectado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                    {meme.ocr_text}
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
