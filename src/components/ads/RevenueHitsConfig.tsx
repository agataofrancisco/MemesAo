import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Code,
  Copy,
  Check,
  AlertCircle,
  DollarSign,
} from 'lucide-react'

interface RevenueHitsConfigProps {
  isOpen: boolean
  onClose: () => void
}

export default function RevenueHitsConfig({
  isOpen,
  onClose,
}: RevenueHitsConfigProps) {
  const [publisherId, setPublisherId] = useState('')
  const [isConfigured, setIsConfigured] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [showInstructions, setShowInstructions] = useState(true)

  // Configurações padrão dos anúncios
  const defaultAdConfig = {
    header: { id: 'rh_header_001', size: 'banner', cpm: '$8-15' },
    inline1: { id: 'rh_inline_001', size: 'medium', cpm: '$5-10' },
    inline2: { id: 'rh_inline_002', size: 'medium', cpm: '$5-10' },
    inline3: { id: 'rh_inline_003', size: 'medium', cpm: '$5-10' },
    sidebar: { id: 'rh_sidebar_001', size: 'large', cpm: '$6-12' },
    footer: { id: 'rh_footer_001', size: 'banner', cpm: '$8-15' },
  }

  // Código de integração do RevenueHits
  const getIntegrationCode = () => {
    if (!publisherId) return ''

    return `<!-- RevenueHits Integration Code -->
<script async src="https://www.revenuehits.com/scripts/${publisherId}/rh.js"></script>

<!-- Ad Placement Scripts -->
<script>
window.revenueHitsConfig = {
  publisherId: '${publisherId}',
  ads: {
    header: '${defaultAdConfig.header.id}',
    inline1: '${defaultAdConfig.inline1.id}',
    inline2: '${defaultAdConfig.inline2.id}',
    inline3: '${defaultAdConfig.inline3.id}',
    sidebar: '${defaultAdConfig.sidebar.id}',
    footer: '${defaultAdConfig.footer.id}'
  },
  settings: {
    maxAdsPerPage: 6,
    enableAnalytics: true,
    enableOptimization: true,
    showAdLabels: true
  }
};
</script>`
  }

  // Copiar código para clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  // Verificar se está configurado
  useEffect(() => {
    const savedPublisherId = localStorage.getItem('revenueHitsPublisherId')
    if (savedPublisherId) {
      setPublisherId(savedPublisherId)
      setIsConfigured(true)
    }
  }, [])

  // Salvar configuração
  const saveConfig = () => {
    if (publisherId.trim()) {
      localStorage.setItem('revenueHitsPublisherId', publisherId.trim())
      setIsConfigured(true)
      setShowInstructions(false)
    }
  }

  // Resetar configuração
  const resetConfig = () => {
    localStorage.removeItem('revenueHitsPublisherId')
    setPublisherId('')
    setIsConfigured(false)
    setShowInstructions(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Settings className="w-6 h-6 text-blue-500" />
            <span>Configuração RevenueHits</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Instruções */}
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-blue-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    Como Configurar RevenueHits
                  </h3>
                  <ol className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
                    <li>
                      1. Acesse sua conta no{' '}
                      <a
                        href="https://www.revenuehits.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        RevenueHits.com
                      </a>
                    </li>
                    <li>2. Vá para "Publisher Dashboard" → "Integration"</li>
                    <li>3. Copie seu Publisher ID</li>
                    <li>4. Cole abaixo e clique em "Salvar Configuração"</li>
                    <li>5. Copie o código de integração gerado</li>
                    <li>6. Cole no &lt;head&gt; do seu HTML</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          )}

          {/* Configuração do Publisher ID */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Configuração Básica
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Publisher ID do RevenueHits
                </label>
                <input
                  type="text"
                  value={publisherId}
                  onChange={(e) => setPublisherId(e.target.value)}
                  placeholder="Ex: abc123def456"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Encontre este ID no seu dashboard do RevenueHits
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={saveConfig}
                  disabled={!publisherId.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Salvar Configuração
                </button>

                {isConfigured && (
                  <button
                    onClick={resetConfig}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  >
                    Resetar
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Configuração dos Anúncios */}
          {isConfigured && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Configuração dos 6 Anúncios
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(defaultAdConfig).map(([key, config]) => (
                  <div
                    key={key}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 dark:text-white capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                        {config.cpm}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      ID:{' '}
                      <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {config.id}
                      </code>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Tamanho: {config.size}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Código de Integração */}
          {isConfigured && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                  <Code className="w-5 h-5 text-green-500" />
                  <span>Código de Integração</span>
                </h3>

                <button
                  onClick={() =>
                    copyToClipboard(getIntegrationCode(), 'integration')
                  }
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center space-x-2"
                >
                  {copied === 'integration' ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  <span>
                    {copied === 'integration' ? 'Copiado!' : 'Copiar Código'}
                  </span>
                </button>
              </div>

              <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
                <pre className="text-sm whitespace-pre-wrap">
                  {getIntegrationCode()}
                </pre>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
                <strong>Instruções:</strong> Cole este código no &lt;head&gt; do
                seu HTML, antes do fechamento da tag &lt;/head&gt;
              </p>
            </motion.div>
          )}

          {/* Estatísticas de Revenue */}
          {isConfigured && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-primary-700 text-white rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Projeção de Revenue</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">$37-72</div>
                  <div className="text-sm opacity-90">
                    CPM por 1000 pageviews
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold">$1.110-2.160</div>
                  <div className="text-sm opacity-90">
                    Por mês (30k pageviews)
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold">6</div>
                  <div className="text-sm opacity-90">Anúncios por página</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white/20 rounded-lg">
                <p className="text-sm">
                  <strong>Nota:</strong> Estas são estimativas baseadas em CPM
                  médio de $5-10 por anúncio. O revenue real pode variar
                  dependendo do tráfego, geolocalização e qualidade do conteúdo.
                </p>
              </div>
            </motion.div>
          )}

          {/* Status da Configuração */}
          <div className="text-center">
            <div
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                isConfigured
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              }`}
            >
              {isConfigured ? (
                <Check className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="font-medium">
                {isConfigured
                  ? 'RevenueHits Configurado!'
                  : 'Aguardando Configuração'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
