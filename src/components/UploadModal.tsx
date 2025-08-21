import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Upload,
  Image as ImageIcon,
  Tag,
  FileText,
  Loader,
  Plus,
  Trash2,
  Check,
} from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useAllCategories } from '../hooks/useAllCategories'
import MultiCategorySelector from './MultiCategorySelector'
import toast from 'react-hot-toast'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

interface MemeFile {
  id: string
  file: File
  preview: string
  title: string
  description: string
  categories: string[] // Mudou de categoryId para categories array
  tags: string
  uploading: boolean
  completed: boolean
  error?: string
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [files, setFiles] = useState<MemeFile[]>([])
  const [globalCategory, setGlobalCategory] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const { uploadMeme } = useMemes()
  const { categories, loading: categoriesLoading } = useAllCategories()

  // Reset form quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setFiles([])
      setGlobalCategory('')
      setUploading(false)
      setUploadProgress(0)
    }
  }, [isOpen])

  // Selecionar primeira categoria automaticamente quando carregadas
  useEffect(() => {
    if (categories.length > 0 && !globalCategory) {
      setGlobalCategory(categories[0].id)
    }
  }, [categories, globalCategory])

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    if (selectedFiles.length === 0) return

    // Verificar se não excede o limite
    if (files.length + selectedFiles.length > 10) {
      toast.error('Máximo 10 memes por vez')
      return
    }

    const newFiles: MemeFile[] = []

    selectedFiles.forEach((file) => {
      // Verificar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida`)
        return
      }

      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} é muito grande. Máximo 5MB.`)
        return
      }

      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const memeFile: MemeFile = {
          id: Math.random().toString(36).substring(2),
          file,
          preview: e.target?.result as string,
          title: file.name.replace(/\.[^/.]+$/, ''), // Nome do arquivo sem extensão
          description: '',
          categories: globalCategory ? [globalCategory] : [], // Inicializa com categoria global se existir
          tags: '',
          uploading: false,
          completed: false,
        }
        newFiles.push(memeFile)

        if (
          newFiles.length ===
          selectedFiles.filter(
            (f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024,
          ).length
        ) {
          setFiles((prev) => [...prev, ...newFiles])
        }
      }
      reader.readAsDataURL(file)
    })

    // Limpar input
    e.target.value = ''
  }

  const updateMemeFile = (id: string, updates: Partial<MemeFile>) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, ...updates } : file)),
    )
  }

  const removeMemeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const applyGlobalCategory = () => {
    if (!globalCategory) {
      toast.error('Selecione uma categoria global primeiro')
      return
    }

    setFiles((prev) =>
      prev.map((file) => ({ ...file, categoryId: globalCategory })),
    )
    toast.success('Categoria aplicada a todos os memes')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      toast.error('Adicione pelo menos um meme')
      return
    }

    // Verificar se todos os memes têm título e pelo menos uma categoria
    const incompleteFiles = files.filter(
      (file) => !file.title.trim() || file.categories.length === 0,
    )
    if (incompleteFiles.length > 0) {
      toast.error(
        'Todos os memes precisam ter título e pelo menos uma categoria',
      )
      return
    }

    setUploading(true)
    setUploadProgress(0)

    let successCount = 0
    const totalFiles = files.length

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      try {
        updateMemeFile(file.id, { uploading: true, error: undefined })

        const tagsArray = file.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)

        const result = await uploadMeme(
          file.file,
          file.title.trim(),
          file.description.trim(),
          file.categories[0], // Usa a primeira categoria como principal (compatibilidade)
          tagsArray,
          file.categories, // Passa todas as categorias para o upload
        )

        if (result.success) {
          updateMemeFile(file.id, { uploading: false, completed: true })
          successCount++
        } else {
          updateMemeFile(file.id, { uploading: false, error: result.message })
        }
      } catch (error) {
        console.error('Erro no upload:', error)
        updateMemeFile(file.id, { uploading: false, error: 'Erro ao Publicar' })
      }

      setUploadProgress(((i + 1) / totalFiles) * 100)
    }

    setUploading(false)

    if (successCount === totalFiles) {
      toast.success(
        `Todos os ${successCount} memes foram enviados com sucesso!`,
      )
      setTimeout(() => onClose(), 2000)
    } else if (successCount > 0) {
      toast.success(
        `${successCount} de ${totalFiles} memes enviados com sucesso`,
      )
    } else {
      toast.error('Nenhum meme foi enviado')
    }
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
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] my-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Upload em Lote
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Envie até 10 memes de uma vez
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                💡 Não precisa de conta! Seus memes aparecerão como "Anônimo"
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={uploading}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Selecionar Imagens
                </label>
                <div className="relative border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-gray-600 dark:text-gray-400">
                      Clique para selecionar ou arraste múltiplas imagens
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF até 5MB cada • Máximo 10 arquivos
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      ✨ Upload gratuito e sem necessidade de conta!
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                </div>
              </div>

              {/* Global Categories */}
              {files.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categorias Globais (Aplicar a todos)
                      </label>
                      <MultiCategorySelector
                        selectedCategories={
                          globalCategory ? [globalCategory] : []
                        }
                        onCategoriesChange={(cats) =>
                          setGlobalCategory(cats[0] || '')
                        }
                        maxCategories={3}
                        className="mb-3"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={applyGlobalCategory}
                      className="ml-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                      disabled={!globalCategory || uploading}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              )}

              {/* Files List */}
              {files.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Memes ({files.length}/10)
                    </h3>
                    {uploading && (
                      <div className="text-sm text-gray-500">
                        Progresso: {Math.round(uploadProgress)}%
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className={`border rounded-xl p-4 ${
                          file.completed
                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                            : file.error
                            ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                            : 'border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          {/* Preview */}
                          <div className="flex-shrink-0">
                            <img
                              src={file.preview}
                              alt="Preview"
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            {file.completed && (
                              <div className="absolute -mt-2 -ml-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>

                          {/* Fields */}
                          <div className="flex-1 space-y-3">
                            <div>
                              <input
                                type="text"
                                value={file.title}
                                onChange={(e) =>
                                  updateMemeFile(file.id, {
                                    title: e.target.value,
                                  })
                                }
                                placeholder="Título do meme *"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                disabled={uploading || file.completed}
                                maxLength={100}
                              />
                            </div>

                            <div>
                              <select
                                value={file.categoryId}
                                onChange={(e) =>
                                  updateMemeFile(file.id, {
                                    categoryId: e.target.value,
                                  })
                                }
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                disabled={uploading || file.completed}
                              >
                                <option value="">Categoria *</option>
                                {categories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <textarea
                                value={file.description}
                                onChange={(e) =>
                                  updateMemeFile(file.id, {
                                    description: e.target.value,
                                  })
                                }
                                placeholder="Descrição (opcional)"
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                                disabled={uploading || file.completed}
                                maxLength={500}
                              />
                            </div>

                            {file.error && (
                              <div className="text-red-600 text-sm">
                                {file.error}
                              </div>
                            )}

                            {file.uploading && (
                              <div className="flex items-center text-primary-600 text-sm">
                                <Loader className="w-4 h-4 animate-spin mr-2" />
                                Enviando...
                              </div>
                            )}
                          </div>

                          {/* Remove Button */}
                          {!uploading && !file.completed && (
                            <button
                              type="button"
                              onClick={() => removeMemeFile(file.id)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              {files.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                    disabled={uploading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    disabled={
                      uploading ||
                      files.length === 0 ||
                      files.some((f) => !f.title.trim() || !f.categoryId)
                    }
                  >
                    {uploading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin mr-2" />
                        Enviando {Math.round(uploadProgress)}%
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 mr-2" />
                        Publicar {files.length} Meme
                        {files.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  <strong>Nota:</strong> Todos os memes serão revisados antes de
                  serem publicados. Evite conteúdo ofensivo ou que infrinja
                  direitos autorais.
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
