import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export function useMemes() {
  const [memes, setMemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔍 useMemes: Hook iniciando");

  const loadMemes = useCallback(async () => {
    console.log("🔍 useMemes: loadMemes iniciado");

    if (!isSupabaseConfigured || !supabase) {
      console.log("🔍 useMemes: Supabase não configurado");
      setError("Supabase não configurado");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log("🔍 useMemes: Carregando memes do Supabase...");

      // Query simplificada - buscar apenas memes aprovados
      const { data: memesData, error: memesError } = await supabase
        .from("memes")
        .select(
          `
          id,
          title,
          description,
          image_url,
          image_path,
          file_size,
          width,
          height,
          format,
          created_at,
          uploaded_by,
          category_id,
          view_count,
          download_count,
          status,
          ocr_text
        `
        )
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(100);

      console.log("🔍 useMemes: Query executada, resultado:", {
        memesData,
        memesError,
      });

      if (memesError) {
        console.error("🔍 useMemes: Erro ao buscar memes:", memesError);
        throw memesError;
      }

      console.log(`🔍 useMemes: Encontrados ${memesData?.length || 0} memes`);
      console.log("🔍 useMemes: Primeiros memes:", memesData?.slice(0, 3));

      if (!memesData || memesData.length === 0) {
        console.log("🔍 useMemes: Nenhum meme encontrado no banco");
        setMemes([]);
        setLoading(false);
        return;
      }

      setMemes(memesData);
      setLoading(false);
      console.log(
        "🔍 useMemes: Memes definidos no estado, loading definido como false"
      );
    } catch (error) {
      console.error("🔍 useMemes: Erro ao carregar memes:", error);
      setError(error instanceof Error ? error.message : String(error));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("🔍 useMemes: useEffect executando...");
    loadMemes();
  }, [loadMemes]);

  console.log("🔍 useMemes: Estado atual:", {
    memesLength: memes.length,
    loading,
    error,
  });

  return {
    memes,
    loading,
    error,
    toggleFavorite: () => console.log("🔍 useMemes: toggleFavorite chamado"),
    favorites: [],
    shareMeme: () => console.log("🔍 useMemes: shareMeme chamado"),
    downloadMeme: () => console.log("🔍 useMemes: downloadMeme chamado"),
  };
}
