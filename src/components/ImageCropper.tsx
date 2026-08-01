import { useCallback, useEffect, useRef, useState } from 'react'
import Cropper, { Area, Point } from 'react-easy-crop'
import { motion } from 'framer-motion'
import { X, Check, Loader } from 'lucide-react'

interface ImageCropperProps {
  src: string
  fileName: string
  fileType: string
  onCancel: () => void
  onConfirm: (croppedFile: File) => void
}

interface AspectOption {
  label: string
  value: number | 'original'
}

const ASPECT_OPTIONS: AspectOption[] = [
  { label: 'Original', value: 'original' },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
]

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Falha ao carregar imagem'))
    img.src = src
  })
}

async function cropToFile(
  src: string,
  crop: Area,
  fileType: string,
  fileName: string,
): Promise<File> {
  const image = await loadImage(src)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas não suportado')

  const MAX_DIM = 1920
  const scale = Math.min(1, MAX_DIM / Math.max(crop.width, crop.height))
  canvas.width = Math.round(crop.width * scale)
  canvas.height = Math.round(crop.height * scale)

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Falha ao gerar imagem'))),
      fileType || 'image/jpeg',
      0.92,
    )
  })

  const baseName = fileName.replace(/\.[^/.]+$/, '') || 'meme'
  return new File([blob], `${baseName}.${extFromType(fileType)}`, {
    type: fileType || 'image/jpeg',
  })
}

function extFromType(type: string): string {
  if (type.includes('png')) return 'png'
  if (type.includes('webp')) return 'webp'
  return 'jpg'
}

export default function ImageCropper({
  src,
  fileName,
  fileType,
  onCancel,
  onConfirm,
}: ImageCropperProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [aspect, setAspect] = useState<number | 'original'>('original')
  const [naturalAspect, setNaturalAspect] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    loadImage(src)
      .then((img) => {
        if (cancelled) return
        setNaturalAspect(img.naturalWidth / img.naturalHeight)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [src])

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedArea(areaPixels)
  }, [])

  const currentAspect =
    aspect === 'original' ? naturalAspect : (aspect as number)

  const handleConfirm = async () => {
    if (!croppedArea || processing) return
    setProcessing(true)
    try {
      const croppedFile = await cropToFile(src, croppedArea, fileType, fileName)
      if (!mountedRef.current) return
      onConfirm(croppedFile)
    } catch (err) {
      console.error('Erro ao cortar imagem:', err)
      if (mountedRef.current) {
        setProcessing(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl overflow-hidden flex flex-col"
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Cortar imagem
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-md">
              {fileName}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            aria-label="Fechar corte"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Área de corte */}
        <div className="relative h-[50vh] bg-gray-900">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={currentAspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid
          />
        </div>

        {/* Controles */}
        <div className="px-5 py-4 space-y-4">
          {/* Proporções */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-500 dark:text-gray-400 mr-1">
              Proporção:
            </span>
            {ASPECT_OPTIONS.map((opt) => {
              const selected =
                aspect === opt.value ||
                (opt.value === 'original' && aspect === 'original')
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    setAspect(opt.value)
                    setCrop({ x: 0, y: 0 })
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    selected
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Zoom */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Zoom:
            </span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 w-10 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={processing}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2"
            >
              {processing ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Usar imagem
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
