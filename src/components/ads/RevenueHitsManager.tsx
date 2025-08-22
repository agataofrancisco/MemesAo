import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Settings,
  RefreshCw,
} from 'lucide-react'
import { HeaderAd, InlineAd, SidebarAd, FooterAd } from './RevenueHitsAd'

interface AdMetrics {
  id: string
  position: string
  impressions: number
  clicks: number
  ctr: number
  revenue: number
}

interface RevenueHitsManagerProps {
  showAnalytics?: boolean
  enableOptimization?: boolean
  maxAdsPerPage?: number
}

export default function RevenueHitsManager({
  showAnalytics = true,
  enableOptimization = true,
  maxAdsPerPage = 6,
}: RevenueHitsManagerProps) {
  const [adsLoaded, setAdsLoaded] = useState(0)
  const [totalImpressions, setTotalImpressions] = useState(0)
  const [totalClicks, setTotalClicks] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [adPerformance, setAdPerformance] = useState<AdMetrics[]>([])

  // IDs únicos para cada anúncio
  const adIds = [
    'rh_header_001',
    'rh_inline_001',
    'rh_inline_002',
    'rh_inline_003',
    'rh_sidebar_001',
    'rh_footer_001',
  ]

  // Posições dos anúncios
  const adPositions = [
    'header',
    'inline-1',
    'inline-2',
    'inline-3',
    'sidebar',
    'footer',
  ]

  // Registrar impressão
  const handleImpression = useCallback((adId: string, position: string) => {
    setTotalImpressions((prev) => prev + 1)
    setAdsLoaded((prev) => prev + 1)

    // Atualizar métricas do anúncio específico
    setAdPerformance((prev) => {
      const existing = prev.find((ad) => ad.id === adId)
      if (existing) {
        return prev.map((ad) =>
          ad.id === adId
            ? {
                ...ad,
                impressions: ad.impressions + 1,
                ctr: (ad.clicks / (ad.impressions + 1)) * 100,
              }
            : ad,
        )
      } else {
        return [
          ...prev,
          {
            id: adId,
            position,
            impressions: 1,
            clicks: 0,
            ctr: 0,
            revenue: 0,
          },
        ]
      }
    })
  }, [])

  // Registrar clique
  const handleClick = useCallback((adId: string, position: string) => {
    setTotalClicks((prev) => prev + 1)

    // Calcular revenue estimado (CPM médio $5-10)
    const estimatedCPM = 7.5 // Média entre $5 e $10
    const revenuePerClick = (estimatedCPM / 1000) * 100 // Assumindo CTR de 1%

    setTotalRevenue((prev) => prev + revenuePerClick)

    // Atualizar métricas do anúncio específico
    setAdPerformance((prev) => {
      return prev.map((ad) =>
        ad.id === adId
          ? {
              ...ad,
              clicks: ad.clicks + 1,
              ctr: ((ad.clicks + 1) / ad.impressions) * 100,
              revenue: ad.revenue + revenuePerClick,
            }
          : ad,
      )
    })
  }, [])

  // Otimizar posicionamento dos anúncios
  const optimizeAdPlacement = useCallback(async () => {
    if (!enableOptimization) return

    setIsOptimizing(true)

    try {
      // Simular otimização baseada em performance
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Reordenar anúncios por CTR
      setAdPerformance((prev) => [...prev].sort((a, b) => b.ctr - a.ctr))

      console.log('🎯 Otimização de anúncios concluída!')
    } catch (error) {
      console.error('Erro na otimização:', error)
    } finally {
      setIsOptimizing(false)
    }
  }, [enableOptimization])

  // Calcular CTR total
  const totalCTR =
    totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0

  // Calcular revenue estimado por 1000 impressões
  const estimatedCPM =
    totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0

  return (
    <div className="space-y-6">
      {/* Analytics Dashboard */}
      {showAnalytics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <BarChart3 className="w-6 h-6 text-blue-500" />
              <span>RevenueHits Analytics</span>
            </h3>

            <button
              onClick={optimizeAdPlacement}
              disabled={isOptimizing}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isOptimizing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Settings className="w-4 h-4" />
              )}
              <span>{isOptimizing ? 'Otimizando...' : 'Otimizar'}</span>
            </button>
          </div>

          {/* Métricas principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  Anúncios Carregados
                </span>
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                {adsLoaded}/{maxAdsPerPage}
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Total Impressões
                </span>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-2">
                {totalImpressions.toLocaleString()}
              </div>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Total Cliques
                </span>
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                {totalClicks.toLocaleString()}
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  CTR Total
                </span>
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-2">
                {totalCTR.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Revenue estimado */}
          <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold mb-1">Revenue Estimado (CPM)</h4>
                <p className="text-sm opacity-90">
                  Baseado em CPM médio de $7.50 por 1000 impressões
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  ${estimatedCPM.toFixed(2)}
                </div>
                <div className="text-sm opacity-90">por 1000 impressões</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Performance por anúncio */}
      {showAnalytics && adPerformance.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance por Anúncio
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Posição
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Impressões
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Cliques
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    CTR
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {adPerformance.map((ad) => (
                  <tr
                    key={ad.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">
                      {ad.position}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      {ad.impressions.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      {ad.clicks.toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      {ad.ctr.toFixed(2)}%
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                      ${ad.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Sistema de 6 Anúncios */}
      <div className="space-y-6">
        {/* 1. Header Ad */}
        <HeaderAd />

        {/* 2. Inline Ad 1 */}
        <InlineAd id="rh_inline_001" />

        {/* 3. Inline Ad 2 */}
        <InlineAd id="rh_inline_002" />

        {/* 4. Inline Ad 3 */}
        <InlineAd id="rh_inline_003" />

        {/* 5. Sidebar Ad */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {/* Conteúdo principal */}
            <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Conteúdo principal da página
              </p>
            </div>
          </div>
          <div className="lg:col-span-1">
            <SidebarAd />
          </div>
        </div>

        {/* 6. Footer Ad */}
        <FooterAd />
      </div>
    </div>
  )
}
