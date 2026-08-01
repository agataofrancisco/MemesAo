import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Target, CheckCircle, X, Save } from 'lucide-react'
import { useStats } from '../hooks/useStats'
import { useAuth } from '../hooks/useAuth'
import { apiGet, apiPut } from '../lib/api'
import type { UserInterest } from '../lib/types'
import toast from 'react-hot-toast'

interface UserInterestsProps {
  isOpen: boolean
  onClose: () => void
  onInterestsUpdated?: () => void
  onAuthClick?: () => void
}

export default function UserInterests({
  isOpen,
  onClose,
  onInterestsUpdated,
  onAuthClick,
}: UserInterestsProps) {
  const { user } = useAuth()
  const { categories, loading: categoriesLoading } = useStats()

  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [interestWeights, setInterestWeights] = useState<
    Record<string, number>
  >({})
  const [saving, setSaving] = useState(false)

  // Carregar interesses atuais do usuário
  useEffect(() => {
    if (isOpen && user) {
      loadUserInterests()
    }
  }, [isOpen, user])

  const loadUserInterests = async () => {
    try {
      const data = await apiGet<UserInterest[]>('/api/interests')

      if (data) {
        const interests: string[] = []
        const weights: Record<string, number> = {}
        for (const item of data) {
          const category = item.category
          if (category?.name) {
            interests.push(category.name)
            weights[category.name] = item.weight
          }
        }

        setSelectedInterests(interests)
        setInterestWeights(weights)
      }
    } catch (error) {
      console.error('Erro ao carregar interesses:', error)
    }
  }

  const toggleInterest = (categoryName: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(categoryName)) {
        const newInterests = prev.filter((cat) => cat !== categoryName)
        const newWeights = { ...interestWeights }
        delete newWeights[categoryName]
        setInterestWeights(newWeights)
        return newInterests
      } else {
        setInterestWeights((prev) => ({ ...prev, [categoryName]: 1 }))
        return [...prev, categoryName]
      }
    })
  }

  const updateWeight = (categoryName: string, weight: number) => {
    setInterestWeights((prev) => ({ ...prev, [categoryName]: weight }))
  }

  const saveInterests = async () => {
    if (!user) {
      console.log('Usuário não logado, não pode salvar interesses')
      toast.error('Precisas de estar logado para salvar interesses')
      return
    }

    console.log('Salvando interesses para usuário:', user.id)
    console.log('Interesses selecionados:', selectedInterests)
    console.log('Pesos dos interesses:', interestWeights)

    setSaving(true)
    try {
      const interestsToInsert = selectedInterests
        .map((categoryName) => {
          const category = categories.find((cat) => cat.name === categoryName)
          console.log(
            `Mapeando categoria: ${categoryName} -> ID: ${category?.id}`,
          )
          return {
            category_id: category?.id || '',
            weight: interestWeights[categoryName] || 1,
          }
        })
        .filter((item) => !!item.category_id)

      console.log('Interesses para inserir:', interestsToInsert)

      await apiPut('/api/interests', { categories: interestsToInsert })

      toast.success('Interesses salvos com sucesso!')
      onInterestsUpdated?.()
      onClose()
    } catch (error) {
      console.error('Erro ao salvar interesses:', error)
      toast.error('Erro ao salvar interesses')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  // Se não há usuário logado, mostrar mensagem de login
  if (!user) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 text-center"
          >
            <div className="mb-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Precisa de uma conta
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Para personalizar o teu feed, precisas de criar uma conta ou
                entrar
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <button
                onClick={() => {
                  onClose()
                  if (onAuthClick) {
                    onAuthClick()
                  } else {
                    toast.success('Redirecionando para criar conta...')
                  }
                }}
                className="w-full px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
              >
                Criar Conta
              </button>
              <button
                onClick={() => {
                  onClose()
                  if (onAuthClick) {
                    onAuthClick()
                  } else {
                    toast.success('Redirecionando para entrar...')
                  }
                }}
                className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Entrar
              </button>
              <button
                onClick={onClose}
                className="w-full px-6 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Personalizar Feed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Seleciona as categorias que mais te interessam
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categorias Disponíveis */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Categorias Disponíveis
                </h3>
                <div className="space-y-2">
                  {categoriesLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                    </div>
                  ) : (
                    categories.map((category) => (
                      <motion.button
                        key={category.id}
                        onClick={() => toggleInterest(category.name)}
                        className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                          selectedInterests.includes(category.name)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{category.name}</span>
                          {selectedInterests.includes(category.name) && (
                            <CheckCircle className="h-5 w-5 text-primary-500" />
                          )}
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              {/* Interesses Selecionados */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Interesses Selecionados
                </h3>
                {selectedInterests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Seleciona categorias para personalizar o teu feed</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedInterests.map((categoryName) => (
                      <motion.div
                        key={categoryName}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {categoryName}
                          </span>
                          <button
                            onClick={() => toggleInterest(categoryName)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Slider de Peso */}
                        <div className="space-y-2">
                          <label className="text-sm text-gray-600 dark:text-gray-400">
                            Importância: {interestWeights[categoryName] || 1}
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={interestWeights[categoryName] || 1}
                            onChange={(e) =>
                              updateWeight(
                                categoryName,
                                parseInt(e.target.value),
                              )
                            }
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Baixa</span>
                            <span>Alta</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dicas */}
            <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <h4 className="font-semibold text-primary-900 dark:text-primary-100 mb-2">
                💡 Como funciona?
              </h4>
              <ul className="text-sm text-primary-800 dark:text-primary-200 space-y-1">
                <li>
                  • <strong>Seleciona</strong> as categorias que mais te
                  interessam
                </li>
                <li>
                  • <strong>Ajusta a importância</strong> de cada categoria
                  (1-5)
                </li>
                <li>
                  • <strong>Recebe conteúdo personalizado</strong> baseado nos
                  teus interesses
                </li>
                <li>
                  • <strong>Feed inteligente</strong> que aprende com as tuas
                  preferências
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {selectedInterests.length} categorias selecionadas
            </p>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveInterests}
                disabled={saving || selectedInterests.length === 0}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Interesses
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
