import { useState, useEffect } from 'react'
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
import { useDownloadLimit } from '../hooks/useDownloadLimit'
import DownloadStatus from './DownloadStatus'
import type { Meme } from '../lib/types'
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

  const { downloadMeme, toggleFavorite, favorites, shareMeme } = useMemes()
  const { user } = useAuth()
  const { canDownload, registerDownload } = useDownloadLimit()

  // Atualizar meta tags quando a modal abrir
  useEffect(() => {
    if (isOpen && meme) {
      // Atualizar título da página
      const originalTitle = document.title
      document.title = `${meme.title || 'Meme'} - MemesAo`

      // Atualizar meta tags Open Graph
      updateMetaTag(
        'property',
        'og:title',
        meme.title || 'Meme Engraçado - MemesAo',
      )
      updateMetaTag(
        'property',
        'og:description',
        meme.description || 'Olha esse meme engraçado!',
      )
      updateMetaTag('property', 'og:image', meme.image_url)
      updateMetaTag(
        'property',
        'og:url',
        `${window.location.origin}/meme/${meme.id}`,
      )
      updateMetaTag('property', 'og:type', 'article')

      // Atualizar Twitter Card
      updateMetaTag(
        'name',
        'twitter:title',
        meme.title || 'Meme Engraçado - MemesAo',
      )
      updateMetaTag(
        'name',
        'twitter:description',
        meme.description || 'Olha esse meme engraçado!',
      )
      updateMetaTag('name', 'twitter:image', meme.image_url)

      // Restaurar quando a modal fechar
      return () => {
        document.title = originalTitle
        // Restaurar meta tags originais
        updateMetaTag(
          'property',
          'og:title',
          'MemesAo - O Maior Acervo Digital de Memes Angolanos',
        )
        updateMetaTag(
          'property',
          'og:description',
          'Descubra, compartilhe e contribua para o maior acervo digital de memes angolanos. Sistema de OCR integrado para busca inteligente e categorização automática.',
        )
        updateMetaTag('property', 'og:image', 'https://memesao.ao/og-image.jpg')
        updateMetaTag('property', 'og:url', 'https://memesao.ao')
        updateMetaTag('property', 'og:type', 'website')
        updateMetaTag(
          'name',
          'twitter:title',
          'MemesAo - O Maior Acervo Digital de Memes Angolanos',
        )
        updateMetaTag(
          'name',
          'twitter:description',
          'Descubra, compartilhe e contribua para o maior acervo digital de memes angolanos.',
        )
        updateMetaTag(
          'name',
          'twitter:image',
          'https://memesao.ao/og-image.jpg',
        )
      }
    }
  }, [isOpen, meme])

  // Função para atualizar meta tags
  const updateMetaTag = (
    attribute: 'name' | 'property',
    value: string,
    content: string,
  ) => {
    let meta = document.querySelector(
      `meta[${attribute}="${value}"]`,
    ) as HTMLMetaElement
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute(attribute, value)
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', content)
  }

  if (!isOpen || !meme) return null

  const isFavorited = favorites.includes(meme.id)
  const formattedDate = new Date(meme.created_at).toLocaleDateString('pt-BR')

  const handleDownload = async () => {
    if (isDownloading) return

    if (!canDownload) {
      toast.error('Limite de downloads atingido. Faça login para continuar.')
      return
    }

    setIsDownloading(true)
    try {
      // Registrar download no limite
      const success = registerDownload()
      if (!success) {
        toast.error('Limite de downloads atingido. Faça login para continuar.')
        return
      }

      await downloadMeme(meme)
      toast.success('Download iniciado!')
    } catch (error) {
      console.error('Erro no download:', error)
      toast.error('Erro ao baixar meme')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleFavorite = async () => {
    if (isFavoriting) return

    if (!user) {
      toast.error('Faça login para curtir memes')
      return
    }

    setIsFavoriting(true)
    try {
      await toggleFavorite(meme.id)
      toast.success(
        isFavorited ? 'Removido dos favoritos' : 'Adicionado aos favoritos',
      )
    } catch (error) {
      console.error('Erro ao curtir:', error)
      toast.error('Erro ao curtir meme')
    } finally {
      setIsFavoriting(false)
    }
  }

  const handleShare = async () => {
    const memeUrl = `${window.location.origin}/meme/${meme.id}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.title || 'Meme Engraçado - MemesAo',
          text: meme.description || 'Olha esse meme engraçado!',
          url: memeUrl,
        })
        await shareMeme(meme)
        toast.success('Meme partilhado com sucesso!')
      } catch {
        // User cancelled sharing
        console.log('Partilha cancelada pelo usuário')
      }
    } else {
      // Fallback para copiar URL
      try {
        await navigator.clipboard.writeText(memeUrl)
        toast.success('Link copiado para área de transferência!')
        await shareMeme(meme)
      } catch {
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
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>{meme.profile?.username || 'Anónimo'}</span>
                </div>
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
              {/* Status de Downloads para usuários anônimos */}
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <DownloadStatus showDetails={false} />
              </div>

              {/* Actions */}
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleFavorite}
                    disabled={isFavoriting || !user}
                    className={`flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isFavorited
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : user
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={!user ? 'Faça login para curtir' : ''}
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
                          {!user ? 'Login' : isFavorited ? 'Curtido' : 'Curtir'}
                        </span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownload}
                    disabled={isDownloading || !canDownload}
                    className={`flex items-center justify-center px-4 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                      canDownload
                        ? 'bg-primary-500 text-white hover:bg-primary-600'
                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                    title={
                      !canDownload
                        ? 'Limite de downloads atingido. Faça login para continuar.'
                        : ''
                    }
                  >
                    {isDownloading ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Download className="h-5 w-5 mr-2" />
                        <span className="hidden sm:inline">
                          {canDownload ? 'Baixar' : 'Limite'}
                        </span>
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
                      {(meme.like_count || 0).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Share2 className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Partilhas
                      </span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(meme.share_count || 0).toLocaleString()}
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
