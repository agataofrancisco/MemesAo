// Tipos partilhados entre a SPA e a API do Worker (Cloudflare).

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
  icon?: string;
  color?: string;
  created_at?: string;
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
  profile?: { username?: string | null; full_name?: string | null } | null;
  like_count?: number;
  share_count?: number;
  uploaded_by_name?: string;
  // Multi-categorias
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
