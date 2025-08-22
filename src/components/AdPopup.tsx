import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, Users, TrendingUp } from 'lucide-react'
import { useAds } from '../hooks/useAds'
import AdBanner from './AdBanner'

interface AdPopupProps {
  showOnPageLoad?: boolean
  showAfterDelay?: number // em segundos
  showOnScroll?: boolean
  showOnExit?: boolean
  className?: string
}

export default function AdPopup({
  showOnPageLoad = false,
  showAfterDelay = 0,
  showOnScroll = false,
  showOnExit = false,
  className = '',
}: AdPopupProps) {
  const { shouldShowPopup, dismissAd } = useAds()
  const [isVisible, setIsVisible] = useState(false)
  const [currentAd, setCurrentAd] = useState<any>(null)

  // Verificar se deve mostrar popup
  useEffect(() => {
    const checkPopup = () => {
      const popupAd = shouldShowPopup()
      if (popupAd) {
        setCurrentAd(popupAd)
        setIsVisible(true)
      }
    }

    // Mostrar imediatamente
    if (showOnPageLoad) {
      checkPopup()
    }

    // Mostrar após delay
    if (showAfterDelay > 0) {
      const timer = setTimeout(() => {
        checkPopup()
      }, showAfterDelay * 1000)
      return () => clearTimeout(timer)
    }
  }, [showOnPageLoad, showAfterDelay, shouldShowPopup])

  // Mostrar no scroll
  useEffect(() => {
    if (!showOnScroll) return

    const handleScroll = () => {
      const scrollPercent =
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
        100

      if (scrollPercent > 50 && !isVisible) {
        const popupAd = shouldShowPopup()
        if (popupAd) {
          setCurrentAd(popupAd)
          setIsVisible(true)
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [showOnScroll, isVisible, shouldShowPopup])

  // Mostrar ao sair da página
  useEffect(() => {
    if (!showOnExit) return

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isVisible) {
        const popupAd = shouldShowPopup()
        if (popupAd) {
          setCurrentAd(popupAd)
          setIsVisible(true)
        }
      }
    }

    document.addEventListener('mouseleave', handleMouseLeave)
    return () => document.removeEventListener('mouseleave', handleMouseLeave)
  }, [showOnExit, isVisible, shouldShowPopup])

  const handleClose = () => {
    setIsVisible(false)
    if (currentAd) {
      dismissAd(currentAd.id)
    }
  }

  const handleAdClick = () => {
    // Em produção, aqui você registraria o clique
    console.log('Anúncio popup clicado:', currentAd?.title)
    handleClose()
  }

  if (!isVisible || !currentAd) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={`bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-4 shadow-2xl ${className}`}
        >
          {/* Header com botão fechar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Anúncio Patrocinado
              </span>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conteúdo do anúncio */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚀</span>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {currentAd.title}
            </h3>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {currentAd.description}
            </p>

            {/* Badge e estatísticas */}
            {currentAd.badge && (
              <div className="inline-block bg-yellow-400 text-yellow-900 text-xs px-3 py-1 rounded-full font-bold mb-4">
                {currentAd.badge}
              </div>
            )}

            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Oferta limitada</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{currentAd.currentImpressions} visualizações</span>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex space-x-3">
            <button
              onClick={handleAdClick}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              {currentAd.cta}
            </button>

            <button
              onClick={handleClose}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Talvez depois
            </button>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Anúncio • Pode ser fechado
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Componente para popup de entrada
export function EntryPopup() {
  return <AdPopup showOnPageLoad={true} showAfterDelay={3} />
}

// Componente para popup de scroll
export function ScrollPopup() {
  return <AdPopup showOnScroll={true} />
}

// Componente para popup de saída
export function ExitPopup() {
  return <AdPopup showOnExit={true} />
}
