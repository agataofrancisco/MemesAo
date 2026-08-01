import { useState } from 'react'
import {
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Header'
import ProfilePage from './components/ProfilePage'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import UploadModal from './components/UploadModal'
import SearchModal from './components/SearchModal'
import AdminDashboard from './components/AdminDashboard'
import MemePage from './components/MemePage'
import Feed from './components/Feed'
// import RevenueHitsManager from './components/ads/RevenueHitsManager'
import RevenueHitsConfig from './components/ads/RevenueHitsConfig'
function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState<'feed' | 'profile'>('feed')

  const handleFeedClick = () => {
    setCurrentPage('feed')
  }

  return (
    <ThemeProvider>
      <AppContent
        isAuthOpen={isAuthOpen}
        setIsAuthOpen={setIsAuthOpen}
        isUploadOpen={isUploadOpen}
        setIsUploadOpen={setIsUploadOpen}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
        isAdminOpen={isAdminOpen}
        setIsAdminOpen={setIsAdminOpen}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        handleFeedClick={handleFeedClick}
      />
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
  currentPage,
  setCurrentPage,
  handleFeedClick,
}: {
  isAuthOpen: boolean
  setIsAuthOpen: (open: boolean) => void
  isUploadOpen: boolean
  setIsUploadOpen: (open: boolean) => void
  isSearchOpen: boolean
  setIsSearchOpen: (open: boolean) => void
  isAdminOpen: boolean
  setIsAdminOpen: (open: boolean) => void
  currentPage: 'feed' | 'profile'
  setCurrentPage: (page: 'feed' | 'profile') => void
  handleFeedClick: () => void
}) {
  const location = useLocation()

  // Se estiver na rota do meme, não mostrar o header
  if (location.pathname.startsWith('/meme/')) {
    return (
      <Routes>
        <Route path="/meme/:memeId" element={<MemePage />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-x-hidden">
      {/* Sistema de Anúncios RevenueHits DESATIVADO — sem anúncios por decisão do dono
      <RevenueHitsManager
        showAnalytics={false}
        enableOptimization={true}
        maxAdsPerPage={6}
      />
      */}

      <Header
        onAuthClick={() => setIsAuthOpen(true)}
        onUploadClick={() => setIsUploadOpen(true)}
        onSearchClick={() => setIsSearchOpen(true)}
        onAdminClick={() => setIsAdminOpen(true)}
        onProfileClick={() => setCurrentPage('profile')}
        onFeedClick={handleFeedClick}
      />

      <Routes>
        <Route
          path="/"
          element={
            <main className="w-full max-w-full overflow-x-hidden pt-16">
              {currentPage === 'feed' ? (
                <Feed onAuthClick={() => setIsAuthOpen(true)} />
              ) : (
                <ProfilePage onBack={() => setCurrentPage('feed')} />
              )}
            </main>
          }
        />

        {/* Rota específica para o Feed */}
        <Route
          path="/feed"
          element={
            <main className="w-full max-w-full overflow-x-hidden pt-16">
              <Feed onAuthClick={() => setIsAuthOpen(true)} />
            </main>
          }
        />

        {/* Rota de Configuração RevenueHits */}
        <Route
          path="/ads-config"
          element={
            <main className="w-full max-w-full overflow-x-hidden py-8">
              <RevenueHitsConfig isOpen={true} onClose={() => {}} />
            </main>
          }
        />
      </Routes>

      <Footer />

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

      <Toaster position="top-right" />
    </div>
  )
}

export default App
