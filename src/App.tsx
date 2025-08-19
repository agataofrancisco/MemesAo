import { useState } from 'react'
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

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isBrowseOpen, setIsBrowseOpen] = useState(false)
  const [browseCategory, setBrowseCategory] = useState<string | undefined>()
  const [currentPage, setCurrentPage] = useState<'home' | 'profile'>('home')

  const handleCategoryClick = (categoryName: string) => {
    setBrowseCategory(categoryName)
    setIsBrowseOpen(true)
  }

  const handleBrowseOpen = () => {
    setBrowseCategory(undefined)
    setIsBrowseOpen(true)
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors overflow-x-hidden">
        <Header
          onAuthClick={() => setIsAuthOpen(true)}
          onUploadClick={() => setIsUploadOpen(true)}
          onSearchClick={() => setIsSearchOpen(true)}
          onAdminClick={() => setIsAdminOpen(true)}
          onProfileClick={() => setCurrentPage('profile')}
        />

        {currentPage === 'home' ? (
          <main className="w-full max-w-full overflow-x-hidden">
            <Hero onBrowseClick={handleBrowseOpen} />

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
        ) : (
          <main className="w-full max-w-full overflow-x-hidden">
            <ProfilePage onBack={() => setCurrentPage('home')} />
          </main>
        )}

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
    </ThemeProvider>
  )
}

export default App
