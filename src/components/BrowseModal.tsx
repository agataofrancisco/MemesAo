import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Filter, Tag, Calendar, TrendingUp, Download, Heart, Loader2 } from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useStats } from '../hooks/useStats'

interface BrowseModalProps {
  isOpen: boolean
  onClose: () => void
  initialCategory?: string
}

export default function BrowseModal({ isOpen, onClose, initialCategory }: BrowseModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || '')
  const [memes, setMemes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'trending'>('newest')
  const [showFilters, setShowFilters] = useState(false)

  const { getMemesByCategory, downloadMeme, toggleFavorite, favorites } = useMemes()
  const { categories } = useStats()

  useEffect(() => {
    if (isOpen && initialCategory) {
      setSelectedCategory(initialCategory)
      loadMemes(initialCategory)
    }
  }, [isOpen, initialCategory])

  useEffect(() => {
    if (isOpen && selectedCategory) {
      loadMemes(selectedCategory)
    }
  }, [selectedCategory, sortBy])

  const loadMemes = async (category: string) => {
    if (!category) return
    
    setLoading(true)
    try {
      const categoryMemes = await getMemesByCategory(category)
      setMemes(categoryMemes || [])
    } catch (error) {
      console.error('Error loading memes:', error)
      setMemes([])
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  const handleSortChange = (sort: 'newest' | 'popular' | 'trending') => {
    setSortBy(sort)
  }

  const handleMemeClick = (meme: any) => {
    console.log('Meme clicked:', meme)
    // TODO: Implement meme view modal
  }

  const handleDownload = async (meme: any) => {
    try {
      await downloadMeme(meme.id)
    } catch (error) {
      console.error('Error downloading meme:', error)
    }
  }

  const handleToggleFavorite = async (meme: any) => {
    try {
      await toggleFavorite(meme.id)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Explorar Memes
                </h2>
                {selectedCategory && (
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                    {selectedCategory}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex h-[calc(90vh-120px)]">
              {/* Sidebar */}
              <div className="w-64 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">Categorias</h3>
                  <div className="space-y-2">
                    {categories?.map((category: any) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryChange(category.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.name
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Ordenar por</h3>
                    <div className="space-y-2">
                      {[
                        { key: 'newest', label: 'Mais recentes', icon: Calendar },
                        { key: 'popular', label: 'Mais populares', icon: TrendingUp },
                        { key: 'trending', label: 'Em alta', icon: TrendingUp }
                      ].map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => handleSortChange(key as any)}
                          className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                            sortBy === key
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          <Icon size={16} />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="flex-1 p-6 overflow-y-auto">
                {!selectedCategory ? (
                  <div className="text-center py-12">
                    <Tag size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Selecione uma categoria
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Escolha uma categoria para começar a explorar memes
                    </p>
                  </div>
                ) : loading ? (
                  <div className="text-center py-12">
                    <Loader2 size={48} className="mx-auto text-gray-400 mb-4 animate-spin" />
                    <p className="text-gray-500 dark:text-gray-400">Carregando memes...</p>
                  </div>
                ) : memes.length === 0 ? (
                  <div className="text-center py-12">
                    <Tag size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhum meme encontrado
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Não há memes nesta categoria ainda
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memes.map((meme) => (
                      <div
                        key={meme.id}
                        className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handleMemeClick(meme)}
                      >
                        <img
                          src={meme.image_url}
                          alt={meme.title || 'Meme'}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {meme.title || 'Sem título'}
                          </h4>
                          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>{meme.category}</span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleToggleFavorite(meme)
                                }}
                                className="p-1 hover:text-red-500 transition-colors"
                              >
                                <Heart
                                  size={16}
                                  className={favorites?.includes(meme.id) ? 'fill-red-500 text-red-500' : ''}
                                />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDownload(meme)
                                }}
                                className="p-1 hover:text-blue-500 transition-colors"
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}