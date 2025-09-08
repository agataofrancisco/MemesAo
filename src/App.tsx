import React, { useState, useEffect } from 'react' 
import { Routes, Route, useLocation } from 'react-router-dom' 
import { ThemeProvider } from './contexts/ThemeContext' 
import Header from './components/Header' 
import Feed from './components/Feed' 
import { useAuth } from './hooks/useAuth' 
 
export default function App() { 
  const { user } = useAuth() 
 
  return ( 
    <ThemeProvider> 
      <Header user={user} /> 
      <Feed /> 
    </ThemeProvider> 
  ) 
} 
