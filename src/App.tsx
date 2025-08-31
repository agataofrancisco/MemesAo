import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Header'
import ProfilePage from './components/ProfilePage'
import Feed from './components/Feed'
import AuthModal from './components/AuthModal'
import UploadModal from './components/UploadModal'
import SearchModal from './components/SearchModal'
import AdminDashboard from './components/AdminDashboard'
import BrowseModal from './components/BrowseModal'
import MemePage from './components/MemePage'
import RouteTest from './components/RouteTest'
import SimpleDebug from './components/SimpleDebug'
import RevenueHitsConfig from './components/ads/RevenueHitsConfig'
import DownloadLimitNotification from './components/DownloadLimitNotification'

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isBrowseOpen, setIsBrowseOpen] = useState(false)
  const [browseCategory, setBrowseCategory] = useState<string | undefined>()
  const [currentPage, setCurrentPage] = useState<'feed' | 'profile'>('feed')

  const [currentPage, setCurrentPage] = useState<'feed' | 'profile'>('feed')
  const location = useLocation()
  const { user } = useAuth()

  console.log('🔍 App: Estados iniciais:', { currentPage, user: !!user })

  const handleLogout = () => {
    console.log('🔍 App: handleLogout chamado')
    // TODO: Implementar logout
  }

  console.log('🔍 App: Renderizando com currentPage:', currentPage)

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleCategoryClick={handleCategoryClick}
          handleBrowseOpen={handleBrowseOpen}
        />

        <main className="pt-16">
          {console.log(
            '🔍 App: Renderizando main com currentPage:',
            currentPage,
          )}
          <Routes>
            <Route
              path="/"
              element={
                <div>
                  {console.log('🔍 App: Renderizando Feed')}
                  <Feed />
                </div>
              }
            />
          </Routes>
        </main>

        {/* Notificação de limite de downloads */}
        <DownloadLimitNotification onClose={() => {}} />
      </div>
    </ThemeProvider>
  )
}

// Componente separado para usar useLocation
function AppContent({
  isAuthOpen,
  setIsAuthOpen,
  isUploadOpen,
  setIsUploadOpen,
  isSearchOpen,
  setIsSearchOpen,
  isAdminOpen,
  setIsAdminOpen,
  isBrowseOpen,
  setIsBrowseOpen,
  browseCategory,
  setBrowseCategory,
  currentPage,
  setCurrentPage,
  handleCategoryClick,
  handleBrowseOpen,
}: {
  isAuthOpen: boolean
  setIsAuthOpen: (open: boolean) => void
  isUploadOpen: boolean
  setIsUploadOpen: (open: boolean) => void
  isSearchOpen: boolean
  setIsSearchOpen: (open: boolean) => void
  isAdminOpen: boolean
  setIsAdminOpen: (open: boolean) => void
  isBrowseOpen: boolean
  setIsBrowseOpen: (open: boolean) => void
  browseCategory: string | undefined
  setBrowseCategory: (category: string | undefined) => void
  currentPage: 'feed' | 'profile'
  setCurrentPage: (page: 'feed' | 'profile') => void
  handleCategoryClick: (categoryName: string) => void
  handleBrowseOpen: () => void
}) {
  const location = useLocation()

  console.log('AppContent renderizado, pathname:', location.pathname)

  // Se estiver na rota do meme, não mostrar o header
  if (location.pathname.startsWith('/meme/')) {
    console.log('Renderizando MemePage para:', location.pathname)
    return (
      <Routes>
        <Route path="/meme/:memeId" element={<MemePage />} />
      </Routes>
    )
  }

  // Rota de teste
  if (location.pathname === '/test') {
    return (
      <Routes>
        <Route path="/test" element={<RouteTest />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-x-hidden">
      <Header
        onAuthClick={() => setIsAuthOpen(true)}
        onUploadClick={() => setIsUploadOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
        onProfileClick={() => setCurrentPage('profile')}
        onFeedClick={() => setCurrentPage('feed')}
        currentPage={currentPage}
      />

      <Routes>
        <Route
          path="/"
          element={
            currentPage === 'profile' ? (
              <main className="w-full max-w-full overflow-x-hidden pt-16">
                <ProfilePage onBack={() => setCurrentPage('feed')} />
              </main>
            ) : (
              <main className="w-full max-w-full overflow-x-hidden pt-16">
                <Feed
                  onAuthClick={() => setIsAuthOpen(true)}
                  onCategoryClick={handleCategoryClick}
                />
              </main>
            )
          }
        />

        {/* Rota específica para o Feed */}
        <Route
          path="/feed"
          element={
            <main className="w-full max-w-full overflow-x-hidden pt-16">
              <Feed
                onAuthClick={() => setIsAuthOpen(true)}
                onCategoryClick={handleCategoryClick}
              />
            </main>
          }
        />

        {/* Rota de Debug */}
        <Route
          path="/debug"
          element={
            <main className="w-full max-w-full overflow-x-hidden py-8 pt-16">
              <SimpleDebug />
            </main>
          }
        />

        {/* Rota de Configuração RevenueHits */}
        <Route
          path="/ads-config"
          element={
            <main className="w-full max-w-full overflow-x-hidden py-8 pt-16">
              <RevenueHitsConfig isOpen={true} onClose={() => {}} />
            </main>
          }
        />
      </Routes>

      {/* Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
      <BrowseModal
        isOpen={isBrowseOpen}
        onClose={() => setIsBrowseOpen(false)}
        initialCategory={browseCategory}
      />

      <Toaster position="top-right" />

      {/* Notificação de limite de downloads */}
      <DownloadLimitNotification />
    </div>
  )
}

export default App
