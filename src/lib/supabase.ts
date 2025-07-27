import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verificar se as variáveis de ambiente estão configuradas
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Tipos para o banco de dados
export interface Meme {
  id: string;
  title: string;
  image_url: string;
  category: string;
  ocr_text: string;
  tags: string[];
  likes: number;
  downloads: number;
  views: number;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
  is_premium: boolean;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  meme_id: string;
  created_at: string;
}