import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Grid, List, Heart, Download } from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useStats } from '../hooks/useStats'
import { supabase } from '../lib/supabase'
import { Meme } from '../lib/supabase'
import toast from 'react-hot-toast'

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
    initialCategory || 'Todas',
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(false)
  const [browseMemes, setBrowseMemes] = useState<Meme[]>([])
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'downloads'>(
    'recent',
  )

  const { downloadMeme, toggleFavorite, favorites } = useMemes()
  const { categories } = useStats()

  // Todas as categorias + "Todas"
  const allCategories = [
    {
      id: 'all',
      name: 'Todas',
      count: 0,
      icon: 'Grid',
      color: 'from-gray-500 to-gray-600',
      description: 'Todos os memes',
    },
    ...categories,
  ]

  useEffect(() => {
    if (isOpen) {
      loadMemes()
    }
  }, [isOpen, selectedCategory, searchTerm, sortBy])

  const loadMemes = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('memes')
        .select(
          `
          *,
          categories (
            id,
            name,
            slug,
            icon,
            color
          ),
          profiles:uploaded_by(username, avatar_url)
        `,
        )
        .eq('status', 'approved')

      // Filtrar por categoria se não for "Todas"
      if (selectedCategory !== 'Todas') {
        // Buscar o ID da categoria pelo nome
        const { data: categoryData } = await supabase
          .from('categories')
          .select('id')
          .eq('name', selectedCategory)
          .single()

        if (categoryData) {
          query = query.eq('category_id', categoryData.id)
        }
      }

      // Aplicar busca por texto se houver termo
      if (searchTerm.trim()) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,ocr_text.ilike.%${searchTerm}%`,
        )
      }

      // Aplicar ordenação
      if (sortBy === 'popular') {
        query = query.order('download_count', { ascending: false })
      } else if (sortBy === 'downloads') {
        query = query.order('download_count', { ascending: false })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      // Limitar a 50 memes por vez
      query = query.limit(50)

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Transformar dados para incluir category como string
      const transformedMemes = (data || []).map((meme) => ({
        ...meme,
        category: meme.categories?.name || 'Sem categoria',
      }))

      setBrowseMemes(transformedMemes)
    } catch (error) {
      console.error('Erro ao carregar memes:', error)
      toast.error('Erro ao carregar memes')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (meme: Meme) => {
    await downloadMeme(meme)
  }

  const handleFavorite = async (memeId: string) => {
    await toggleFavorite(memeId)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] my-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Explorar Memes
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Navegue pela coleção de memes por categoria
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
            {/* Search and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Buscar memes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                >
                  <option value="recent">Mais Recentes</option>
                  <option value="popular">Mais Populares</option>
                  <option value="downloads">Mais Baixados</option>
                </select>

                {/* View Mode */}
                <div className="flex border border-gray-200 dark:border-gray-600 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${
                      viewMode === 'grid'
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-500'
                    }`}
                  >
                    <Grid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${
                      viewMode === 'list'
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-500'
                    }`}
                  >
                    <List size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {allCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {category.name}
                  {category.name !== 'Todas' && category.count > 0 && (
                    <span className="ml-2 opacity-75">({category.count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 max-h-[calc(90vh-200px)]">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  Carregando memes...
                </p>
              </div>
            ) : browseMemes.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  {searchTerm
                    ? 'Nenhum meme encontrado'
                    : 'Nenhum meme nesta categoria'}
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
                  {searchTerm
                    ? 'Tente outros termos de busca'
                    : 'Selecione outra categoria'}
                </p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                    : 'space-y-4'
                }
              >
                {browseMemes.map((meme, index) => (
                  <motion.div
                    key={meme.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300'
                        : 'bg-white dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all duration-300 flex'
                    }
                  >
                    {/* Image */}
                    <div
                      className={
                        viewMode === 'grid'
                          ? 'aspect-square'
                          : 'w-24 h-20 flex-shrink-0'
                      }
                    >
                      <img
                        src={meme.image_url}
                        alt={meme.title || 'Meme'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/300x300?text=Imagem+não+encontrada'
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className={viewMode === 'grid' ? 'p-4' : 'p-3 flex-1'}>
                      <h3
                        className={`font-semibold text-gray-900 dark:text-white mb-2 ${
                          viewMode === 'list' ? 'text-sm' : ''
                        }`}
                      >
                        {meme.title || 'Meme sem título'}
                      </h3>

                      {/* Stats */}
                      <div
                        className={`flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400 mb-3 ${
                          viewMode === 'list' ? 'mb-2' : ''
                        }`}
                      >
                        <span className="flex items-center">
                          <Download size={12} className="mr-1" />
                          {meme.download_count?.toLocaleString() || 0}
                        </span>
                        <span className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full">
                          {meme.category}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleFavorite(meme.id)}
                          className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
                            favorites.includes(meme.id)
                              ? 'bg-red-500 text-white'
                              : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                          }`}
                        >
                          <Heart
                            size={12}
                            className={
                              favorites.includes(meme.id) ? 'fill-current' : ''
                            }
                          />
                          {viewMode === 'grid' && (
                            <span className="text-xs">Curtir</span>
                          )}
                        </button>

                        <button
                          onClick={() => handleDownload(meme)}
                          className="flex items-center space-x-1 px-2 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                          <Download size={12} />
                          {viewMode === 'grid' && (
                            <span className="text-xs">Baixar</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {browseMemes.length > 0 && (
                  <>
                    Mostrando {browseMemes.length} meme
                    {browseMemes.length !== 1 ? 's' : ''}
                    {selectedCategory !== 'Todas' && ` em ${selectedCategory}`}
                  </>
                )}
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
