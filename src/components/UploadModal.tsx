import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Upload,
  Image as ImageIcon,
  Tag,
  FileText,
  Loader,
} from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useStats } from '../hooks/useStats'
import toast from 'react-hot-toast'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [tags, setTags] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const { uploadMeme } = useMemes()
  const { categories, loading: categoriesLoading } = useStats()

  // Reset form quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setTitle('')
      setDescription('')
      setSelectedCategoryId('')
      setTags('')
      setFile(null)
      setPreview(null)
      setUploading(false)
    }
  }, [isOpen])

  // Selecionar primeira categoria automaticamente quando carregadas
  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Verificar tipo de arquivo
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Por favor, selecione apenas arquivos de imagem')
        return
      }

      // Verificar tamanho (máximo 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('Arquivo muito grande. Máximo 5MB.')
        return
      }

      setFile(selectedFile)

      // Criar preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error('Por favor, selecione uma imagem')
      return
    }

    if (!title.trim()) {
      toast.error('Por favor, adicione um título')
      return
    }

    if (!selectedCategoryId) {
      toast.error('Por favor, selecione uma categoria')
      return
    }

    setUploading(true)

    try {
      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const result = await uploadMeme(
        file,
        title.trim(),
        description.trim(),
        selectedCategoryId, // Enviar o ID da categoria
        tagsArray,
      )

      if (result.success) {
        onClose()
        toast.success('Meme enviado com sucesso!')
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Erro no upload:', error)
      toast.error('Erro ao enviar meme')
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Enviar Meme
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              disabled={uploading}
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>

          {/* Content */}
          <form
            onSubmit={handleSubmit}
            className="p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Imagem *
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-4 sm:p-6 text-center hover:border-primary-500 transition-colors">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-48 sm:max-h-64 mx-auto rounded-lg object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null)
                        setPreview(null)
                      }}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors"
                    >
                      Remover imagem
                    </button>
                  </div>
                ) : (
                  <div>
                    <ImageIcon className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-gray-400 mb-3 sm:mb-4" />
                    <div className="space-y-2">
                      <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                        Clique para selecionar ou arraste uma imagem
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF até 5MB
                      </p>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploading}
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Dê um título divertido ao seu meme"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                disabled={uploading}
                maxLength={100}
              />
              <div className="text-xs text-gray-500 mt-1">
                {title.length}/100 caracteres
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descrição
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Adicione uma descrição (opcional)"
                rows={3}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base resize-none"
                disabled={uploading}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {description.length}/500 caracteres
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoria *
              </label>
              {categoriesLoading ? (
                <div className="flex items-center justify-center py-3">
                  <Loader className="h-5 w-5 animate-spin text-primary-500" />
                  <span className="ml-2 text-sm text-gray-500">
                    Carregando categorias...
                  </span>
                </div>
              ) : categories.length > 0 ? (
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                  disabled={uploading}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} ({category.count} memes)
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Nenhuma categoria disponível
                </div>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="engraçado, viral, trending (separadas por vírgula)"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base"
                disabled={uploading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Ajude outros a encontrar seu meme
              </p>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm sm:text-base"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-xl hover:from-primary-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                disabled={
                  uploading || !file || !title.trim() || !selectedCategoryId
                }
              >
                {uploading ? (
                  <>
                    <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin mr-2" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Enviar Meme
                  </>
                )}
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3 sm:p-4">
              <p className="text-blue-700 dark:text-blue-300 text-xs sm:text-sm">
                <strong>Nota:</strong> Seu meme será revisado antes de ser
                publicado. Evite conteúdo ofensivo ou que infrinja direitos
                autorais.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
