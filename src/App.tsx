import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import FeaturedMemes from './components/FeaturedMemes';
import Categories from './components/Categories';
import Statistics from './components/Statistics';
import Features from './components/Features';
import UploadSection from './components/UploadSection';
import Footer from './components/Footer';
import SearchModal from './components/SearchModal';
import UploadModal from './components/UploadModal';
import AdminDashboard from './components/AdminDashboard';
import { ThemeProvider } from './contexts/ThemeContext';

export default function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg)',
              color: 'var(--toast-color)',
            },
          }}
        />
        
        {isAdminMode ? (
          <AdminDashboard onClose={() => setIsAdminMode(false)} />
        ) : (
          <>
            <Header 
              onSearchClick={() => setIsSearchOpen(true)}
              onUploadClick={() => setIsUploadOpen(true)}
              onAdminClick={() => setIsAdminMode(true)}
            />
            
            <main className="relative">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Hero onSearchClick={() => setIsSearchOpen(true)} />
                <Statistics />
                <FeaturedMemes />
                <Categories />
                <Features />
                <UploadSection onUploadClick={() => setIsUploadOpen(true)} />
              </motion.div>
            </main>

            <Footer />

            <SearchModal 
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
            />
            
            <UploadModal 
              isOpen={isUploadOpen}
              onClose={() => setIsUploadOpen(false)}
            />
          </>
        )}
      </div>
    </ThemeProvider>
  );
}