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
  currentPage: 'feed' | 'profile'
  setCurrentPage: (page: 'feed' | 'profile') => void
  user: { email: string; role: string } | null
  onLogout: () => void
}

export default function Header({
  currentPage,
  setCurrentPage,
  user,
  onLogout,
}: HeaderProps) {
  console.log('🔍 Header: Componente renderizando com:', {
    currentPage,
    user: !!user,
  })

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<
    'trending' | 'recent' | 'interests'
  >('recent')

  console.log('🔍 Header: Estados locais:', { isUserMenuOpen, activeFilter })

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage('feed')}
              className="flex items-center space-x-2 text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <span>MemesAo</span>
            </button>
          </div>

          {/* Filtros centrais */}
          <div className="hidden sm:flex items-center space-x-1">
            <button
              onClick={() => setActiveFilter('trending')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === 'trending'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Em Alta</span>
            </button>

            <button
              onClick={() => setActiveFilter('interests')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === 'interests'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Interesses</span>
            </button>

            <button
              onClick={() => setActiveFilter('recent')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === 'recent'
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Recentes</span>
            </button>
          </div>

          {/* Ações do usuário */}
          <div className="flex items-center space-x-2">
            {/* Botão de tema */}
            <ThemeToggle />

            {/* Botão de admin (se for admin) */}
            {user?.role === 'admin' && (
              <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            )}

            {/* Menu do usuário */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                    <button
                      onClick={() => {
                        setCurrentPage('profile')
                        setIsUserMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Perfil
                    </button>
                    <button
                      onClick={() => {
                        onLogout()
                        setIsUserMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
