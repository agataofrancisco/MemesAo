import React, { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import Header from './components/Header'
import Feed from './components/Feed'
import ProfilePage from './components/ProfilePage'
import DownloadLimitNotification from './components/DownloadLimitNotification'
import { useAuth } from './hooks/useAuth'

export default function App() {
  console.log('🔍 App: Componente iniciando renderização')

  const [currentPage, setCurrentPage] = useState<'feed' | 'profile'>('feed')
  const location = useLocation()
  const { user } = useAuth()

  console.log('🔍 App: Estados iniciais:', { currentPage, user: !!user })

  const handleLogout = () => {
    console.log('🔍 App: handleLogout chamado')
    // TODO: Implementar logout
  }

  console.log('🔍 App: Renderizando com currentPage:', currentPage)

  const handleFeedClick = () => {
    setCurrentPage('feed')
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <Header
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          user={user}
          onLogout={handleLogout}
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
