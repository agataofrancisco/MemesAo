import React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Star, TrendingUp, Zap } from 'lucide-react'

interface AdBannerProps {
  type?: 'banner' | 'sidebar' | 'inline' | 'popup'
  position?: 'top' | 'bottom' | 'sidebar' | 'inline'
  className?: string
  showCloseButton?: boolean
  onClose?: () => void
}

export default function AdBanner({
  type = 'banner',
  position = 'top',
  className = '',
  showCloseButton = false,
  onClose,
}: AdBannerProps) {
  // Simular dados de anúncio (em produção, viriam de uma API de ads)
  const adData = {
    title: '🚀 Promoção Especial!',
    description: 'Aproveite 50% de desconto em todos os memes premium',
    cta: 'Ver Ofertas',
    url: '#',
    badge: 'LIMITADO',
    icon: TrendingUp,
  }

  const IconComponent = adData.icon

  const handleAdClick = () => {
    // Em produção, aqui você registraria o clique do anúncio
    console.log('Anúncio clicado:', adData.title)
    // window.open(adData.url, '_blank')
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  // Diferentes estilos baseados no tipo e posição
  const getAdStyles = () => {
    switch (type) {
      case 'banner':
        return 'w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg'
      case 'sidebar':
        return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-md'
      case 'inline':
        return 'bg-gradient-to-r from-green-500 to-teal-600 text-white p-3 rounded-lg shadow-md'
      case 'popup':
        return 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm'
      default:
        return 'bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg'
    }
  }

  const getContentStyles = () => {
    switch (type) {
      case 'banner':
        return 'flex items-center justify-between'
      case 'sidebar':
        return 'text-center space-y-3'
      case 'inline':
        return 'flex items-center justify-between'
      case 'popup':
        return 'bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md mx-4 shadow-2xl'
      default:
        return 'flex items-center justify-between'
    }
  }

  // Renderizar popup modal
  if (type === 'popup') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={getAdStyles()}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className={getContentStyles()}
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {adData.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {adData.description}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={handleAdClick}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                {adData.cta}
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Renderizar outros tipos de anúncios
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${getAdStyles()} ${className}`}
    >
      <div className={getContentStyles()}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <IconComponent className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-sm">{adData.title}</span>
              <span className="bg-yellow-400 text-yellow-900 text-xs px-2 py-1 rounded-full font-bold">
                {adData.badge}
              </span>
            </div>
            <p className="text-sm opacity-90">{adData.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleAdClick}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
          >
            <span>{adData.cta}</span>
            <ExternalLink className="w-4 h-4" />
          </button>

          {showCloseButton && (
            <button
              onClick={handleClose}
              className="text-white/70 hover:text-white p-1 rounded transition-colors"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
