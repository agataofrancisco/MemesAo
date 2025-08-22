import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAds } from '../hooks/useAds'
import AdBanner from './AdBanner'

interface AdManagerProps {
  placementId: string
  className?: string
  showLoading?: boolean
}

export default function AdManager({
  placementId,
  className = '',
  showLoading = false,
}: AdManagerProps) {
  const {
    getAdsForPlacement,
    recordImpression,
    dismissAd,
    loading,
    error,
  } = useAds()

  const ads = getAdsForPlacement(placementId)

  // Registrar impressões quando os anúncios são renderizados
  useEffect(() => {
    ads.forEach((ad) => {
      recordImpression(ad.id)
    })
  }, [ads, recordImpression])

  if (loading && showLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Erro ao carregar anúncios:', error)
    return null
  }

  if (ads.length === 0) {
    return null
  }

  return (
    <div className={className}>
      <AnimatePresence>
        {ads.map((ad, index) => (
          <motion.div
            key={ad.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              type: 'spring',
              stiffness: 100,
            }}
            className="mb-4 last:mb-0"
          >
            <AdBanner
              type={ad.type}
              position={ad.position}
              showCloseButton={true}
              onClose={() => dismissAd(ad.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// Componente específico para banner superior
export function HeaderAd() {
  return (
    <AdManager
      placementId="header-banner"
      className="px-4 py-2"
      showLoading={true}
    />
  )
}

// Componente específico para anúncios laterais
export function SidebarAds() {
  return (
    <AdManager
      placementId="sidebar-ads"
      className="space-y-4"
      showLoading={true}
    />
  )
}

// Componente específico para anúncios inline
export function InlineAds() {
  return (
    <AdManager
      placementId="inline-content"
      className="my-6"
      showLoading={false}
    />
  )
}

// Componente específico para banner inferior
export function FooterAd() {
  return (
    <AdManager
      placementId="footer-banner"
      className="px-4 py-2"
      showLoading={false}
    />
  )
}
