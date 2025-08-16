import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  X,
  Image,
  Check,
  AlertCircle,
  Loader2,
  Brain,
} from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useOCR } from '../hooks/useOCR'
import { useStats } from '../hooks/useStats'
import toast from 'react-hot-toast'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UploadedFile {
  id: string
  file: File
  preview: string
  ocrText: string
  suggestedCategory: string
  status: 'processing' | 'completed' | 'error' | 'duplicate'
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const {
    uploadMeme,
    isBackendConfigured,
    checkForDuplicates,
    uploading,
  } = useMemes()
  const { extractText, suggestCategory, isProcessing } = useOCR()
  const { categories } = useStats()

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }, [])

  const handleFiles = async (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'))

    for (const file of imageFiles) {
      const id = Math.random().toString(36).substr(2, 9)
      const preview = URL.createObjectURL(file)

      const uploadedFile: UploadedFile = {
        id,
        file,
        preview,
        ocrText: '',
        suggestedCategory: '',
        status: 'processing',
      }

      setUploadedFiles((prev) => [...prev, uploadedFile])

      try {
        // Verificar duplicatas primeiro
        const isDuplicate = await checkForDuplicates(file)
        if (isDuplicate) {
          setUploadedFiles((prev) =>
            prev.map((f) =>
              f.id === id
                ? {
                    ...f,
                    ocrText: 'Arquivo duplicado detectado',
                    suggestedCategory: 'Cotidiano',
                    status: 'duplicate',
                  }
                : f,
            ),
          )
          continue
        }

        // Extrair texto OCR
        const ocrText = await extractText(file)

        // Sugerir categoria baseada no OCR
        const suggestedCat = suggestCategory(ocrText)

        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  ...f,
                  ocrText: ocrText || 'Nenhum texto detectado',
                  suggestedCategory: suggestedCat,
                  status: 'completed',
                }
              : f,
          ),
        )
      } catch (error) {
        console.error('Erro no processamento:', error)
        setUploadedFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  ...f,
                  ocrText: 'Erro no processamento',
                  suggestedCategory: 'Cotidiano',
                  status: 'error',
                }
              : f,
          ),
        )
      }
    }
  }

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === id)
      if (file) {
        URL.revokeObjectURL(file.preview)
      }
      return prev.filter((f) => f.id !== id)
    })
  }

  const handleSubmit = async () => {
    if (!selectedCategory) {
      toast.error('Selecione uma categoria')
      return
    }

    if (uploadedFiles.length === 0) {
      toast.error('Adicione pelo menos uma imagem')
      return
    }

    const validFiles = uploadedFiles.filter((f) => f.status === 'completed')
    if (validFiles.length === 0) {
      toast.error('Nenhuma imagem válida para upload')
      return
    }

    let successCount = 0
    for (const uploadedFile of validFiles) {
      try {
        const result = await uploadMeme(uploadedFile.file, {
          title: title || `Meme ${new Date().toLocaleDateString()}`,
          description: description,
          tags: [],
          category: selectedCategory,
          ocrText: uploadedFile.ocrText,
        })

        if (result) {
          successCount++
          removeFile(uploadedFile.id)
        }
      } catch (error) {
        console.error('Erro no upload:', error)
      }
    }

    if (successCount > 0) {
      setTitle('')
      setDescription('')
      setSelectedCategory('')

      if (uploadedFiles.length === 0) {
        onClose()
      }
    }
  }

  const closeModal = () => {
    // Limpar URLs de objeto
    uploadedFiles.forEach((file) => URL.revokeObjectURL(file.preview))
    setUploadedFiles([])
    setTitle('')
    setDescription('')
    setSelectedCategory('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Contribuir com Memes
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Compartilhe seus memes favoritos com a comunidade angolana
              </p>
            </div>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {/* Upload Area */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center mb-6 transition-colors ${
                dragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-primary-400'
              } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Arraste e solte imagens aqui
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                ou clique para selecionar arquivos
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFiles(Array.from(e.target.files || []))}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className={`inline-flex items-center px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 cursor-pointer transition-colors ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Image className="mr-2 h-5 w-5" />
                Selecionar Imagens
              </label>
            </div>

            {/* Form */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Título (opcional)
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Quando é sexta-feira..."
                      className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categoria *
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o contexto ou adicione detalhes sobre o meme..."
                    rows={3}
                    className="w-full p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Preview das imagens */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Imagens ({uploadedFiles.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className="relative bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden"
                      >
                        <img
                          src={file.preview}
                          alt="Preview"
                          className="w-full h-32 object-cover"
                        />

                        <div className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.file.name}
                            </span>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          <div className="flex items-center space-x-2 mb-2">
                            {file.status === 'processing' && (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                <span className="text-xs text-blue-500">
                                  Processando...
                                </span>
                              </>
                            )}
                            {file.status === 'completed' && (
                              <>
                                <Check className="h-4 w-4 text-green-500" />
                                <span className="text-xs text-green-500">
                                  Pronto
                                </span>
                              </>
                            )}
                            {file.status === 'duplicate' && (
                              <>
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                <span className="text-xs text-orange-500">
                                  Duplicado
                                </span>
                              </>
                            )}
                            {file.status === 'error' && (
                              <>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-xs text-red-500">
                                  Erro
                                </span>
                              </>
                            )}
                          </div>

                          {file.ocrText && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              <strong>Texto detectado:</strong>{' '}
                              {file.ocrText.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {uploadedFiles.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {isBackendConfigured ? (
                    <>
                      <Brain className="inline h-4 w-4 mr-1" />
                      OCR ativo • Uploads serão moderados
                    </>
                  ) : (
                    'Configure o Supabase para uploads permanentes'
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={
                      uploading ||
                      !selectedCategory ||
                      uploadedFiles.filter((f) => f.status === 'completed')
                        .length === 0
                    }
                    className="px-6 py-2 bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="inline h-4 w-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      'Enviar Memes'
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
