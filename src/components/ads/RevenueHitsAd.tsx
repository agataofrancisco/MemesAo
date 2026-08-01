import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Eye, MousePointer, DollarSign } from 'lucide-react'

interface RevenueHitsAdProps {
  id: string
  position: 'header' | 'inline' | 'sidebar' | 'footer'
  size?: 'banner' | 'medium' | 'large'
  className?: string
  showAnalytics?: boolean
  onImpression?: () => void
  onClick?: () => void
}

export default function RevenueHitsAd({
  id,
  position,
  size = 'banner',
  className = '',
  showAnalytics = false,
  onImpression,
  onClick,
}: RevenueHitsAdProps) {
  const adRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [impressions, setImpressions] = useState(0)
  const [clicks, setClicks] = useState(0)

  // Configurações de tamanho baseadas na posição
  const getAdSize = () => {
    switch (size) {
      case 'banner':
        return position === 'header' || position === 'footer'
          ? 'w-full h-20'
          : 'w-full h-16'
      case 'medium':
        return 'w-full h-32'
      case 'large':
        return 'w-full h-40'
      default:
        return 'w-full h-20'
    }
  }

  // Configurações de estilo baseadas na posição
  const getAdStyles = () => {
    switch (position) {
      case 'header':
        return 'bg-gray-700 text-white border-b-2 border-gray-600'
      case 'footer':
        return 'bg-gray-700 text-white border-t-2 border-gray-600'
      case 'inline':
        return 'bg-gray-600 text-white border-2 border-gray-500'
      case 'sidebar':
        return 'bg-gray-600 text-white border-2 border-gray-500'
      default:
        return 'bg-gray-700 text-white border-2 border-gray-600'
    }
  }

  // Carregar anúncio RevenueHits
  useEffect(() => {
    if (!adRef.current) return

    const loadAd = () => {
      try {
        // Simular carregamento do anúncio RevenueHits
        // Em produção, aqui viria o código real do RevenueHits
        setTimeout(() => {
          setIsLoaded(true)
          setImpressions((prev) => prev + 1)
          onImpression?.()
        }, 1000 + Math.random() * 2000) // Simular tempo de carregamento variável
      } catch (error) {
        console.error('Erro ao carregar anúncio RevenueHits:', error)
        setHasError(true)
      }
    }

    loadAd()
  }, [id, onImpression])

  // Registrar clique
  const handleAdClick = () => {
    setClicks((prev) => prev + 1)
    onClick?.()

    // Em produção, aqui abriria o anúncio em nova aba
    console.log(`Anúncio ${id} clicado - Posição: ${position}`)
  }

  // Loading state
  if (!isLoaded && !hasError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${getAdSize()} ${className} bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center`}
      >
        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm">Carregando anúncio...</span>
        </div>
      </motion.div>
    )
  }

  // Error state
  if (hasError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`${getAdSize()} ${className} bg-red-100 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg flex items-center justify-center`}
      >
        <div className="text-center text-red-600 dark:text-red-400">
          <TrendingUp className="w-6 h-6 mx-auto mb-2" />
          <p className="text-sm">Anúncio temporariamente indisponível</p>
        </div>
      </motion.div>
    )
  }

  // Anúncio carregado
  return (
    <motion.div
      ref={adRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${getAdSize()} ${getAdStyles()} ${className} rounded-lg shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
      onClick={handleAdClick}
    >
      {/* Conteúdo do anúncio */}
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-xs opacity-75 mb-1">ANÚNCIO PATROCINADO</div>
            <div className="font-semibold text-sm">
              {position === 'header' && '🚀 Promoção Especial!'}
              {position === 'footer' && '⭐ Ofertas Exclusivas!'}
              {position === 'inline' && '🔥 Ofertas Imperdíveis!'}
              {position === 'sidebar' && '💎 Produtos Premium!'}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs opacity-75 mb-1">Clique para ver</div>
          <div className="text-lg font-bold">→</div>
        </div>
      </div>

      {/* Analytics (se habilitado) */}
      {showAnalytics && (
        <div className="absolute top-2 right-2 bg-black/20 rounded px-2 py-1 text-xs text-white">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{impressions}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MousePointer className="w-3 h-3" />
              <span>{clicks}</span>
            </div>
            <div className="flex items-center space-x-1">
              <DollarSign className="w-3 h-3" />
              <span>
                {impressions > 0
                  ? ((clicks / impressions) * 100).toFixed(1)
                  : '0'}
                %
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Componentes específicos para cada posição
interface AdCallbacks {
  onImpression?: () => void
  onClick?: () => void
}

export function HeaderAd({ onImpression, onClick }: AdCallbacks) {
  return (
    <RevenueHitsAd
      id="rh_header"
      position="header"
      size="banner"
      className="mb-4"
      showAnalytics={true}
      onImpression={onImpression}
      onClick={onClick}
    />
  )
}

export function InlineAd({
  id,
  className = '',
  onImpression,
  onClick,
}: {
  id: string
  className?: string
  onImpression?: () => void
  onClick?: () => void
}) {
  return (
    <RevenueHitsAd
      id={id}
      position="inline"
      size="medium"
      className={`my-6 ${className}`}
      showAnalytics={true}
      onImpression={onImpression}
      onClick={onClick}
    />
  )
}

export function SidebarAd({ onImpression, onClick }: AdCallbacks) {
  return (
    <RevenueHitsAd
      id="rh_sidebar"
      position="sidebar"
      size="large"
      className="mb-6"
      showAnalytics={true}
      onImpression={onImpression}
      onClick={onClick}
    />
  )
}

export function FooterAd({ onImpression, onClick }: AdCallbacks) {
  return (
    <RevenueHitsAd
      id="rh_footer"
      position="footer"
      size="banner"
      className="mt-8"
      showAnalytics={true}
      onImpression={onImpression}
      onClick={onClick}
    />
  )
}
