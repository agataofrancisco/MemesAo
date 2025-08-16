import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured, type Meme } from "../lib/supabase";
import toast from "react-hot-toast";

// Callback para notificar outros componentes sobre mudanças
let onMemesChange: (() => void) | null = null;

export function setMemesChangeCallback(callback: () => void) {
  onMemesChange = callback;
}

export function useMemes() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [featuredMemes, setFeaturedMemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMemes();
    loadFeaturedMemes();
    loadFavorites();
  }, []);

  const loadMemes = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        // ✅ BUSCAR DIRETAMENTE da tabela memes (TODOS os memes aprovados)
        const { data, error } = await supabase
          .from("memes")
          .select(
            `
            *,
            categories (
              name
            )
          `
          )
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // ✅ TRANSFORMAR dados para formato esperado
        const transformedMemes =
          data?.map((meme) => ({
            ...meme,
            category: meme.categories?.name || "Outros",
            likes: meme.view_count || 0,
            downloads: meme.download_count || 0,
            views: meme.view_count || 0,
            tags: [], // Tags virão da tabela meme_tags se necessário
          })) || [];

        setMemes(transformedMemes);
      } else {
        // ✅ SEM BACKEND: Array vazio
        setMemes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar memes:", error);
      setMemes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedMemes = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        // ✅ CORRIGIDO: Buscar DIRETAMENTE da tabela memes (não da view featured_memes)
        const { data, error } = await supabase
          .from("memes")
          .select(
            `
            *,
            categories (
              name
            )
          `
          )
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(50); // Buscar mais memes para ter opções

        if (error) throw error;

        // Para cada meme, contar favoritos individualmente
        const memesWithFavorites = await Promise.all(
          (data || []).map(async (meme) => {
            const { count } = await supabase
              .from("user_favorites")
              .select("*", { count: "exact", head: true })
              .eq("meme_id", meme.id);

            return {
              ...meme,
              category: meme.categories?.name || "Outros",
              favorite_count: count || 0,
              likes: count || 0,
              downloads: meme.download_count || 0,
              views: meme.view_count || 0,
              tags: [],
            };
          })
        );

        // ✅ FILTRAR: Apenas memes com pelo menos 1 like, ordenar e limitar a 6
        const featuredWithLikes = memesWithFavorites
          .filter((meme) => meme.favorite_count > 0) // Só memes com likes
          .sort((a, b) => b.favorite_count - a.favorite_count) // Ordenar por likes
          .slice(0, 6); // Máximo 6 memes

        setFeaturedMemes(featuredWithLikes);
      } else {
        // ✅ SEM BACKEND: Array vazio
        setFeaturedMemes([]);
      }
    } catch (error) {
      console.error("Erro ao carregar memes em destaque:", error);
      setFeaturedMemes([]);
    }
  };

  const loadFavorites = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("user_favorites")
            .select("meme_id")
            .eq("user_id", user.id);

          if (error) throw error;

          setFavorites(data?.map((fav) => fav.meme_id) || []);
        }
      } catch (error) {
        console.error("Erro ao carregar favoritos:", error);
        // Fallback to localStorage
        const localFavorites = localStorage.getItem("memesao_favorites");
        if (localFavorites) {
          setFavorites(JSON.parse(localFavorites));
        }
      }
    } else {
      // Carregar favoritos do localStorage se não houver backend
      const localFavorites = localStorage.getItem("memesao_favorites");
      if (localFavorites) {
        setFavorites(JSON.parse(localFavorites));
      }
    }
  };

  const toggleFavorite = async (memeId: string) => {
    const isFavorited = favorites.includes(memeId);

    if (isSupabaseConfigured && supabase) {
      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // User is logged in - save to database
          if (isFavorited) {
            const { error } = await supabase
              .from("user_favorites")
              .delete()
              .eq("meme_id", memeId)
              .eq("user_id", user.id);

            if (error) throw error;
          } else {
            const { error } = await supabase.from("user_favorites").insert({
              meme_id: memeId,
              user_id: user.id,
            });

            if (error) throw error;
          }

          // Recarregar memes em destaque para atualizar contadores
          loadFeaturedMemes();
        } else {
          // User not logged in - show friendly message
          toast.success(
            isFavorited
              ? "Removido dos favoritos (local)"
              : "Adicionado aos favoritos (local)!\nFaça login para sincronizar entre dispositivos"
          );
        }
      } catch (error) {
        console.error("Erro ao atualizar favorito:", error);
        toast.error("Erro ao atualizar favorito");
        return;
      }
    } else {
      // No backend - just show success message
      toast.success(
        isFavorited
          ? "Removido dos favoritos (local)"
          : "Adicionado aos favoritos (local)!"
      );
    }

    // Atualizar estado local sempre
    const newFavorites = isFavorited
      ? favorites.filter((id) => id !== memeId)
      : [...favorites, memeId];

    setFavorites(newFavorites);

    // Salvar no localStorage sempre (backup/fallback)
    localStorage.setItem("memesao_favorites", JSON.stringify(newFavorites));

    // Atualizar contador de likes nos memes normais
    setMemes((prev) =>
      prev.map((meme) =>
        meme.id === memeId
          ? { ...meme, likes: meme.likes + (isFavorited ? -1 : 1) }
          : meme
      )
    );

    // Atualizar contador nos memes em destaque
    setFeaturedMemes((prev) =>
      prev.map((meme) =>
        meme.id === memeId
          ? {
              ...meme,
              favorite_count: meme.favorite_count + (isFavorited ? -1 : 1),
            }
          : meme
      )
    );
  };

  const downloadMeme = async (meme: Meme) => {
    try {
      // Registrar download
      if (isSupabaseConfigured && supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        await supabase.from("meme_downloads").insert({
          meme_id: meme.id,
          user_id: user?.id || null,
          ip_address: "127.0.0.1", // This would be actual IP in production
        });
      }

      // Atualizar estado local
      setMemes((prev) =>
        prev.map((m) =>
          m.id === meme.id ? { ...m, downloads: m.downloads + 1 } : m
        )
      );

      setFeaturedMemes((prev) =>
        prev.map((m) =>
          m.id === meme.id
            ? { ...m, download_count: (m.download_count || 0) + 1 }
            : m
        )
      );

      // Fazer download da imagem
      const response = await fetch(meme.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${meme.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
      toast.success("Meme baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao baixar meme:", error);
      toast.error("Erro ao baixar meme");
    }
  };

  const checkForDuplicates = async (file: File): Promise<boolean> => {
    if (!isSupabaseConfigured || !supabase) {
      return false; // Sem backend, não verificar duplicatas
    }

    try {
      // Verificação mais rigorosa de duplicados
      const { data, error } = await supabase
        .from("memes")
        .select("title, file_size, ocr_text, image_path")
        .eq("file_size", file.size);

      if (error) {
        console.error("Erro ao verificar duplicatas:", error);
        return false;
      }

      // Verificar por nome de arquivo exato
      const fileName = file.name.toLowerCase();
      const hasExactMatch = data?.some((meme) => {
        const memePath = meme.image_path?.toLowerCase() || "";
        return memePath.includes(fileName.replace(/\.[^/.]+$/, ""));
      });

      if (hasExactMatch) {
        return true;
      }

      // Verificar por tamanho exato + similaridade de nome
      const fileNameBase = fileName
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-z0-9]/g, "");
      const hasSimilarMatch = data?.some((meme) => {
        const memeTitle = (meme.title || "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        const memePath = (meme.image_path || "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");

        // Se tem o mesmo tamanho E nome similar
        return (
          meme.file_size === file.size &&
          (memeTitle.includes(fileNameBase) ||
            fileNameBase.includes(memeTitle) ||
            memePath.includes(fileNameBase))
        );
      });

      return hasSimilarMatch || false;
    } catch (error) {
      console.error("Erro ao verificar duplicatas:", error);
      return false;
    }
  };

  const uploadMeme = async (
    file: File,
    metadata: {
      title: string;
      description?: string;
      tags: string[];
      category: string;
      ocrText: string;
    }
  ) => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error(
        "Backend não configurado. Configure o Supabase para fazer uploads permanentes."
      );
      return null;
    }

    if (uploading) {
      toast.error("Upload já em andamento. Aguarde...");
      return null;
    }

    setUploading(true);

    try {
      // Verificar duplicatas com mais rigor
      const isDuplicate = await checkForDuplicates(file);
      if (isDuplicate) {
        toast.error("Este meme já existe na plataforma! Tente outro arquivo.");
        return null;
      }

      // Encontrar categoria existente
      let categoryId: string | null = null;

      const { data: existingCategory } = await supabase
        .from("categories")
        .select("id")
        .eq("name", metadata.category)
        .single();

      if (existingCategory) {
        categoryId = existingCategory.id;
      } else {
        // Se a categoria não existir, usar "Cotidiano" como fallback
        const { data: defaultCategory } = await supabase
          .from("categories")
          .select("id")
          .eq("name", "Cotidiano")
          .single();

        if (defaultCategory) {
          categoryId = defaultCategory.id;
        }
      }

      // Upload da imagem
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("memes")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("memes").getPublicUrl(fileName);

      // Obter dados do usuário (se logado)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Salvar metadados no banco (com ou sem usuário)
      const { data: memeData, error: memeError } = await supabase
        .from("memes")
        .insert({
          title: metadata.title,
          description: metadata.description,
          image_url: publicUrl,
          image_path: fileName,
          category_id: categoryId,
          ocr_text: metadata.ocrText,
          file_size: file.size,
          format: fileExt,
          uploaded_by: user?.id || null, // Permitir uploads anônimos
          status: "pending", // Memes start as pending for moderation
        })
        .select(
          `
          *,
          categories (
            name
          )
        `
        )
        .single();

      if (memeError) throw memeError;

      // Adicionar tags se fornecidas
      if (metadata.tags.length > 0) {
        const tagInserts = metadata.tags.map((tag) => ({
          meme_id: memeData.id,
          tag: tag.trim(),
        }));

        await supabase.from("meme_tags").insert(tagInserts);
      }

      // Transformar dados para o formato esperado
      const transformedMeme = {
        ...memeData,
        category: memeData.categories?.name || "Outros",
        likes: 0,
        downloads: 0,
        views: 0,
        tags: metadata.tags,
      };

      // Atualizar lista local
      setMemes((prev) => [transformedMeme, ...prev]);

      // ✅ NOTIFICAR outros hooks sobre a mudança
      if (onMemesChange) {
        onMemesChange();
      }

      toast.success("Meme enviado com sucesso! Aguardando aprovação.");

      return transformedMeme;
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao enviar meme");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const searchMemes = async (query: string, category?: string) => {
    if (!query.trim()) return [];

    if (isSupabaseConfigured && supabase) {
      try {
        // ✅ BUSCAR SEMPRE da tabela memes (NUNCA da view featured_memes)
        let queryBuilder = supabase
          .from("memes")
          .select(
            `
            *,
            categories (
              name
            )
          `
          )
          .eq("status", "approved");

        // ✅ BUSCA por texto otimizada
        if (query) {
          queryBuilder = queryBuilder.or(
            `title.ilike.%${query}%,ocr_text.ilike.%${query}%,description.ilike.%${query}%`
          );
        }

        // ✅ FILTRAR por categoria se especificada
        if (category && category !== "Todas as categorias") {
          const { data: categoryData } = await supabase
            .from("categories")
            .select("id")
            .eq("name", category)
            .single();

          if (categoryData) {
            queryBuilder = queryBuilder.eq("category_id", categoryData.id);
          }
        }

        const { data, error } = await queryBuilder
          .order("view_count", { ascending: false })
          .limit(50);

        if (error) throw error;

        // ✅ TRANSFORMAR dados
        const results =
          data?.map((meme) => ({
            ...meme,
            category: meme.categories?.name || "Outros",
            likes: meme.view_count || 0,
            downloads: meme.download_count || 0,
            views: meme.view_count || 0,
            tags: [],
          })) || [];

        // ✅ ORDENAR por relevância (título primeiro)
        const sortedResults = results.sort((a, b) => {
          const aTitle = a.title?.toLowerCase() || "";
          const bTitle = b.title?.toLowerCase() || "";
          const queryLower = query.toLowerCase();

          const aTitleMatch = aTitle.includes(queryLower);
          const bTitleMatch = bTitle.includes(queryLower);

          if (aTitleMatch && !bTitleMatch) return -1;
          if (!aTitleMatch && bTitleMatch) return 1;

          // ✅ FALLBACK: Ordenar por views
          return b.views - a.views;
        });

        return sortedResults;
      } catch (error) {
        console.error("Erro na busca:", error);
        throw error;
      }
    } else {
      // ✅ SEM BACKEND: Array vazio
      return [];
    }
  };

  return {
    memes,
    featuredMemes,
    loading,
    favorites,
    uploading,
    toggleFavorite,
    downloadMeme,
    uploadMeme,
    searchMemes,
    checkForDuplicates,
    isBackendConfigured: isSupabaseConfigured,
  };
}
