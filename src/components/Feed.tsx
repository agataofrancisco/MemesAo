import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Download,
  Share2,
  Filter,
  Loader,
  ChevronDown,
  X,
  Settings,
  TrendingUp,
  Clock,
  Star,
} from 'lucide-react'
import { useOptimizedMemes } from '../hooks/useOptimizedMemes'
import { useStats } from '../hooks/useStats'
import { useAuth } from '../hooks/useAuth'
import { useDownloadLimit } from '../hooks/useDownloadLimit'
import DownloadStatus from './DownloadStatus'
import MemeViewModal from './MemeViewModal'
import UserInterests from './UserInterests'
import OptimizedImage from './OptimizedImage'
import type { Meme } from '../lib/supabase'
import toast from 'react-hot-toast'

interface FeedProps {
  className?: string
  onAuthClick?: () => void
  onCategoryClick?: (category: string) => void
}

export default function Feed({
  className = '',
  onAuthClick,
  onCategoryClick,
}: FeedProps) {
  const {
    memes,
    loading,
    error,
    toggleFavorite,
    favorites,
    shareMeme,
    downloadMeme,
    hasMore,
    loadingMore,
    loadMore,
    resetToFirstPage,
    filterByCategory,
    searchMemes,
  } = useOptimizedMemes({
    pageSize: 20,
    preloadDistance: 800,
  })
  const { categories, loading: categoriesLoading } = useStats()
  const { user } = useAuth()
  const { canDownload, registerDownload, getDownloadInfo } = useDownloadLimit()

  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUserInterestsOpen, setIsUserInterestsOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilter, setActiveFilter] = useState<
    'trending' | 'recent' | 'interests'
  >('trending')

  // Filtrar memes baseado nas categorias selecionadas e filtro ativo
  const getFilteredMemes = useCallback(() => {
    let filtered = memes

    // Aplicar filtro de categorias
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((meme) =>
        selectedCategories.includes(meme.category || ''),
      )
    }

    // Aplicar filtro de ordenação
    switch (activeFilter) {
      case 'trending':
        filtered = [...filtered].sort((a, b) => {
          const scoreA =
            (a.like_count || 0) * 1 +
            (a.download_count || 0) * 2 +
            ((a as any).share_count || 0) * 3
          const scoreB =
            (b.like_count || 0) * 1 +
            (b.download_count || 0) * 2 +
            ((b as any).share_count || 0) * 3
          return scoreB - scoreA
        })
        break
      case 'recent':
        filtered = [...filtered].sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime()
          const dateB = new Date(b.created_at || 0).getTime()
          return dateB - dateA
        })
        break
      case 'interests':
        // Manter ordem original para interesses
        break
    }

    return filtered
  }, [memes, selectedCategories, activeFilter])

  // Aplicar filtros quando mudar
  useEffect(() => {
    if (selectedCategories.length > 0) {
      const filtered = getFilteredMemes()
      filterByCategory(selectedCategories[0])
    } else {
      resetToFirstPage()
    }
  }, [
    selectedCategories,
    activeFilter,
    getFilteredMemes,
    filterByCategory,
    resetToFirstPage,
  ])

  // Toggle categoria
  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryName)) {
        return prev.filter((cat) => cat !== categoryName)
      } else {
        return [...prev, categoryName]
      }
    })
  }

  // Toggle filtro
  const toggleFilter = (filter: 'trending' | 'recent' | 'interests') => {
    setActiveFilter(filter)
    resetToFirstPage()
  }

  // Toggle favorito
  const handleToggleFavorite = async (meme: Meme) => {
    if (!user) {
      toast.error('Faça login para curtir memes')
      onAuthClick?.()
      return
    }

    try {
      await toggleFavorite(meme.id)
      toast.success(
        favorites.includes(meme.id)
          ? 'Removido dos favoritos'
          : 'Adicionado aos favoritos',
      )
    } catch (error) {
      toast.error('Erro ao atualizar favoritos')
    }
  }

  // Compartilhar meme
  const handleShare = async (meme: Meme) => {
    try {
      await shareMeme(meme.id)
      toast.success('Meme compartilhado com sucesso!')
    } catch (error) {
      toast.error('Erro ao compartilhar meme')
    }
  }

  // Download meme
  const handleDownload = async (meme: Meme) => {
    if (!canDownload) {
      toast.error('Limite de downloads atingido. Faça login para continuar.')
      return
    }

    try {
      // Registrar download no limite
      const success = registerDownload()
      if (!success) {
        toast.error('Limite de downloads atingido. Faça login para continuar.')
        return
      }

      await downloadMeme(meme.id)
      toast.success('Download iniciado!')
    } catch (error) {
      toast.error('Erro ao fazer download')
    }
  }

  // Abrir modal do meme
  const handleMemeClick = (meme: Meme) => {
    setSelectedMeme(meme)
    setIsModalOpen(true)
  }

  // Fechar modal
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMeme(null)
  }

  // Loading skeleton otimizado
  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 animate-pulse"
        >
          <div className="aspect-square bg-gray-300 dark:bg-gray-700 rounded-xl mb-4" />
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
        </div>
      ))}
    </div>
  )

  if (loading) {
    return (
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Feed de Memes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Carregando os melhores memes...
          </p>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Feed de Memes
          </h1>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md mx-auto">
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Header do Feed */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Feed de Memes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Descubra os memes mais engraçados e compartilhados
        </p>
      </div>

      {/* Status de Downloads para usuários anônimos */}
      <DownloadStatus className="mb-6" showDetails={true} />

      {/* Filtros e Categorias */}
      <div className="mb-8">
        {/* Filtros principais */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
            <button
              onClick={() => toggleFilter('trending')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === 'trending'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Em Alta</span>
            </button>
            <button
              onClick={() => toggleFilter('recent')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === 'recent'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Recentes</span>
            </button>
            <button
              onClick={() => toggleFilter('interests')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeFilter === 'interests'
                  ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <Star className="h-4 w-4" />
              <span>Interesses</span>
            </button>
          </div>
        </div>

        {/* Categorias */}
        {categories && categories.length > 0 && (
          <div className="flex items-center justify-center flex-wrap gap-2">
            {categories.slice(0, 8).map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategories.includes(category)
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid de Memes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <AnimatePresence>
          {memes.map((meme, index) => (
            <motion.div
              key={meme.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              exit={{ opacity: 0, y: -20 }}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              {/* Imagem do meme com lazy loading otimizado */}
              <div className="relative aspect-square rounded-xl overflow-hidden mb-4 bg-gray-100 dark:bg-gray-700">
                <OptimizedImage
                  src={meme.image_url}
                  alt={meme.title || 'Meme'}
                  className="w-full h-full group-hover:scale-110 transition-transform duration-300"
                  fallback="https://via.placeholder.com/400x400.png?text=Erro+Carregamento"
                />
              </div>

              {/* Informações do meme */}
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm">
                  {meme.title || 'Meme sem título'}
                </h3>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
                  {typeof meme.category === 'string'
                    ? meme.category
                    : 'Sem categoria'}
                </p>

                {/* Estatísticas */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleFavorite(meme)}
                      className={`flex items-center space-x-1 transition-colors ${
                        favorites.includes(meme.id)
                          ? 'text-red-500'
                          : user
                          ? 'text-gray-600 dark:text-gray-400 hover:text-red-500'
                          : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      }`}
                      title={!user ? 'Faça login para curtir' : ''}
                    >
                      <Heart
                        className={`h-3 w-3 ${
                          favorites.includes(meme.id) ? 'fill-current' : ''
                        }`}
                      />
                      <span>{(meme.like_count || 0).toLocaleString()}</span>
                    </button>
                    <button
                      onClick={() => handleDownload(meme)}
                      className={`flex items-center space-x-1 transition-colors ${
                        canDownload
                          ? 'text-gray-600 dark:text-gray-400 hover:text-primary-500'
                          : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                      }`}
                      title={
                        !canDownload
                          ? 'Limite de downloads atingido. Faça login para continuar.'
                          : ''
                      }
                    >
                      <Download className="h-3 w-3" />
                      <span>{(meme.download_count || 0).toLocaleString()}</span>
                    </button>
                    <button
                      onClick={() => handleShare(meme)}
                      className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 hover:text-primary-500 transition-colors"
                      title="Compartilhar meme"
                    >
                      <Share2 className="h-3 w-3" />
                      <span>
                        {((meme as any).share_count || 0).toLocaleString()}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Overlay de clique */}
              <button
                onClick={() => handleMemeClick(meme)}
                className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 rounded-2xl flex items-center justify-center"
              >
                <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded-full">
                  Ver detalhes
                </span>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Loading mais memes */}
      {loadingMore && (
        <div className="text-center mt-8">
          <Loader className="h-8 w-8 text-primary-500 animate-spin mx-auto" />
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Carregando mais memes...
          </p>
        </div>
      )}

      {/* Sem mais memes */}
      {!hasMore && memes.length > 0 && (
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400">
            Você chegou ao fim! Não há mais memes para carregar.
          </p>
        </div>
      )}

      {/* Sem memes */}
      {memes.length === 0 && !loading && (
        <div className="text-center mt-8">
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto">
            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Nenhum meme encontrado com os filtros selecionados
            </p>
            <button
              onClick={() => {
                setSelectedCategories([])
                setActiveFilter('trending')
                resetToFirstPage()
              }}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* Modal de visualização */}
      <MemeViewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        meme={selectedMeme}
      />

      {/* Modal de interesses do usuário */}
      <UserInterests
        isOpen={isUserInterestsOpen}
        onClose={() => setIsUserInterestsOpen(false)}
      />
    </div>
  )
}
