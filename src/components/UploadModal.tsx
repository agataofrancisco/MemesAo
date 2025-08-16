import React, { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  Tag,
  Check,
  AlertCircle,
} from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useStats } from '../hooks/useStats'
import toast from 'react-hot-toast'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UploadedFile {
  file: File
  preview: string
  title: string
  description: string
  category: string
  uploading: boolean
  uploaded: boolean
  error?: string
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { uploadMeme, isBackendConfigured } = useMemes()
  const { categories } = useStats()

  const handleFiles = useCallback((fileList: FileList) => {
    const newFiles = Array.from(fileList)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, 5) // Máximo 5 arquivos
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        title: file.name.replace(/\.[^/.]+$/, ''), // Remove extensão
        description: '',
        category: 'Cotidiano',
        uploading: false,
        uploaded: false,
      }))

    setFiles((prev) => [...prev, ...newFiles].slice(0, 5))
  }, [])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles],
  )

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const updateFile = (index: number, updates: Partial<UploadedFile>) => {
    setFiles((prev) =>
      prev.map((file, i) => (i === index ? { ...file, ...updates } : file)),
    )
  }

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const updated = [...prev]
      URL.revokeObjectURL(updated[index].preview)
      updated.splice(index, 1)
      return updated
    })
  }

  const handleSubmit = async () => {
    if (!isBackendConfigured) {
      toast.error('Sistema não configurado para uploads')
      return
    }

    const pendingFiles = files.filter((f) => !f.uploaded && !f.uploading)
    if (pendingFiles.length === 0) {
      toast.error('Nenhum arquivo para enviar')
      return
    }

    // Verificar se todos os campos obrigatórios estão preenchidos
    const incompleteFiles = pendingFiles.filter(
      (f) => !f.title.trim() || !f.category.trim(),
    )
    if (incompleteFiles.length > 0) {
      toast.error('Preencha título e categoria para todos os memes')
      return
    }

    // Upload sequencial para evitar sobrecarga
    for (let i = 0; i < pendingFiles.length; i++) {
      const fileIndex = files.indexOf(pendingFiles[i])
      const file = pendingFiles[i]

      updateFile(fileIndex, { uploading: true, error: undefined })

      try {
        const result = await uploadMeme(
          file.file,
          file.title.trim(),
          file.description.trim(),
          file.category,
          [],
        )

        if (result.success) {
          updateFile(fileIndex, { uploading: false, uploaded: true })
        } else {
          updateFile(fileIndex, {
            uploading: false,
            error: result.message,
          })
        }
      } catch (error) {
        updateFile(fileIndex, {
          uploading: false,
          error: 'Erro inesperado no upload',
        })
      }
    }

    // Verificar se todos foram enviados com sucesso
    const allSuccessful = files.every((f) => f.uploaded || f.uploading)
    if (allSuccessful) {
      setTimeout(() => {
        toast.success('Todos os memes foram enviados para aprovação!')
        onClose()
        setFiles([])
      }, 1000)
    }
  }

  const handleClose = () => {
    // Limpar URLs de preview
    files.forEach((file) => URL.revokeObjectURL(file.preview))
    setFiles([])
    onClose()
  }

  if (!isOpen) return null

  const hasUploading = files.some((f) => f.uploading)
  const hasUploaded = files.some((f) => f.uploaded)
  const pendingCount = files.filter((f) => !f.uploaded && !f.uploading).length

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
                Enviar Memes
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {files.length === 0
                  ? 'Adicione até 5 imagens'
                  : hasUploading
                  ? 'Enviando para aprovação...'
                  : hasUploaded
                  ? 'Memes enviados com sucesso!'
                  : `${files.length} arquivo(s) selecionado(s)`}
              </p>
            </div>

            <button
              onClick={handleClose}
              disabled={hasUploading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {files.length === 0 ? (
              /* Upload Area */
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={handleFileSelect}
                className={`
                  border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
                  ${
                    dragActive
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }
                `}
              >
                <Upload
                  className={`h-16 w-16 mx-auto mb-4 ${
                    dragActive ? 'text-primary-500' : 'text-gray-400'
                  }`}
                />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {dragActive
                    ? 'Solte os arquivos aqui'
                    : 'Clique ou arraste imagens'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Suporte para PNG, JPG, GIF • Máximo 5 arquivos
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  ✨ <strong>Novo:</strong> Sistema de aprovação por moderadores
                  para garantir qualidade!
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleFiles(e.target.files)
                  }
                  className="hidden"
                />
              </div>
            ) : (
              /* Files List */
              <div className="space-y-6">
                {files.map((uploadedFile, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex gap-4">
                      {/* Preview */}
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <img
                          src={uploadedFile.preview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />

                        {/* Status Overlay */}
                        {uploadedFile.uploading && (
                          <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                          </div>
                        )}

                        {uploadedFile.uploaded && (
                          <div className="absolute inset-0 bg-green-500/80 rounded-lg flex items-center justify-center">
                            <Check className="h-6 w-6 text-white" />
                          </div>
                        )}

                        {uploadedFile.error && (
                          <div className="absolute inset-0 bg-red-500/80 rounded-lg flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Form */}
                      <div className="flex-1 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-3">
                            {/* Título */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <FileText size={14} className="inline mr-1" />
                                Título
                              </label>
                              <input
                                type="text"
                                value={uploadedFile.title}
                                onChange={(e) =>
                                  updateFile(index, { title: e.target.value })
                                }
                                disabled={
                                  uploadedFile.uploading ||
                                  uploadedFile.uploaded
                                }
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                                placeholder="Digite o título do meme..."
                              />
                            </div>

                            {/* Descrição */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Descrição (opcional)
                              </label>
                              <textarea
                                value={uploadedFile.description}
                                onChange={(e) =>
                                  updateFile(index, {
                                    description: e.target.value,
                                  })
                                }
                                disabled={
                                  uploadedFile.uploading ||
                                  uploadedFile.uploaded
                                }
                                rows={2}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                                placeholder="Adicione uma descrição..."
                              />
                            </div>

                            {/* Categoria */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <Tag size={14} className="inline mr-1" />
                                Categoria
                              </label>
                              <select
                                value={uploadedFile.category}
                                onChange={(e) =>
                                  updateFile(index, {
                                    category: e.target.value,
                                  })
                                }
                                disabled={
                                  uploadedFile.uploading ||
                                  uploadedFile.uploaded
                                }
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                              >
                                {categories.map((category) => (
                                  <option
                                    key={category.name}
                                    value={category.name}
                                  >
                                    {category.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Remove Button */}
                          {!uploadedFile.uploading && !uploadedFile.uploaded && (
                            <button
                              onClick={() => removeFile(index)}
                              className="ml-3 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>

                        {/* Error Message */}
                        {uploadedFile.error && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-600 dark:text-red-400">
                              <AlertCircle size={14} className="inline mr-1" />
                              {uploadedFile.error}
                            </p>
                          </div>
                        )}

                        {/* Success Message */}
                        {uploadedFile.uploaded && (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                            <p className="text-sm text-green-600 dark:text-green-400">
                              <Check size={14} className="inline mr-1" />
                              Enviado para aprovação com sucesso!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Add More Button */}
                {files.length < 5 && (
                  <button
                    onClick={handleFileSelect}
                    disabled={hasUploading}
                    className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ImageIcon className="h-6 w-6 mx-auto mb-2" />
                    Adicionar mais imagens ({5 - files.length} restante
                    {5 - files.length !== 1 ? 's' : ''})
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {files.length > 0 && (
            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {hasUploaded ? (
                    <span className="text-green-600 dark:text-green-400">
                      ✅ Memes enviados para aprovação
                    </span>
                  ) : hasUploading ? (
                    <span className="text-blue-600 dark:text-blue-400">
                      ⏳ Enviando memes...
                    </span>
                  ) : (
                    <span>
                      📝 {pendingCount} meme{pendingCount !== 1 ? 's' : ''}{' '}
                      pronto{pendingCount !== 1 ? 's' : ''} para envio
                    </span>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    disabled={hasUploading}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
                  >
                    {hasUploaded ? 'Fechar' : 'Cancelar'}
                  </button>

                  {!hasUploaded && pendingCount > 0 && (
                    <button
                      onClick={handleSubmit}
                      disabled={hasUploading || pendingCount === 0}
                      className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {hasUploading
                        ? 'Enviando...'
                        : `Enviar ${pendingCount} Meme${
                            pendingCount !== 1 ? 's' : ''
                          }`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
