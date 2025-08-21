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
} from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useStats } from '../hooks/useStats'
import { useAuth } from '../hooks/useAuth'
import MemeViewModal from './MemeViewModal'
import UserInterests from './UserInterests'
import type { Meme } from '../lib/supabase'
import toast from 'react-hot-toast'

interface FeedProps {
  className?: string
  onAuthClick?: () => void
}

export default function Feed({ className = '', onAuthClick }: FeedProps) {
  const {
    memes,
    loading,
    error,
    toggleFavorite,
    favorites,
    shareMeme,
    downloadMeme,
  } = useMemes()
  const { categories, loading: categoriesLoading } = useStats()
  const { user } = useAuth()

  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isUserInterestsOpen, setIsUserInterestsOpen] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [filteredMemes, setFilteredMemes] = useState<Meme[]>([])
  const [loadingMore, setLoadingMore] = useState(false)

  const ITEMS_PER_PAGE = 12

  // Carregar mais memes
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    setTimeout(() => {
      setPage((prev) => prev + 1)
      setLoadingMore(false)
    }, 300)
  }, [loadingMore, hasMore])

  // Filtrar memes baseado nas categorias selecionadas
  const getFilteredMemes = useCallback(() => {
    if (selectedCategories.length === 0) {
      return memes
    }

    return memes.filter((meme) =>
      selectedCategories.includes(meme.category || ''),
    )
  }, [memes, selectedCategories])

  // Atualizar memes filtrados quando mudar filtros
  useEffect(() => {
    const filtered = getFilteredMemes()
    setFilteredMemes(filtered.slice(0, page * ITEMS_PER_PAGE))
    setHasMore(filtered.length > page * ITEMS_PER_PAGE)
  }, [getFilteredMemes, page, selectedCategories])

  // Carregar mais memes automaticamente
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 1000
      ) {
        if (!loadingMore && hasMore) {
          loadMore()
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [loadingMore, hasMore, loadMore])

  // Toggle categoria
  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryName)) {
        return prev.filter((cat) => cat !== categoryName)
      } else {
        return [...prev, categoryName]
      }
    })
    setPage(1) // Reset para primeira página
  }

  // Limpar todos os filtros
  const clearFilters = () => {
    setSelectedCategories([])
    setPage(1)
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

  // Handle like
  const handleLike = async (meme: Meme) => {
    try {
      await toggleFavorite(meme.id)
    } catch (error) {
      toast.error('Erro ao curtir meme')
    }
  }

  // Handle download
  const handleDownload = async (meme: Meme) => {
    try {
      await downloadMeme(meme)
      toast.success('Meme baixado!')
    } catch (error) {
      toast.error('Erro ao baixar')
    }
  }

  // Handle share
  const handleShare = async (meme: Meme) => {
    try {
      await shareMeme(meme)
      toast.success('Meme partilhado!')
    } catch (error) {
      toast.error('Erro ao partilhar')
    }
  }

  if (loading || categoriesLoading) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <Loader className="h-8 w-8 animate-spin text-primary-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Carregando feed...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 ${className}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 max-w-md mx-auto">
              <p className="text-red-600 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Feed de Memes
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Descobre os melhores memes das tuas categorias favoritas
          </p>
        </div>

        {/* Call to Action - Criar Conta ou Personalizar */}
        {user ? (
          <div className="bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl p-6 mb-8 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h3 className="text-xl font-bold mb-2">
                  🎯 Personaliza o teu feed!
                </h3>
                <p className="text-green-100">
                  Ajusta as tuas categorias favoritas para receber conteúdo mais
                  relevante
                </p>
              </div>
              <button
                onClick={() => setIsUserInterestsOpen(true)}
                className="px-6 py-3 bg-white text-green-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Personalizar
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl p-6 mb-8 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h3 className="text-xl font-bold mb-2">
                  🚀 Cria a tua conta e personaliza o feed!
                </h3>
                <p className="text-primary-100">
                  Seleciona as tuas categorias favoritas e recebe conteúdo
                  personalizado baseado nos teus interesses
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => {
                    if (onAuthClick) {
                      onAuthClick()
                    } else {
                      toast.success('Redirecionando para criar conta...')
                    }
                  }}
                  className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Criar Conta
                </button>
                <button
                  onClick={() => {
                    if (onAuthClick) {
                      onAuthClick()
                    } else {
                      toast.success('Redirecionando para entrar...')
                    }
                  }}
                  className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors"
                >
                  Entrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filtros de Categoria */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Filtros
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                <ChevronDown
                  className={`h-4 w-4 ml-2 transition-transform ${
                    showFilters ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {selectedCategories.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </button>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => toggleCategory(category.name)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                          selectedCategories.includes(category.name)
                            ? 'bg-primary-500 text-white shadow-lg'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>

                  {selectedCategories.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Categorias selecionadas:{' '}
                        <span className="font-medium">
                          {selectedCategories.join(', ')}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grid de Memes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredMemes.map((meme, index) => (
              <motion.div
                key={meme.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
              >
                {/* Imagem */}
                <div className="aspect-square relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={meme.image_url}
                    alt={meme.title || 'Meme'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 cursor-pointer"
                    onClick={() => handleMemeClick(meme)}
                    loading="lazy"
                  />

                  {/* Overlay com ações */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(meme)
                        }}
                        className={`p-2 rounded-full transition-colors ${
                          favorites.includes(meme.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/20 text-white hover:bg-white/30'
                        }`}
                      >
                        <Heart
                          className={`h-5 w-5 ${
                            favorites.includes(meme.id) ? 'fill-current' : ''
                          }`}
                        />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDownload(meme)
                        }}
                        className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                      >
                        <Download className="h-5 w-5" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShare(meme)
                        }}
                        className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Informações */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {meme.title || 'Meme sem título'}
                  </h3>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span className="bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-lg text-xs">
                      {meme.category || 'Sem categoria'}
                    </span>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        <span>{(meme.like_count || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        <span>
                          {(meme.download_count || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Indicador de carregamento automático */}
        {loadingMore && (
          <div className="text-center mt-8">
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-lg">
              <Loader className="h-5 w-5 animate-spin mr-2" />
              Carregando mais memes...
            </div>
          </div>
        )}

        {/* Mensagem quando não há memes */}
        {filteredMemes.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-auto">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {selectedCategories.length > 0
                  ? 'Nenhum meme encontrado nas categorias selecionadas.'
                  : 'Nenhum meme disponível no momento.'}
              </p>
              {selectedCategories.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Ver Todos os Memes
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Visualização */}
      <MemeViewModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        meme={selectedMeme}
      />

      {/* Modal de Interesses do Usuário */}
      <UserInterests
        isOpen={isUserInterestsOpen}
        onClose={() => setIsUserInterestsOpen(false)}
        onInterestsUpdated={() => {
          // Recarregar memes com base nos novos interesses
          setPage(1)
          setFilteredMemes([])
        }}
        onAuthClick={onAuthClick}
      />
    </div>
  )
}
