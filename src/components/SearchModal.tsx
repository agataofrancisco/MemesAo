import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  X,
  Filter,
  Tag,
  Calendar,
  TrendingUp,
  Download,
  Heart,
  Loader2,
  Zap,
} from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useStats } from '../hooks/useStats'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const searchSuggestions = [
  'Não entendo',
  'política angolana',
  'futebol',
  'segunda-feira',
  'trabalho',
  'chuva em luanda',
  'fim do mês',
  'kwanza',
  'petro',
  'golo',
  'salário',
  'amor',
]

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [searching, setSearching] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [searchCache, setSearchCache] = useState<Map<string, any[]>>(new Map())

  const { searchMemes, downloadMeme, toggleFavorite, favorites } = useMemes()
  const { categories } = useStats()

  // Refs para controlar debounce e cancelar requests
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSearchRef = useRef<string>('')
  const searchAbortControllerRef = useRef<AbortController | null>(null)

  // Carregar histórico de busca do localStorage
  useEffect(() => {
    const history = localStorage.getItem('memesao_search_history')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }, [])

  // Limpar cache e estados quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('')
      setResults([])
      setSearching(false)
      setSelectedCategory('')
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort()
      }
    }
  }, [isOpen])

  const performSearch = useCallback(
    async (query: string, category: string = '') => {
      // Evitar busca duplicada
      const searchKey = `${query}|${category}`
      if (lastSearchRef.current === searchKey) {
        return
      }
      lastSearchRef.current = searchKey

      // Cancelar busca anterior se existir
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort()
      }

      // Verificar cache primeiro
      const cacheKey = searchKey
      if (searchCache.has(cacheKey)) {
        setResults(searchCache.get(cacheKey) || [])
        setSearching(false)
        return
      }

      setSearching(true)
      searchAbortControllerRef.current = new AbortController()

      try {
        const searchResults = await searchMemes(query, category)

        // Verificar se a busca não foi cancelada
        if (!searchAbortControllerRef.current?.signal.aborted) {
          setResults(searchResults)

          // Adicionar ao cache (máximo 10 entradas)
          const newCache = new Map(searchCache)
          if (newCache.size >= 10) {
            const firstKey = newCache.keys().next().value
            newCache.delete(firstKey)
          }
          newCache.set(cacheKey, searchResults)
          setSearchCache(newCache)

          // Adicionar ao histórico de busca apenas se houver resultados
          if (searchResults.length > 0) {
            const newHistory = [
              query,
              ...searchHistory.filter((h) => h !== query),
            ].slice(0, 5)
            setSearchHistory(newHistory)
            localStorage.setItem(
              'memesao_search_history',
              JSON.stringify(newHistory),
            )
          }
        }
      } catch (error) {
        if (!searchAbortControllerRef.current?.signal.aborted) {
          console.error('Erro na busca:', error)
          setResults([])
        }
      } finally {
        if (!searchAbortControllerRef.current?.signal.aborted) {
          setSearching(false)
        }
      }
    },
    [searchMemes, searchHistory, searchCache],
  )

  // Debounce para busca
  useEffect(() => {
    // Limpar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchTerm.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(searchTerm.trim(), selectedCategory)
      }, 500) // Aumentado para 500ms para reduzir requests
    } else {
      setResults([])
      setSearching(false)
      lastSearchRef.current = ''
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, selectedCategory, performSearch])

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    // Reset cache quando categoria muda
    setSearchCache(new Map())
    lastSearchRef.current = ''
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion)
  }

  const clearSearch = () => {
    setSearchTerm('')
    setResults([])
    setSelectedCategory('')
    setSearchCache(new Map())
    lastSearchRef.current = ''
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: -50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -50 }}
            className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden mt-8 mb-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Buscar Memes
                  </h2>
                  <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400">
                    <Zap size={16} />
                    <span className="text-sm font-medium">Busca Otimizada</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Search Input */}
              <div className="relative mb-4">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Buscar por título, texto OCR ou conteúdo..."
                  value={searchTerm}
                  onChange={(e) => handleSearchTermChange(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-lg"
                  autoFocus
                />
                {searching && (
                  <Loader2
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-500 animate-spin"
                    size={20}
                  />
                )}
                {searchTerm && !searching && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
                  >
                    <Filter size={16} />
                    <span>Filtros</span>
                  </button>
                  {selectedCategory && (
                    <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-2 py-1 rounded-full text-xs">
                      {selectedCategory}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp size={16} />
                  <span>Busca por título e OCR</span>
                </div>
              </div>

              {/* Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Categoria
                        </label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => handleCategoryChange(e.target.value)}
                          className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                        >
                          <option value="">Todas as categorias</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.name}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Ordenar por
                        </label>
                        <select className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <option>Mais relevantes</option>
                          <option>Mais populares</option>
                          <option>Mais recentes</option>
                          <option>Mais baixados</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Tipo de busca
                        </label>
                        <select className="w-full p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                          <option>Título + OCR</option>
                          <option>Apenas título</option>
                          <option>Apenas OCR</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
              {searchTerm ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {searching ? (
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                          <span>Buscando no banco de dados...</span>
                        </div>
                      ) : (
                        `${results.length} resultado(s) para "${searchTerm}"`
                      )}
                    </h3>
                    {!searching && results.length > 0 && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Ordenado por relevância
                      </span>
                    )}
                  </div>

                  {searching ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden animate-pulse"
                        >
                          <div className="w-full h-32 bg-gray-300 dark:bg-gray-700" />
                          <div className="p-3">
                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded mb-2" />
                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.map((result) => (
                        <motion.div
                          key={result.id}
                          whileHover={{ scale: 1.02 }}
                          className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        >
                          <img
                            src={result.image_url}
                            alt={result.title}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-3">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-1">
                              {result.title}
                            </h4>
                            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                              <span className="flex items-center">
                                <Tag size={12} className="mr-1" />
                                {result.category}
                              </span>
                              <span>{result.likes} likes</span>
                            </div>
                            {result.ocr_text && (
                              <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                                OCR: "{result.ocr_text}"
                              </p>
                            )}
                            <div className="flex space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => toggleFavorite(result.id)}
                                className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-sm transition-colors ${
                                  favorites.includes(result.id)
                                    ? 'bg-red-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                }`}
                              >
                                <Heart
                                  size={14}
                                  className={`mr-1 ${
                                    favorites.includes(result.id)
                                      ? 'fill-current'
                                      : ''
                                  }`}
                                />
                                {favorites.includes(result.id)
                                  ? 'Curtido'
                                  : 'curtir'}
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => downloadMeme(result)}
                                className="flex-1 flex items-center justify-center py-2 px-3 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 transition-colors"
                              >
                                <Download size={14} className="mr-1" />
                                Baixar
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400 mb-2">
                        Nenhum meme encontrado para "{searchTerm}"
                        {selectedCategory &&
                          ` na categoria "${selectedCategory}"`}
                      </p>
                      <p className="text-sm text-gray-400">
                        Tente usar palavras-chave diferentes ou remover filtros
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Buscas Recentes
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map((term, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleSuggestionClick(term)}
                            className="px-3 py-2 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-lg text-sm hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                          >
                            {term}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Sugestões de Busca
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {searchSuggestions.map((suggestion, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors text-left"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
