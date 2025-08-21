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
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  role: "user" | "moderator" | "admin";
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Meme {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string;
  image_path: string | null;
  file_size: number | null;
  width: number | null;
  height: number | null;
  format: string | null;
  created_at: string;
  uploaded_by: string | null;
  category_id: string | null;
  view_count: number | null;
  download_count: number | null;
  status: "pending" | "approved" | "rejected";
  ocr_text: string | null;
  category?: string;
  profile?: { username: string };
  like_count?: number;
  share_count?: number;
  // Novos campos para multi-categorias
  categories?: Category[];
  category_names?: string[];
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
  reporter_id: string | null;
  reason: string;
  description?: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
}

export interface PendingMeme {
  id: string;
  title?: string;
  description?: string;
  image_url: string;
  category: string;
  tags: string[];
  uploaded_by: string | null;
  uploaded_at: string;
  extracted_text?: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  rejection_reason?: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

export interface UserInterest {
  id: string;
  user_id: string;
  category_id: string;
  weight: number;
  created_at: string;
  category?: Category;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  follower?: Profile;
  following?: Profile;
}

export interface MemeCategory {
  id: string;
  meme_id: string;
  category_id: string;
  created_at: string;
  category?: Category;
}
