import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Search,
  Filter,
  Tag,
  Calendar,
  TrendingUp,
  Download,
  Heart,
  Loader2,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useStats } from '../hooks/useStats'
import MemeViewModal from './MemeViewModal'
import type { Meme } from '../lib/supabase'

interface BrowseModalProps {
  isOpen: boolean
  onClose: () => void
  initialCategory?: string
}

export default function BrowseModal({
  isOpen,
  onClose,
  initialCategory,
}: BrowseModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || '',
  )
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>(
    'newest',
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMeme, setSelectedMeme] = useState<Meme | null>(null)
  const [isMemeModalOpen, setIsMemeModalOpen] = useState(false)

  const { memes, loading: memesLoading, error: memesError } = useMemes()
  const { categories, loading: categoriesLoading } = useStats()

  // Filtrar memes por categoria selecionada
  const filteredMemes = useMemo(() => {
    if (!memes || memes.length === 0) return []

    let filtered = memes

    // Filtrar por categoria se selecionada
    if (selectedCategory) {
      filtered = filtered.filter(
        (meme) =>
          (meme.category && meme.category.name === selectedCategory) ||
          (meme.category_id && meme.category_id === selectedCategory),
      )
    }

    // Ordenar por critério selecionado
    switch (sortBy) {
      case 'newest':
        filtered = filtered.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        break
      case 'popular':
        filtered = filtered.sort(
          (a, b) => (b.download_count || 0) - (a.download_count || 0),
        )
        break
      case 'trending':
        filtered = filtered.sort(
          (a, b) =>
            ((b as any).share_count || 0) - ((a as any).share_count || 0),
        )
        break
    }

    return filtered
  }, [memes, selectedCategory, sortBy])

  // Paginação
  const itemsPerPage = 12
  const totalPages = Math.ceil(filteredMemes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedMemes = filteredMemes.slice(
    startIndex,
    startIndex + itemsPerPage,
  )

  // Reset quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setSelectedCategory(initialCategory || '')
      setCurrentPage(1)
      setSortBy('newest')
    }
  }, [isOpen, initialCategory])

  // Atualizar categoria quando initialCategory muda
  useEffect(() => {
    setSelectedCategory(initialCategory || '')
    setCurrentPage(1)
  }, [initialCategory])

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category)
    setCurrentPage(1)
  }

  const handleMemeClick = (meme: Meme) => {
    setSelectedMeme(meme)
    setIsMemeModalOpen(true)
  }

  const handleCloseMemeModal = () => {
    setIsMemeModalOpen(false)
    setSelectedMeme(null)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  if (!isOpen) return null

  return (
    <>
      <AnimatePresence>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-7xl max-h-[90vh] my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Explorar Memes
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {selectedCategory
                    ? `Categoria: ${selectedCategory}`
                    : 'Todos os memes'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
              {/* Filtros e Controles */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                {/* Categorias */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCategorySelect('')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      !selectedCategory
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    Todas
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category.name)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        selectedCategory === category.name
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>

                {/* Controles de Visualização */}
                <div className="flex items-center gap-3">
                  {/* Ordenação */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="newest">Mais Recentes</option>
                    <option value="popular">Mais Populares</option>
                    <option value="trending">Em Alta</option>
                  </select>

                  {/* Modo de Visualização */}
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-white dark:bg-gray-600 text-primary-500'
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded transition-colors ${
                        viewMode === 'list'
                          ? 'bg-white dark:bg-gray-600 text-primary-500'
                          : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Loading */}
              {memesLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    Carregando memes...
                  </span>
                </div>
              )}

              {/* Erro */}
              {memesError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                  <p className="text-red-600 dark:text-red-300">{memesError}</p>
                </div>
              )}

              {/* Memes */}
              {!memesLoading && !memesError && (
                <>
                  {paginatedMemes.length === 0 ? (
                    <div className="text-center py-12">
                      <Tag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Nenhum meme encontrado
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        {selectedCategory
                          ? `Não há memes na categoria "${selectedCategory}"`
                          : 'Não há memes disponíveis no momento'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Grid de Memes */}
                      <div
                        className={`${
                          viewMode === 'grid'
                            ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
                            : 'space-y-4'
                        }`}
                      >
                        {paginatedMemes.map((meme) => (
                          <motion.div
                            key={meme.id}
                            whileHover={{ scale: 1.02 }}
                            className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer ${
                              viewMode === 'list' ? 'flex' : ''
                            }`}
                            onClick={() => handleMemeClick(meme)}
                          >
                            <div
                              className={`${
                                viewMode === 'list'
                                  ? 'w-24 h-24 flex-shrink-0'
                                  : 'aspect-square'
                              }`}
                            >
                              <img
                                src={meme.image_url}
                                alt={meme.title || 'Meme'}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-3 flex-1">
                              <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                                {meme.title || 'Meme sem título'}
                              </h3>
                              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <span>
                                  {meme.category?.name || 'Sem categoria'}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center">
                                    <Download className="h-3 w-3 mr-1" />
                                    {meme.download_count || 0}
                                  </span>
                                  <span className="flex items-center">
                                    <Heart className="h-3 w-3 mr-1" />
                                    {meme.like_count || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Paginação */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-8">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>

                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Página {currentPage} de {totalPages}
                          </span>

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      )}

                      {/* Contador de resultados */}
                      <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
                        Mostrando {startIndex + 1}-
                        {Math.min(
                          startIndex + itemsPerPage,
                          filteredMemes.length,
                        )}{' '}
                        de {filteredMemes.length} memes
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Modal de Visualização do Meme */}
      <MemeViewModal
        isOpen={isMemeModalOpen}
        meme={selectedMeme}
        onClose={handleCloseMemeModal}
      />
    </>
  )
}
