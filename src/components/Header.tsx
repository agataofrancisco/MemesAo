import { useState } from 'react'
import {
  TrendingUp,
  Heart,
  Home,
  Settings,
  Moon,
  Sun,
  Search,
  Upload,
  LogOut,
  User as UserIcon,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../contexts/ThemeContext'

interface HeaderProps {
  onAuthClick: () => void
  onUploadClick: () => void
  onSearchClick: () => void
  onAdminClick: () => void
  onProfileClick: () => void
  onFeedClick: () => void
}

export default function Header({
  onAuthClick,
  onUploadClick,
  onSearchClick,
  onAdminClick,
  onProfileClick,
  onFeedClick,
}: HeaderProps) {
  const { user, profile, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'

  const handleLogout = async () => {
    await signOut()
    setIsUserMenuOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={onFeedClick}
            className="flex items-center space-x-2 text-2xl font-bold text-primary-700 dark:text-primary-300 hover:text-primary-800 dark:hover:text-primary-200 transition-colors"
          >
            <span>MemesAo</span>
          </button>

          {/* Navegação central */}
          <div className="hidden sm:flex items-center space-x-1">
            <button
              onClick={onFeedClick}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Em Alta</span>
            </button>

            <button
              onClick={onFeedClick}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <Heart className="h-4 w-4" />
              <span>Interesses</span>
            </button>

            <button
              onClick={onFeedClick}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              <Home className="h-4 w-4" />
              <span>Recentes</span>
            </button>
          </div>

          {/* Ações do usuário */}
          <div className="flex items-center space-x-2">
            {/* Buscar */}
            <button
              onClick={onSearchClick}
              title="Buscar memes"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Upload */}
            <button
              onClick={onUploadClick}
              title="Publicar meme"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <Upload className="h-5 w-5" />
            </button>

            {/* Tema */}
            <button
              onClick={toggleTheme}
              title="Alternar tema"
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Admin */}
            {isAdmin && (
              <button
                onClick={onAdminClick}
                title="Painel administrativo"
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
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
                    {profile?.username?.charAt(0).toUpperCase() ||
                      user.email?.charAt(0).toUpperCase() ||
                      'U'}
                  </div>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 z-20 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                      <button
                        onClick={() => {
                          onProfileClick()
                          setIsUserMenuOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <UserIcon className="h-4 w-4 mr-2" />
                        Perfil
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
