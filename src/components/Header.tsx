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
  Menu,
  X,
} from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../hooks/useAuth'
import AuthModal from './AuthModal'

interface HeaderProps {
  onSearchClick: () => void
  onUploadClick: () => void
  onAdminClick: () => void
}

export default function Header({
  onSearchClick,
  onUploadClick,
  onAdminClick,
}: HeaderProps) {
  const { isDark, toggleTheme } = useTheme()
  const { user, profile, signOut, isConfigured } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Erro ao sair:', error)
    }
  }

  // Função para verificar se o usuário é admin/moderador
  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  // Debug temporário - remover depois
  console.log('Header Debug:', {
    user: !!user,
    profile: profile,
    isAdmin,
    loading,
  })

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 sm:space-x-3"
            >
              <div className="relative">
                <Smile className="h-6 w-6 sm:h-8 sm:w-8 text-primary-500" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 h-2 w-2 sm:h-3 sm:w-3 bg-accent-500 rounded-full"
                />
              </div>
              <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
                MemesAo
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a
                href="#home"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                Início
              </a>
              <a
                href="#memes"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                Memes
              </a>
              <a
                href="#categorias"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                Categorias
              </a>
              <a
                href="#sobre"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                Sobre
              </a>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center space-x-2 sm:space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSearchClick}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                title="Buscar Memes"
              >
                <Search size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                title={isDark ? 'Modo Claro' : 'Modo Escuro'}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              {/* Admin button - only show for admin/moderator users */}
              {isConfigured && user && isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onAdminClick}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  title="Painel Admin"
                >
                  <Settings size={18} />
                </motion.button>
              )}

              {/* User Menu */}
              {isConfigured && user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    <User size={18} />
                  </motion.button>

                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2"
                    >
                      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {profile?.username || user?.email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <LogOut size={16} className="mr-2" />
                        Sair
                      </button>
                    </motion.div>
                  )}
                </div>
              ) : isConfigured ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300"
                >
                  Entrar
                </motion.button>
              ) : null}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onUploadClick}
                className="bg-gradient-to-r from-primary-500 to-purple-500 text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300"
              >
                <Upload size={14} className="inline mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Contribuir</span>
                <span className="sm:hidden">Upload</span>
              </motion.button>
            </div>

            {/* Mobile Actions */}
            <div className="flex sm:hidden items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSearchClick}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                <Search size={18} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onUploadClick}
                className="bg-gradient-to-r from-primary-500 to-purple-500 text-white p-2 rounded-lg"
              >
                <Upload size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
              >
                {showMobileMenu ? <X size={18} /> : <Menu size={18} />}
              </motion.button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="sm:hidden border-t border-gray-200 dark:border-gray-700 py-4 space-y-2"
            >
              <a
                href="#home"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Início
              </a>
              <a
                href="#memes"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Memes
              </a>
              <a
                href="#categorias"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                onClick={() => setShowMobileMenu(false)}
              >
                Categorias
              </a>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                <button
                  onClick={() => {
                    toggleTheme()
                    setShowMobileMenu(false)
                  }}
                  className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  {isDark ? (
                    <Sun size={18} className="mr-3" />
                  ) : (
                    <Moon size={18} className="mr-3" />
                  )}
                  {isDark ? 'Modo Claro' : 'Modo Escuro'}
                </button>

                {isConfigured && user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {profile?.username || user?.email}
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          onAdminClick()
                          setShowMobileMenu(false)
                        }}
                        className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      >
                        <Settings size={18} className="mr-3" />
                        Painel Admin
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut()
                        setShowMobileMenu(false)
                      }}
                      className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                    >
                      <LogOut size={18} className="mr-3" />
                      Sair
                    </button>
                  </>
                ) : isConfigured ? (
                  <button
                    onClick={() => {
                      setShowAuthModal(true)
                      setShowMobileMenu(false)
                    }}
                    className="w-full flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <User size={18} className="mr-3" />
                    Entrar
                  </button>
                ) : null}
              </div>
            </motion.div>
          )}
        </div>
      </motion.header>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}
