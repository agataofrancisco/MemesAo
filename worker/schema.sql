-- Schema D1 do MemesAo (SQLite)
-- Aplicar com: npx wrangler d1 execute memesao-db --remote --file=worker/schema.sql

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_verified INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','moderator','admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_verified INTEGER NOT NULL DEFAULT 0,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  meme_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS memes (
  id TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  image_path TEXT,
  thumbnail_path TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  format TEXT,
  ocr_text TEXT,
  category_id TEXT,
  uploaded_by TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meme_tags (
  id TEXT PRIMARY KEY,
  meme_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_meme_tags_unique ON meme_tags(meme_id, tag);

CREATE TABLE IF NOT EXISTS meme_views (
  id TEXT PRIMARY KEY,
  meme_id TEXT NOT NULL,
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meme_downloads (
  id TEXT PRIMARY KEY,
  meme_id TEXT NOT NULL,
  user_id TEXT,
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS meme_shares (
  id TEXT PRIMARY KEY,
  meme_id TEXT NOT NULL,
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  meme_id TEXT NOT NULL,
  reported_by TEXT,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewed','resolved')),
  reviewed_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  meme_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_favorites_unique ON user_favorites(user_id, meme_id);

CREATE TABLE IF NOT EXISTS meme_categories (
  id TEXT PRIMARY KEY,
  meme_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_meme_categories_unique ON meme_categories(meme_id, category_id);

CREATE TABLE IF NOT EXISTS user_interests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_interests_unique ON user_interests(user_id, category_id);

CREATE TABLE IF NOT EXISTS user_follows (
  id TEXT PRIMARY KEY,
  follower_id TEXT NOT NULL,
  following_id TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_follows_unique ON user_follows(follower_id, following_id);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_memes_status_created ON memes(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memes_category ON memes(category_id);
CREATE INDEX IF NOT EXISTS idx_memes_uploaded_by ON memes(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_meme_downloads_meme ON meme_downloads(meme_id);
CREATE INDEX IF NOT EXISTS idx_meme_shares_meme ON meme_shares(meme_id);
CREATE INDEX IF NOT EXISTS idx_meme_views_meme ON meme_views(meme_id);
CREATE INDEX IF NOT EXISTS idx_meme_tags_meme ON meme_tags(meme_id);
CREATE INDEX IF NOT EXISTS idx_meme_categories_meme ON meme_categories(meme_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
