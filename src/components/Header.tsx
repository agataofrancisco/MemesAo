import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Upload,
  Moon,
  Sun,
  Settings,
  Smile,
  User,
  LogOut,
  Home,
  TrendingUp,
  Heart,
  Filter,
  Bell,
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import AuthModal from './AuthModal'
import { AnimatePresence } from 'framer-motion'

interface HeaderProps {
  onSearchClick: () => void
  onUploadClick: () => void
  onAdminClick: () => void
  onProfileClick?: () => void
  onFeedClick?: () => void
  currentPage: 'feed' | 'profile'
}

export default function Header({
  onSearchClick,
  onUploadClick,
  onAdminClick,
  onProfileClick,
  onFeedClick,
  currentPage,
}: HeaderProps) {
  const { isDark, toggleTheme } = useTheme()
  const { user, profile, signOut, isConfigured } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeFilter, setActiveFilter] = useState<
    'trending' | 'interests' | 'recent'
  >('trending')

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<
    'trending' | 'recent' | 'interests'
  >('recent')
  const [isDark, setIsDark] = useState(false)

  console.log('🔍 Header: Estados locais:', {
    isUserMenuOpen,
    activeFilter,
    isDark,
  })

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800"
      >
        {/* Header principal */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="relative">
                <Smile className="h-8 w-8 text-primary-500" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-1 -right-1 h-3 w-3 bg-accent-500 rounded-full"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
                MemesAo
              </span>
            </motion.div>

            {/* Filtros centrais */}
            <div className="hidden md:flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
              <button
                onClick={() => setActiveFilter('trending')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === 'trending'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Em Alta</span>
              </button>
              <button
                onClick={() => setActiveFilter('interests')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === 'interests'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Heart className="h-4 w-4" />
                <span>Interesses</span>
              </button>
              <button
                onClick={() => setActiveFilter('recent')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeFilter === 'recent'
                    ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Recentes</span>
              </button>
            </div>

            {/* Ações do usuário */}
            <div className="flex items-center space-x-3">
              {/* Botão de busca */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSearchClick}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
              >
                <Search className="h-5 w-5" />
              </motion.button>

              {/* Botão de upload */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onUploadClick}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
              >
                <Upload className="h-5 w-5" />
              </motion.button>

              {/* Botão de notificações */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
              >
                <Bell className="h-5 w-5" />
              </motion.button>

              {/* Botão de tema */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
              >
                {isDark ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </motion.button>

              {/* Botão de configurações */}
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAdminClick}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                >
                  <Settings className="h-5 w-5" />
                </motion.button>
              )}

              {/* Avatar do usuário */}
              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all duration-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </motion.button>

                  {/* Menu do usuário */}
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50"
                      >
                        <button
                          onClick={onProfileClick}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                        >
                          <User className="h-4 w-4" />
                          <span>Perfil</span>
                        </button>
                        <button
                          onClick={handleSignOut}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sair</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-4 py-2 rounded-full font-medium hover:from-primary-600 hover:to-purple-700 transition-all duration-200 text-sm"
                >
                  Entrar
                </motion.button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros mobile */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center justify-center space-x-1">
              <button
                onClick={() => setActiveFilter('trending')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeFilter === 'trending'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <TrendingUp className="h-3 w-3" />
                <span>Em Alta</span>
              </button>
              <button
                onClick={() => setActiveFilter('interests')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeFilter === 'interests'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Heart className="h-3 w-3" />
                <span>Interesses</span>
              </button>
              <button
                onClick={() => setActiveFilter('recent')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 ${
                  activeFilter === 'recent'
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                <Home className="h-3 w-3" />
                <span>Recentes</span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Modal de autenticação */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}
