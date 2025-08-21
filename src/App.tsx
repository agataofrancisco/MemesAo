import { useState } from 'react'
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Header'
import ProfilePage from './components/ProfilePage'
import Hero from './components/Hero'
import TopMemes from './components/TopMemes'
import Statistics from './components/Statistics'
import FeaturedMemes from './components/FeaturedMemes'
import Categories from './components/Categories'
import Features from './components/Features'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import UploadModal from './components/UploadModal'
import SearchModal from './components/SearchModal'
import AdminDashboard from './components/AdminDashboard'
import BrowseModal from './components/BrowseModal'
import MemePage from './components/MemePage'
import RouteTest from './components/RouteTest'
import Feed from './components/Feed'

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isBrowseOpen, setIsBrowseOpen] = useState(false)
  const [browseCategory, setBrowseCategory] = useState<string | undefined>()
  const [currentPage, setCurrentPage] = useState<'home' | 'profile' | 'feed'>(
    'home',
  )

  const handleCategoryClick = (categoryName: string) => {
    setBrowseCategory(categoryName)
    setIsBrowseOpen(true)
  }

  const handleBrowseOpen = () => {
    setBrowseCategory(undefined)
    setIsBrowseOpen(true)
  }

  const handleFeedClick = () => {
    setCurrentPage('feed')
  }

  return (
    <ThemeProvider>
      <Router>
        <AppContent
          isAuthOpen={isAuthOpen}
          setIsAuthOpen={setIsAuthOpen}
          isUploadOpen={isUploadOpen}
          setIsUploadOpen={setIsUploadOpen}
          isSearchOpen={isSearchOpen}
          setIsSearchOpen={setIsSearchOpen}
          isAdminOpen={isAdminOpen}
          setIsAdminOpen={setIsAdminOpen}
          isBrowseOpen={isBrowseOpen}
          setIsBrowseOpen={setIsBrowseOpen}
          browseCategory={browseCategory}
          setBrowseCategory={setBrowseCategory}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          handleCategoryClick={handleCategoryClick}
          handleBrowseOpen={handleBrowseOpen}
          handleFeedClick={handleFeedClick}
        />
      </Router>
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
  isBrowseOpen: boolean
  setIsBrowseOpen: (open: boolean) => void
  browseCategory: string | undefined
  setBrowseCategory: (category: string | undefined) => void
  currentPage: 'home' | 'profile' | 'feed'
  setCurrentPage: (page: 'home' | 'profile' | 'feed') => void
  handleCategoryClick: (categoryName: string) => void
  handleBrowseOpen: () => void
  handleFeedClick: () => void
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
        onFeedClick={handleFeedClick}
      />

      <Routes>
        <Route
          path="/"
          element={
            currentPage === 'home' ? (
              <main className="w-full max-w-full overflow-x-hidden">
                <Hero
                  onBrowseClick={handleBrowseOpen}
                  onFeedClick={handleFeedClick}
                />

                {/* 1. Memes em Destaque (Top memes) */}
                <TopMemes
                  onMemeClick={(meme) => {
                    console.log('Top meme clicado:', meme)
                  }}
                />

                {/* 2. Estatísticas globais */}
                <Statistics />

                {/* 3. Explore os Memes */}
                <FeaturedMemes
                  onCategoryClick={handleCategoryClick}
                  onMemeClick={(meme) => {
                    console.log('Meme clicado:', meme)
                  }}
                />

                {/* 4. Categorias Populares (top 3) */}
                <Categories onCategoryClick={handleCategoryClick} />

                <Features />
              </main>
            ) : currentPage === 'profile' ? (
              <main className="w-full max-w-full overflow-x-hidden">
                <ProfilePage onBack={() => setCurrentPage('home')} />
              </main>
            ) : currentPage === 'feed' ? (
              <main className="w-full max-w-full overflow-x-hidden">
                <Feed />
              </main>
            ) : null
          }
        />

        {/* Rota específica para o Feed */}
        <Route
          path="/feed"
          element={
            <main className="w-full max-w-full overflow-x-hidden">
              <Feed />
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
      <BrowseModal
        isOpen={isBrowseOpen}
        onClose={() => setIsBrowseOpen(false)}
        initialCategory={browseCategory}
      />

      <Toaster position="top-right" />
    </div>
  )
}

export default App
