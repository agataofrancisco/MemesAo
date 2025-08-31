import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface OptimizedImageProps {
  src: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: () => void
  placeholder?: string
  fallback?: string
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  onLoad,
  onError,
  placeholder = 'https://via.placeholder.com/400x400.png?text=Carregando...',
  fallback = 'https://via.placeholder.com/400x400.png?text=Erro+Carregamento',
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Intersection Observer para lazy loading
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !isLoaded && !hasError) {
              setImageSrc(src)
            }
          })
        },
        {
          rootMargin: '50px', // Carregar 50px antes de entrar na viewport
          threshold: 0.1,
        },
      )

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current)
      }
    } else {
      // Fallback para navegadores sem Intersection Observer
      setImageSrc(src)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [src, isLoaded, hasError])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setImageSrc(fallback)
    onError?.()
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder animado */}
      {!isLoaded && !hasError && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 animate-pulse"
        />
      )}

      {/* Imagem real */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />

      {/* Overlay de loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
