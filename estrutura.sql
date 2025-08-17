-- Database Structure for MemesAo

-- Table: profiles (no data found)

-- Table: categories
-- Columns found: id, name, slug, description, icon, color, meme_count, created_at
-- Sample data structure:
-- {
  "id": "9fecb75e-c31c-49d8-a59a-0bb89fdbb790",
  "name": "Reação",
  "slug": "reacao",
  "description": "Memes de reação e expressões",
  "icon": "Smile",
  "color": "from-yellow-400 to-orange-500",
  "meme_count": 1,
  "created_at": "2025-06-28T10:04:02.59671+00:00"
}

-- Table: memes
-- Columns found: id, title, description, image_url, image_path, file_size, width, height, format, ocr_text, category_id, uploaded_by, status, view_count, download_count, created_at, updated_at
-- Sample data structure:
-- {
  "id": "daa5e5a7-fff6-4ef2-a286-9f655a0adc2e",
  "title": "Quando é sexta-feira",
  "description": "A alegria de chegar ao fim da semana",
  "image_url": "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800",
  "image_path": "exemplo1.jpg",
  "file_size": null,
  "width": null,
  "height": null,
  "format": null,
  "ocr_text": "sexta-feira chegou finalmente",
  "category_id": "9fecb75e-c31c-49d8-a59a-0bb89fdbb790",
  "uploaded_by": null,
  "status": "approved",
  "view_count": 1234,
  "download_count": 567,
  "created_at": "2025-06-29T02:52:20.720924+00:00",
  "updated_at": "2025-06-29T02:52:20.720924+00:00"
}

-- Table: meme_tags
-- Columns found: id, meme_id, tag, created_at
-- Sample data structure:
-- {
  "id": "84029747-3b6b-45d7-9a32-0f68be62eb22",
  "meme_id": "578e15e1-c1bf-44a2-ab1a-1988ef9884ba",
  "tag": "primeiro",
  "created_at": "2025-06-29T04:39:01.7233+00:00"
}

-- Table: user_favorites (no data found)

-- Table: meme_views (no data found)

-- Table: meme_downloads (no data found)

-- Table: reports (no data found)

-- Table: pending_memes (no data found)

