import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Upload,
  Image as ImageIcon,
  Loader,
  Trash2,
  Check,
  Tag,
  Crop,
} from 'lucide-react'
import { useMemes } from '../hooks/useMemes'
import { useAllCategories } from '../hooks/useAllCategories'
import { useOCR } from '../hooks/useOCR'
import MultiCategorySelector from './MultiCategorySelector'
import ImageCropper from './ImageCropper'
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
  categories: string[]
  ocrText: string
  ocrStatus: 'idle' | 'processing' | 'done'
  uploading: boolean
  completed: boolean
  error?: string
}

interface CropTarget {
  id: string
  file: File
  src: string
}

export default function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [files, setFiles] = useState<MemeFile[]>([])
  const [globalCategories, setGlobalCategories] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [cropQueue, setCropQueue] = useState<CropTarget[]>([])
  const [cropTarget, setCropTarget] = useState<CropTarget | null>(null)

  const { uploadMeme } = useMemes()
  const { categories } = useAllCategories()
  const { extractText } = useOCR()

  const runOcr = async (memeFileId: string, imageFile: File) => {
    const text = await extractText(imageFile)
    setFiles((prev) =>
      prev.map((f) =>
        f.id === memeFileId ? { ...f, ocrText: text, ocrStatus: 'done' } : f,
      ),
    )
  }

  // Reset form quando modal fecha
  useEffect(() => {
    if (!isOpen) {
      setFiles([])
      setGlobalCategories([])
      setUploading(false)
      setUploadProgress(0)
      setCropQueue([])
      setCropTarget(null)
    }
  }, [isOpen])

  // Processar fila de corte: abre o cropper para cada imagem selecionada
  useEffect(() => {
    if (cropTarget) return
    if (cropQueue.length === 0) return
    const next = cropQueue[0]
    setCropQueue((q) => q.slice(1))
    setCropTarget(next)
  }, [cropQueue, cropTarget])

  // Categorias globais aplicam-se a todos os memes, ao vivo
  useEffect(() => {
    setFiles((prev) =>
      prev.map((file) => ({ ...file, categories: [...globalCategories] })),
    )
  }, [globalCategories])

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])

    if (selectedFiles.length === 0) return

    // Verificar se não excede o limite
    if (files.length + selectedFiles.length > 10) {
      toast.error('Máximo 10 memes por vez')
      e.target.value = ''
      return
    }

    const validFiles = selectedFiles.filter((file) => {
      // Verificar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida`)
        return false
      }

      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} é muito grande. Máximo 5MB.`)
        return false
      }

      return true
    })

    if (validFiles.length === 0) {
      e.target.value = ''
      return
    }

    validFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setCropQueue((q) => [
          ...q,
          {
            id: Math.random().toString(36).substring(2),
            file,
            src: ev.target?.result as string,
          },
        ])
      }
      reader.readAsDataURL(file)
    })

    // Limpar input
    e.target.value = ''
  }

  const addMeme = (target: CropTarget, imageFile: File, preview: string) => {
    const memeFile: MemeFile = {
      id: target.id,
      file: imageFile,
      preview,
      title: target.file.name.replace(/\.[^/.]+$/, ''),
      categories: [...globalCategories],
      ocrText: '',
      ocrStatus: 'processing',
      uploading: false,
      completed: false,
    }
    setFiles((prev) => [...prev, memeFile])
    setCropTarget(null)
    runOcr(memeFile.id, imageFile)
  }

  const handleCropConfirm = (croppedFile: File) => {
    const target = cropTarget
    if (!target) return

    const isRecrop = files.some((f) => f.id === target.id)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const preview = ev.target?.result as string
      if (isRecrop) {
        updateMemeFile(target.id, {
          file: croppedFile,
          preview,
          ocrText: '',
          ocrStatus: 'processing',
        })
        setCropTarget(null)
        runOcr(target.id, croppedFile)
      } else {
        addMeme(target, croppedFile, preview)
      }
    }
    reader.readAsDataURL(croppedFile)
  }

  const handleCropUseOriginal = () => {
    const target = cropTarget
    if (!target) return

    const isRecrop = files.some((f) => f.id === target.id)
    if (isRecrop) {
      setCropTarget(null)
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      addMeme(target, target.file, ev.target?.result as string)
    }
    reader.readAsDataURL(target.file)
  }

  const updateMemeFile = (id: string, updates: Partial<MemeFile>) => {
    setFiles((prev) =>
      prev.map((file) => (file.id === id ? { ...file, ...updates } : file)),
    )
  }

  const removeMemeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      toast.error('Adicione pelo menos um meme')
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

        const result = await uploadMeme(
          file.file,
          file.title.trim() || file.file.name.replace(/\.[^/.]+$/, ''),
          '',
          file.categories[0] || '',
          [],
          file.categories,
          file.ocrText || '',
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
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] my-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  Publicar Memes
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Envie até 10 memes de uma vez
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {files.map((file) => (
                        <div
                          key={file.id}
                          className={`border rounded-xl p-4 ${
                            file.completed
                              ? 'border-success-200 bg-success-50 dark:border-success-800 dark:bg-success-900/20'
                              : file.error
                              ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                              : 'border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-start space-x-4">
                            {/* Preview */}
                            <div className="flex-shrink-0 relative">
                              <img
                                src={file.preview}
                                alt="Preview"
                                className="w-24 h-24 object-cover rounded-lg"
                              />
                              {file.completed && (
                                <div className="absolute -mt-2 -ml-2 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              )}
                              {/* Cortar (opcional) */}
                              {!file.uploading && !file.completed && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setCropTarget({
                                      id: file.id,
                                      file: file.file,
                                      src: file.preview,
                                    })
                                  }
                                  title="Cortar imagem"
                                  className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 py-1 bg-black/60 text-white text-xs rounded-b-lg opacity-0 hover:opacity-100 transition-opacity"
                                >
                                  <Crop className="h-3 w-3" />
                                  Cortar
                                </button>
                              )}
                            </div>

                            {/* Fields */}
                            <div className="flex-1 space-y-2">
                              <div>
                                <input
                                  type="text"
                                  value={file.title}
                                  onChange={(e) =>
                                    updateMemeFile(file.id, {
                                      title: e.target.value,
                                    })
                                  }
                                  placeholder="Título do meme"
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                  disabled={uploading || file.completed}
                                  maxLength={100}
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

                              {file.ocrStatus === 'processing' && (
                                <div className="flex items-center text-gray-400 dark:text-gray-500 text-xs">
                                  <Loader className="w-3 h-3 animate-spin mr-1.5" />
                                  A ler texto da imagem...
                                </div>
                              )}
                              {file.ocrStatus === 'done' && file.ocrText && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
                                  OCR: "{file.ocrText}"
                                </p>
                              )}

                              {file.categories.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {file.categories.map((catId) => (
                                    <span
                                      key={catId}
                                      className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium"
                                    >
                                      <Tag className="h-3 w-3 mr-1" />
                                      {categories.find((c) => c.id === catId)
                                        ?.name || catId}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Remove Button */}
                            {!uploading && !file.completed && (
                              <button
                                type="button"
                                onClick={() => removeMemeFile(file.id)}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Remover"
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

                {/* Categorias (aplicam-se a todos os memes) */}
                {files.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Categorias (aplicadas a todos os memes)
                    </label>
                    <MultiCategorySelector
                      selectedCategories={globalCategories}
                      onCategoriesChange={setGlobalCategories}
                      maxCategories={3}
                    />
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
                      className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      disabled={uploading || files.length === 0}
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
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4">
                  <p className="text-primary-700 dark:text-primary-300 text-sm">
                    <strong>Nota:</strong> Todos os memes serão revisados antes
                    de serem publicados. Evite conteúdo ofensivo ou que infrinja
                    direitos autorais.
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Corte de imagem */}
      {cropTarget && (
        <ImageCropper
          src={cropTarget.src}
          fileName={cropTarget.file.name}
          fileType={cropTarget.file.type}
          onUseOriginal={handleCropUseOriginal}
          onConfirm={handleCropConfirm}
        />
      )}
    </>
  )
}
