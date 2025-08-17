import React from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Sparkles,
  Zap,
  Brain,
  Grid,
  Download,
  Heart,
  Upload,
} from 'lucide-react'

interface HeroProps {
  onBrowseClick?: () => void
}

export default function Hero({ onBrowseClick }: HeroProps) {
  return (
    <section
      id="home"
      className="relative pt-20 pb-16 sm:pt-24 sm:pb-20 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute top-5 right-5 sm:top-10 sm:right-10 w-32 h-32 sm:w-64 sm:h-64 bg-gradient-to-r from-primary-500/20 to-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: 'linear' },
            scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute bottom-5 left-5 sm:bottom-10 sm:left-10 w-24 h-24 sm:w-48 sm:h-48 bg-gradient-to-r from-teal-500/20 to-accent-500/20 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-primary-500/10 to-purple-500/10 border border-primary-500/20 rounded-full text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 mb-6 sm:mb-8"
          >
            <Sparkles size={14} className="mr-1.5 sm:mr-2" />
            Powered by OCR & AI
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 leading-tight"
          >
            O Maior Acervo de{' '}
            <span className="bg-gradient-to-r from-primary-500 via-purple-500 to-teal-500 bg-clip-text text-transparent">
              Memes Angolanos
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-2"
          >
            Descubra, compartilhe e contribua para a maior coleção digital de
            memes angolanos. Sistema de OCR integrado para busca inteligente e
            categorização automática.
          </motion.p>

          {/* Browse Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-md mx-auto mb-8 sm:mb-12 px-2"
          >
            {onBrowseClick && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBrowseClick}
                className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <Grid size={18} />
                <span>Explorar por Categoria</span>
              </motion.button>
            )}
          </motion.div>

          {/* Como Usar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="max-w-4xl mx-auto px-4"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Como Usar? É Simples!
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {/* Passo 1 */}
              <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Explorar Memes
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Clique em "Explorar por Categoria" para ver todos os memes
                  organizados por temas
                </p>
                <div className="w-full h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Grid className="w-8 h-8 text-gray-400" />
                </div>
              </div>

              {/* Passo 2 */}
              <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Baixar & Curtir
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Clique no meme para abrir, depois use os botões para baixar ou
                  curtir
                </p>
                <div className="w-full h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center space-x-4">
                  <Download className="w-6 h-6 text-gray-400" />
                  <Heart className="w-6 h-6 text-gray-400" />
                </div>
              </div>

              {/* Passo 3 */}
              <div className="text-center p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Contribuir
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Tem memes? Clique no botão "+" no topo para enviar e ajudar a
                  comunidade
                </p>
                <div className="w-full h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Dica Extra */}
            <div className="mt-8 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-xl border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">💡</span>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  Dica:
                </h4>
              </div>
              <p className="text-center text-sm text-gray-700 dark:text-gray-300">
                Use o botão de busca 🔍 no topo da página para encontrar memes
                específicos ou o modo escuro 🌙 para melhor experiência noturna!
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
