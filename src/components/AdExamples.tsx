import React from 'react'
import { motion } from 'framer-motion'
import { AdBanner } from './AdBanner'
import { HeaderAd, FooterAd, InlineAds, SidebarAds } from './AdManager'
import { EntryPopup, ScrollPopup, ExitPopup } from './AdPopup'

export default function AdExamples() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          🚀 Exemplos de Integração de Anúncios
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400">
          Diferentes formas de integrar anúncios no MemesAo
        </p>
      </motion.div>

      {/* 1. Banner Superior */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          1. Banner Superior (Header)
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <HeaderAd />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Anúncio posicionado no topo da página, ideal para máxima visibilidade
        </p>
      </motion.div>

      {/* 2. Anúncios Inline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          2. Anúncios Inline (No Conteúdo)
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <InlineAds />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Anúncios integrados naturalmente no conteúdo da página
        </p>
      </motion.div>

      {/* 3. Anúncios Laterais */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          3. Anúncios Laterais (Sidebar)
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="bg-gray-100 dark:bg-gray-700 p-8 rounded-lg text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Conteúdo principal da página
              </p>
            </div>
          </div>
          <div className="lg:col-span-1">
            <SidebarAds />
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Anúncios posicionados na barra lateral, não interferem no conteúdo
          principal
        </p>
      </motion.div>

      {/* 4. Banner Inferior */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          4. Banner Inferior (Footer)
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <FooterAd />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Anúncio posicionado no rodapé, ideal para capturar usuários que
          chegaram ao final da página
        </p>
      </motion.div>

      {/* 5. Anúncios Customizados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          5. Anúncios Customizados
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Banner com Botão de Fechar
            </h3>
            <AdBanner
              type="banner"
              position="top"
              showCloseButton={true}
              onClose={() => console.log('Anúncio fechado')}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Anúncio Inline Verde
            </h3>
            <AdBanner
              type="inline"
              position="inline"
              className="bg-gradient-to-r from-green-500 to-teal-600"
            />
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Anúncios com configurações personalizadas de estilo e comportamento
        </p>
      </motion.div>

      {/* 6. Popups */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          6. Sistema de Popups
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Entry Popup
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Aparece após 3 segundos
              </p>
              <EntryPopup />
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Scroll Popup
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Aparece ao rolar 50%
              </p>
              <ScrollPopup />
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Exit Popup
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Aparece ao sair da página
              </p>
              <ExitPopup />
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Popups inteligentes que aparecem em momentos estratégicos para
          maximizar engajamento
        </p>
      </motion.div>

      {/* 7. Código de Integração */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          7. Código de Integração
        </h2>
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto">
          <pre className="text-sm">
            {`// 1. Importar componentes
import { HeaderAd, FooterAd, InlineAds, SidebarAds } from './components/AdManager'
import { EntryPopup, ScrollPopup, ExitPopup } from './components/AdPopup'

// 2. Adicionar no App.tsx
function App() {
  return (
    <div>
      <HeaderAd />
      <Header />
      
      <main>
        <Hero />
        <TopMemes />
        <InlineAds /> {/* Anúncio inline */}
        <Statistics />
        <FeaturedMemes />
        <Categories />
      </main>
      
      <FooterAd />
      <Footer />
      
      {/* Popups */}
      <EntryPopup />
      <ScrollPopup />
      <ExitPopup />
    </div>
  )
}

// 3. Adicionar em componentes específicos
function TopMemes() {
  return (
    <section>
      {/* Conteúdo dos memes */}
      <InlineAds /> {/* Anúncio após os memes */}
    </section>
  )
}`}
          </pre>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Exemplo prático de como integrar anúncios em diferentes partes da
          aplicação
        </p>
      </motion.div>

      {/* 8. Configurações Avançadas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          8. Configurações Avançadas
        </h2>
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Configurações do Hook useAds
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Políticas de Exibição
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Máximo de anúncios por página</li>
                <li>• Tempo mínimo entre popups</li>
                <li>• Respeitar preferências do usuário</li>
                <li>• Analytics habilitado</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Segmentação
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Por localização geográfica</li>
                <li>• Por dispositivo</li>
                <li>• Por comportamento</li>
                <li>• Por categoria de usuário</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="text-center"
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-2xl">
          <h3 className="text-2xl font-bold mb-4">
            🎯 Sistema de Anúncios Completo
          </h3>
          <p className="text-lg mb-6">
            O MemesAo agora possui um sistema robusto de anúncios para
            monetização
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">
              ✅ Responsivo
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              ✅ Administrável
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              ✅ Analytics
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">
              ✅ Popups Inteligentes
            </span>
            <span className="bg-white/20 px-3 py-1 rounded-full">✅ Temas</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
