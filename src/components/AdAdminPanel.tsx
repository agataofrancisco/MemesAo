import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  MousePointer,
  TrendingUp,
  BarChart3,
  Save,
  X,
} from 'lucide-react'
import { useAds } from '../hooks/useAds'
import type { Ad } from '../hooks/useAds'

interface AdAdminPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdAdminPanel({ isOpen, onClose }: AdAdminPanelProps) {
  const { ads, refreshAds } = useAds()
  const [activeTab, setActiveTab] = useState<
    'overview' | 'create' | 'edit' | 'analytics'
  >('overview')
  const [editingAd, setEditingAd] = useState<Ad | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cta: '',
    url: '',
    badge: '',
    type: 'banner' as Ad['type'],
    position: 'top' as Ad['position'],
    priority: 'medium' as Ad['priority'],
    startDate: '',
    endDate: '',
    maxImpressions: 1000,
    maxClicks: 100,
    isActive: true,
  })

  if (!isOpen) return null

  const handleCreateAd = () => {
    setActiveTab('create')
    setEditingAd(null)
    setFormData({
      title: '',
      description: '',
      cta: '',
      url: '',
      badge: '',
      type: 'banner',
      position: 'top',
      priority: 'medium',
      startDate: '',
      endDate: '',
      maxImpressions: 1000,
      maxClicks: 100,
      isActive: true,
    })
  }

  const handleEditAd = (ad: Ad) => {
    setEditingAd(ad)
    setActiveTab('edit')
    setFormData({
      title: ad.title,
      description: ad.description,
      cta: ad.cta,
      url: ad.url,
      badge: ad.badge || '',
      type: ad.type,
      position: ad.position,
      priority: ad.priority,
      startDate: ad.startDate,
      endDate: ad.endDate,
      maxImpressions: ad.maxImpressions,
      maxClicks: ad.maxClicks,
      isActive: ad.isActive,
    })
  }

  const handleSaveAd = () => {
    // Em produção, aqui você salvaria no banco de dados
    console.log('Salvando anúncio:', formData)
    refreshAds()
    setActiveTab('overview')
  }

  const handleDeleteAd = (adId: string) => {
    if (confirm('Tem certeza que deseja excluir este anúncio?')) {
      // Em produção, aqui você excluiria do banco de dados
      console.log('Excluindo anúncio:', adId)
      refreshAds()
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Estatísticas gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total de Impressões
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {ads
              .reduce((sum, ad) => sum + ad.currentImpressions, 0)
              .toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <MousePointer className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total de Cliques
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {ads
              .reduce((sum, ad) => sum + ad.currentClicks, 0)
              .toLocaleString()}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Anúncios Ativos
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {ads.filter((ad) => ad.isActive).length}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              CTR Médio
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            {ads.length > 0
              ? (
                  (ads.reduce((sum, ad) => sum + ad.currentClicks, 0) /
                    ads.reduce((sum, ad) => sum + ad.currentImpressions, 1)) *
                  100
                ).toFixed(2)
              : '0.00'}
            %
          </div>
        </div>
      </div>

      {/* Lista de anúncios */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Anúncios Ativos
            </h3>
            <button
              onClick={handleCreateAd}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Anúncio</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Anúncio
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Impressões
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cliques
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {ads.map((ad) => (
                <tr
                  key={ad.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-4 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {ad.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {ad.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ad.type === 'banner'
                          ? 'bg-blue-100 text-blue-800'
                          : ad.type === 'sidebar'
                          ? 'bg-green-100 text-green-800'
                          : ad.type === 'inline'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {ad.type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        ad.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ad.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    {ad.currentImpressions.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                    {ad.currentClicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditAd(ad)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAd(ad.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderForm = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {editingAd ? 'Editar Anúncio' : 'Criar Novo Anúncio'}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Título do anúncio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Descrição do anúncio"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Call to Action
            </label>
            <input
              type="text"
              value={formData.cta}
              onChange={(e) =>
                setFormData({ ...formData, cta: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: Ver Ofertas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://exemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Badge (opcional)
            </label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) =>
                setFormData({ ...formData, badge: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Ex: LIMITADO"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value as Ad['type'] })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="banner">Banner</option>
              <option value="sidebar">Sidebar</option>
              <option value="inline">Inline</option>
              <option value="popup">Popup</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Posição
            </label>
            <select
              value={formData.position}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  position: e.target.value as Ad['position'],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
              <option value="sidebar">Sidebar</option>
              <option value="inline">Inline</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridade
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as Ad['priority'],
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="high">Alta</option>
              <option value="medium">Média</option>
              <option value="low">Baixa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data de Início
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data de Fim
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Máximo de Impressões
            </label>
            <input
              type="number"
              value={formData.maxImpressions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxImpressions: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              min="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Máximo de Cliques
            </label>
            <input
              type="number"
              value={formData.maxClicks}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxClicks: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              min="1"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Anúncio ativo
            </span>
          </label>
        </div>

        <div className="mt-6 flex space-x-3">
          <button
            onClick={handleSaveAd}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar</span>
          </button>

          <button
            onClick={() => setActiveTab('overview')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </button>
        </div>
      </div>
    </div>
  )

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Análise de Performance
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                {ad.title}
              </h4>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Impressões:
                  </span>
                  <span className="font-medium">
                    {ad.currentImpressions.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Cliques:
                  </span>
                  <span className="font-medium">
                    {ad.currentClicks.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">CTR:</span>
                  <span className="font-medium">
                    {ad.currentImpressions > 0
                      ? (
                          (ad.currentClicks / ad.currentImpressions) *
                          100
                        ).toFixed(2)
                      : '0.00'}
                    %
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Progresso:
                  </span>
                  <span className="font-medium">
                    {Math.min(
                      (ad.currentImpressions / ad.maxImpressions) * 100,
                      100,
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Painel de Anúncios
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Visão Geral', icon: BarChart3 },
              { id: 'create', label: 'Criar', icon: Plus },
              { id: 'analytics', label: 'Análises', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as 'overview' | 'create' | 'edit' | 'analytics',
                  )
                }
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {activeTab === 'overview' && renderOverview()}
          {(activeTab === 'create' || activeTab === 'edit') && renderForm()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </motion.div>
    </div>
  )
}
