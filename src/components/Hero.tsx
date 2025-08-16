import React from 'react'
import { motion } from 'framer-motion'
import { Search, Sparkles, Zap, Brain, Grid } from 'lucide-react'

interface HeroProps {
  onSearchClick: () => void;
  onBrowseClick?: () => void;
}

export default function Hero({ onSearchClick, onBrowseClick }: HeroProps) {
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
            Descubra, compartilhe e contribua para a maior coleção digital de memes angolanos. 
            Sistema de OCR integrado para busca inteligente e categorização automática.
          </motion.p>

          {/* Search Bar and Browse Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-2xl mx-auto mb-8 sm:mb-12 px-2 space-y-4"
          >
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar memes... (ex: 'sexta-feira', 'política')"
                className="w-full px-4 sm:px-6 py-3 sm:py-4 pl-10 sm:pl-14 pr-20 sm:pr-32 text-sm sm:text-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                onClick={onSearchClick}
                readOnly
              />
              <Search className="absolute left-3 sm:left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSearchClick}
                className="absolute right-1 sm:right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-primary-500 to-purple-500 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium hover:shadow-lg transition-all duration-300"
              >
                Buscar
              </motion.button>
            </div>

            {/* Browse Button */}
            {onBrowseClick && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBrowseClick}
                className="w-full sm:w-auto bg-gradient-to-r from-teal-500 to-green-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium hover:shadow-lg transition-all duration-300 inline-flex items-center justify-center space-x-2"
              >
                <Grid size={18} />
                <span>Explorar por Categoria</span>
              </motion.button>
            )}
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-2"
          >
            <div className="flex items-center justify-center space-x-3 p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-primary-500 to-purple-500 rounded-lg">
                <Brain className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">OCR Inteligente</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Busca por texto nas imagens</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-teal-500 to-green-500 rounded-lg">
                <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Categorização Automática</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">IA organiza os memes</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-3 p-4 sm:p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 sm:col-span-1 col-span-1">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-accent-500 to-yellow-500 rounded-lg">
                <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Upload Fácil</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Contribua com a comunidade</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
