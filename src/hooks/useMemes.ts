import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "../lib/api";
import type { Meme } from "../lib/types";
import { useAuth } from "./useAuth";

interface UploadResult {
  success: boolean;
  message?: string;
}

type MemeInput = Meme | string;

function resolveMemeId(meme: MemeInput): string {
  return typeof meme === "string" ? meme : meme.id;
}

interface MemesResponse {
  memes: Meme[];
}

interface FavoritesResponse {
  ids: string[];
}

interface FavoriteResponse {
  favorited: boolean;
  like_count: number;
}

export function useMemes() {
  const { user } = useAuth();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      const data = await apiGet<FavoritesResponse>("/api/favorites");
      setFavorites(data.ids);
    } catch (err) {
      console.error("Erro ao carregar favoritos:", err);
    }
  }, [user]);

  const loadMemes = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await apiGet<MemesResponse>("/api/memes");
      setMemes(data.memes);
    } catch (err) {
      console.error("Erro ao carregar memes:", err);
      setError(
        `Erro ao carregar memes: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemes();
  }, [loadMemes]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const searchMemes = useCallback(
    async (query: string, category: string = ""): Promise<Meme[]> => {
      const trimmed = query.trim();
      if (!trimmed) return [];

      try {
        const params = new URLSearchParams({ q: trimmed });
        if (category) params.set("category", category);
        const data = await apiGet<MemesResponse>(`/api/memes?${params}`);
        return data.memes;
      } catch (err) {
        console.error("Erro na busca de memes:", err);
        return [];
      }
    },
    []
  );

  const downloadMeme = useCallback(async (meme: MemeInput): Promise<void> => {
    const memeId = resolveMemeId(meme);

    try {
      await apiPost(`/api/memes/${memeId}/download`);
    } catch (err) {
      console.error("Erro ao registrar download:", err);
    }

    const memeRecord = memes.find((m) => m.id === memeId) ?? null;
    const imageUrl = memeRecord?.image_url;

    if (imageUrl) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = `${memeRecord?.title || "meme"}.jpg`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setMemes((prev) =>
      prev.map((m) =>
        m.id === memeId
          ? { ...m, download_count: (m.download_count || 0) + 1 }
          : m
      )
    );
  }, [memes]);

  const toggleFavorite = useCallback(
    async (memeId: string): Promise<void> => {
      if (!user) return;

      try {
        const data = await apiPost<FavoriteResponse>(
          `/api/memes/${memeId}/favorite`
        );

        setFavorites((prev) =>
          data.favorited
            ? prev.includes(memeId)
              ? prev
              : [...prev, memeId]
            : prev.filter((id) => id !== memeId)
        );
        setMemes((prev) =>
          prev.map((m) =>
            m.id === memeId
              ? { ...m, like_count: data.like_count }
              : m
          )
        );
      } catch (err) {
        console.error("Erro ao favoritar meme:", err);
      }
    },
    [user]
  );

  const registerShare = useCallback(async (memeId: string): Promise<void> => {
    try {
      await apiPost(`/api/memes/${memeId}/share`);
      setMemes((prev) =>
        prev.map((m) =>
          m.id === memeId
            ? { ...m, share_count: (m.share_count || 0) + 1 }
            : m
        )
      );
    } catch (err) {
      console.error("Erro ao registrar partilha:", err);
    }
  }, []);

  const shareMeme = useCallback(
    async (meme: MemeInput): Promise<void> => {
      await registerShare(resolveMemeId(meme));
    },
    [registerShare]
  );

  const shareMemeWithUrl = useCallback(
    async (meme: Meme): Promise<void> => {
      await registerShare(meme.id);
    },
    [registerShare]
  );

  const uploadMeme = useCallback(
    async (
      file: File,
      title: string,
      description: string,
      categoryId: string,
      tags: string[],
      categories: string[],
      ocrText = ''
    ): Promise<UploadResult> => {
      try {
        const form = new FormData();
        form.append("file", file);
        form.append("title", title);
        form.append("description", description);
        form.append("category_id", categoryId);
        form.append("tags", JSON.stringify(tags));
        form.append("categories", JSON.stringify(categories));
        form.append("ocr_text", ocrText);

        await apiPost("/api/memes", form);
        return { success: true };
      } catch (err) {
        console.error("Erro no upload do meme:", err);
        return {
          success: false,
          message:
            err instanceof Error ? err.message : "Erro ao fazer upload do meme",
        };
      }
    },
    []
  );

  const refresh = useCallback(async () => {
    await Promise.all([loadMemes(), loadFavorites()]);
  }, [loadMemes, loadFavorites]);

  return {
    memes,
    loading,
    error,
    favorites,
    searchMemes,
    downloadMeme,
    toggleFavorite,
    shareMeme,
    shareMemeWithUrl,
    uploadMeme,
    refresh,
  };
}
