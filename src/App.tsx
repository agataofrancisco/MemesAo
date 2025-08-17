import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Header'
import Hero from './components/Hero'
import FeaturedMemes from './components/FeaturedMemes'
import Categories from './components/Categories'
import Statistics from './components/Statistics'
import Features from './components/Features'
import Footer from './components/Footer'
import AuthModal from './components/AuthModal'
import UploadModal from './components/UploadModal'
import SearchModal from './components/SearchModal'
import AdminDashboard from './components/AdminDashboard'
import BrowseModal from './components/BrowseModal'
import TestMemes from './components/TestMemes'

function App() {
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAdminOpen, setIsAdminOpen] = useState(false)
  const [isBrowseOpen, setIsBrowseOpen] = useState(false)
  const [browseCategory, setBrowseCategory] = useState<string | undefined>()

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header
          onAuthClick={() => setIsAuthOpen(true)}
          onUploadClick={() => setIsUploadOpen(true)}
          onSearchClick={() => setIsSearchOpen(true)}
          onAdminClick={() => setIsAdminOpen(true)}
        />

        <main>
          <Hero onBrowseClick={handleBrowseOpen} />
          <FeaturedMemes
            onCategoryClick={handleCategoryClick}
            onMemeClick={(meme) => {
              // Implementar modal de visualização de meme se necessário
              console.log('Meme clicado:', meme)
            }}
          />
          <Categories onCategoryClick={handleCategoryClick} />
          <Statistics />
          <Features />
        </main>

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

        {/* Componente de teste temporário */}
        <TestMemes />

        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  )
}

export default App
