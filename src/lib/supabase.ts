import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://zsiqcnwnisfdkaiibpxf.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpzaXFjbnduaXNmZGthaWlicHhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExMDMyNzQsImV4cCI6MjA2NjY3OTI3NH0.mgMcls6TaEkoTuxp6iLOlQ_m4NKri0vHHqEAfUV7lKg";

// Verificar se as variáveis de ambiente estão configuradas
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Tipos para o banco de dados baseados nas migrações
export interface Profile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role: "user" | "moderator" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  meme_count: number;
  created_at: string;
}

export interface Meme {
  id: string;
  title?: string;
  description?: string;
  image_url: string;
  image_path: string;
  file_size?: number;
  width?: number;
  height?: number;
  format?: string;
  ocr_text?: string;
  category_id?: string;
  uploaded_by?: string;
  status: "pending" | "approved" | "rejected";
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  category?: Category;
  profile?: Profile;
  tags?: MemeTag[];
}

export interface MemeTag {
  id: string;
  meme_id: string;
  tag: string;
  created_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  meme_id: string;
  created_at: string;
  meme?: Meme;
}

export interface MemeView {
  id: string;
  meme_id: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface MemeDownload {
  id: string;
  meme_id: string;
  user_id?: string;
  ip_address?: string;
  created_at: string;
}

export interface Report {
  id: string;
  meme_id: string;
  reported_by: string;
  reason: string;
  description?: string;
  status: "pending" | "reviewed" | "resolved";
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
}
