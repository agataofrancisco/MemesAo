import { useState } from "react"; 
import { supabase, isSupabaseConfigured, type Meme } from "../lib/supabase"; 
 
export function useMemes() { 
  const [memes, setMemes] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [favorites, setFavorites] = useState([]); 
 
  return { 
    memes, loading, error, favorites, 
    toggleFavorite: () => {}, 
    downloadMeme: () => {}, 
    shareMeme: () => {}, 
    shareMemeWithUrl: () => {}, 
    searchMemes: () => [], 
    uploadMeme: () => {}, 
    refresh: () => {} 
  }; 
} 
