import React, { useRef, useEffect } from 'react'

interface WatermarkProps {
  imageUrl: string
  onWatermarkedImage: (watermarkedUrl: string) => void
  className?: string
}

export default function Watermark({
  imageUrl,
  onWatermarkedImage,
  className = '',
}: WatermarkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const addWatermark = async () => {
      if (!canvasRef.current) return

      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Carregar a imagem
      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        // Configurar dimensões do canvas
        canvas.width = img.width
        canvas.height = img.height

        // Desenhar a imagem original
        ctx.drawImage(img, 0, 0)

        // Configurar estilo do texto
        ctx.font = `${Math.max(
          16,
          img.width * 0.03,
        )}px Inter, Arial, sans-serif`
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)' // Branco com 80% opacidade
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)' // Preto com 60% opacidade
        ctx.lineWidth = 2

        // Texto do watermark
        const watermarkText = 'Baixado em memes.ao'

        // Posicionar no canto inferior direito
        const textMetrics = ctx.measureText(watermarkText)
        const padding = 20
        const x = img.width - textMetrics.width - padding
        const y = img.height - padding

        // Desenhar outline (borda preta)
        ctx.strokeText(watermarkText, x, y)

        // Desenhar texto principal (branco)
        ctx.fillText(watermarkText, x, y)

        // Converter para URL de dados
        const watermarkedUrl = canvas.toDataURL('image/jpeg', 0.9)
        onWatermarkedImage(watermarkedUrl)
      }

      img.onerror = () => {
        console.error('Erro ao carregar imagem para watermark')
        // Em caso de erro, retornar a imagem original
        onWatermarkedImage(imageUrl)
      }

      img.src = imageUrl
    }

    addWatermark()
  }, [imageUrl, onWatermarkedImage])

  return (
    <canvas
      ref={canvasRef}
      className={`hidden ${className}`}
      style={{ display: 'none' }}
    />
  )
}
