import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Tag } from 'lucide-react'
import { useStats } from '../hooks/useStats'

interface MultiCategorySelectorProps {
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  maxCategories?: number
  className?: string
}

export default function MultiCategorySelector({
  selectedCategories,
  onCategoriesChange,
  maxCategories = 5,
  className = '',
}: MultiCategorySelectorProps) {
  const { categories, loading } = useStats()
  const [showSelector, setShowSelector] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const availableCategories = categories.filter(
    (cat) => !selectedCategories.includes(cat.name),
  )

  const filteredCategories = availableCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const addCategory = (categoryName: string) => {
    if (selectedCategories.length < maxCategories) {
      onCategoriesChange([...selectedCategories, categoryName])
      setSearchTerm('')
    }
  }

  const removeCategory = (categoryName: string) => {
    onCategoriesChange(selectedCategories.filter((cat) => cat !== categoryName))
  }

  const toggleSelector = () => {
    setShowSelector(!showSelector)
    if (!showSelector) {
      setSearchTerm('')
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Categorias Selecionadas */}
      <div className="flex flex-wrap gap-2">
        {selectedCategories.map((categoryName) => (
          <motion.div
            key={categoryName}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full text-sm font-medium"
          >
            <Tag className="h-3 w-3 mr-1.5" />
            {categoryName}
            <button
              onClick={() => removeCategory(categoryName)}
              className="ml-2 hover:bg-primary-200 dark:hover:bg-primary-800/30 rounded-full p-0.5 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Botão para Adicionar Categorias */}
      {selectedCategories.length < maxCategories && (
        <button
          onClick={toggleSelector}
          className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          Adicionar Categoria
        </button>
      )}

      {/* Seletor de Categorias */}
      <AnimatePresence>
        {showSelector && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3"
          >
            {/* Barra de Pesquisa */}
            <div className="relative">
              <input
                type="text"
                placeholder="Pesquisar categorias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Lista de Categorias */}
            <div className="max-h-48 overflow-y-auto space-y-1">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                    Carregando...
                  </p>
                </div>
              ) : filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => addCategory(category.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 text-gray-400 mr-2 group-hover:text-primary-500 transition-colors" />
                      <span className="text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                        {category.name}
                      </span>
                    </div>
                    <Plus className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                  {searchTerm
                    ? 'Nenhuma categoria encontrada'
                    : 'Todas as categorias já foram selecionadas'}
                </div>
              )}
            </div>

            {/* Informações */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {selectedCategories.length} de {maxCategories} categorias
              selecionadas
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
