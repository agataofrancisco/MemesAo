import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import type { Meme, PendingMeme } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { useOCR } from "./useOCR";
import toast from "react-hot-toast";

interface UploadResult {
  success: boolean;
  message: string;
  id?: string;
}

export function useMemes() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const { user, profile } = useAuth();
  const { extractText } = useOCR();

  const loadMemes = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase não configurado");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log("Carregando memes do Supabase...");

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

      if (memesError) {
        console.error("Erro ao buscar memes:", memesError);
        throw memesError;
      }

      console.log(`Encontrados ${memesData?.length || 0} memes`);

      if (!memesData || memesData.length === 0) {
        console.log("Nenhum meme encontrado no banco");
        setMemes([]);
        return;
      }

      // Buscar categorias separadamente
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name");

      if (categoriesError) {
        console.error("Erro ao buscar categorias:", categoriesError);
      }

      // Buscar perfis dos usuários separadamente
      const uploaderIds = [
        ...new Set(memesData.map((m) => m.uploaded_by).filter(Boolean)),
      ];
      let profilesData: any[] = [];

      if (uploaderIds.length > 0) {
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, username")
          .in("id", uploaderIds);

        if (profilesError) {
          console.error("Erro ao buscar perfis:", profilesError);
        } else {
          profilesData = profiles || [];
        }
      }

      // Buscar contagem de likes para cada meme
      const memeIds = memesData.map((m) => m.id);
      let likeCounts: Record<string, number> = {};
      let shareCounts: Record<string, number> = {};

      if (memeIds.length > 0) {
        const { data: likesData, error: likesError } = await supabase
          .from("user_favorites")
          .select("meme_id")
          .in("meme_id", memeIds);

        if (!likesError && likesData) {
          // Contar likes por meme
          likeCounts = likesData.reduce((acc, like) => {
            acc[like.meme_id] = (acc[like.meme_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        }
        // Contar compartilhamentos por meme
        const { data: sharesData, error: sharesError } = await supabase
          .from("meme_shares")
          .select("meme_id")
          .in("meme_id", memeIds);

        if (!sharesError && sharesData) {
          shareCounts = sharesData.reduce((acc, share) => {
            acc[share.meme_id] = (acc[share.meme_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        }
      }

      // Mapear dados para incluir informações relacionadas
      const transformedMemes = memesData.map((meme) => {
        const category = categoriesData?.find((c) => c.id === meme.category_id);
        const userProfile = profilesData?.find(
          (p) => p.id === meme.uploaded_by
        );

        return {
          ...meme,
          category: category?.name || "Sem categoria",
          profile: userProfile ? { username: userProfile.username } : undefined,
          view_count: meme.view_count || 0,
          download_count: meme.download_count || 0,
          like_count: likeCounts[meme.id] || 0,
          share_count: shareCounts[meme.id] || 0,
        };
      });

      console.log(`Memes transformados: ${transformedMemes.length}`);
      setMemes(transformedMemes);
    } catch (error) {
      console.error("Erro ao carregar memes:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(`Erro ao carregar memes: ${errorMessage}`);
      toast.error("Erro ao carregar memes");
      setMemes([]);
    } finally {
      setLoading(false);
    }
  }, []); // Sem dependências para evitar loops

  const loadFavorites = useCallback(async () => {
    // Sempre carregar favoritos do localStorage
    const localFavorites = JSON.parse(
      localStorage.getItem("favorites") || "[]"
    );
    setFavorites(localFavorites);

    // Se o usuário estiver logado, também carregar do Supabase
    if (user && isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from("user_favorites")
          .select("meme_id")
          .eq("user_id", user.id);

        if (error) throw error;

        const supabaseFavorites = data?.map((fav) => fav.meme_id) || [];

        // Combinar favoritos locais e do Supabase (sem duplicatas)
        const combinedFavorites = Array.from(
          new Set([...localFavorites, ...supabaseFavorites])
        );
        setFavorites(combinedFavorites);

        // Atualizar localStorage com favoritos combinados
        localStorage.setItem("favorites", JSON.stringify(combinedFavorites));
      } catch (error) {
        console.error("Erro ao carregar favoritos do Supabase:", error);
      }
    }
  }, [user?.id]); // Apenas dependência do user.id

  const checkDuplicateByOCR = async (
    extractedText: string
  ): Promise<boolean> => {
    if (!isSupabaseConfigured || !extractedText.trim() || !supabase)
      return false;

    try {
      // Verificar duplicados nos memes aprovados usando ocr_text (não extracted_text)
      const { data: approvedMemes, error: approvedError } = await supabase
        .from("memes")
        .select("id, ocr_text")
        .eq("status", "approved")
        .not("ocr_text", "is", null);

      if (approvedError) throw approvedError;

      // Verificar duplicados nos memes pendentes
      const { data: pendingMemes, error: pendingError } = await supabase
        .from("memes")
        .select("id, ocr_text")
        .eq("status", "pending")
        .not("ocr_text", "is", null);

      if (pendingError) throw pendingError;

      const allMemes = [...(approvedMemes || []), ...(pendingMemes || [])];

      // Função para calcular similaridade entre textos
      const calculateSimilarity = (text1: string, text2: string): number => {
        const words1 = text1
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => word.length > 2);
        const words2 = text2
          .toLowerCase()
          .split(/\s+/)
          .filter((word) => word.length > 2);

        if (words1.length === 0 || words2.length === 0) return 0;

        const commonWords = words1.filter((word) => words2.includes(word));
        return commonWords.length / Math.max(words1.length, words2.length);
      };

      // Verificar similaridade com texto extraído
      for (const meme of allMemes) {
        const memeText = meme.ocr_text;
        if (memeText) {
          const similarity = calculateSimilarity(extractedText, memeText);

          // Se similaridade maior que 80%, considerar duplicado
          if (similarity > 0.8) {
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error("Erro ao verificar duplicados por OCR:", error);
      return false;
    }
  };

  const uploadMeme = async (
    file: File,
    title: string,
    description: string,
    categoryId: string, // Mudança: receber category_id em vez de category name
    tags: string[] = []
  ): Promise<UploadResult> => {
    if (!isSupabaseConfigured || !supabase) {
      return { success: false, message: "Supabase não configurado" };
    }

    try {
      // 1. Extrair texto da imagem usando OCR
      toast.loading("Analisando imagem...", { id: "upload" });
      const extractedText = await extractText(file);

      // 2. Verificar duplicados por OCR
      if (extractedText) {
        toast.loading("Verificando duplicados...", { id: "upload" });
        const isDuplicate = await checkDuplicateByOCR(extractedText);

        if (isDuplicate) {
          toast.error("Este meme parece ser um duplicado!", { id: "upload" });
          return {
            success: false,
            message:
              "Meme duplicado detectado pelo sistema OCR. Tente enviar outro meme.",
          };
        }
      }

      // 3. Upload da imagem
      toast.loading("Enviando imagem...", { id: "upload" });
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `memes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("memes")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 4. Obter URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("memes").getPublicUrl(filePath);

      // 5. Inserir na tabela memes com status pending
      toast.loading("Salvando meme para aprovação...", { id: "upload" });

      // Determinar se é upload anônimo ou autenticado
      const isAnonymous = !user?.id;

      // Buscar o perfil do usuário se estiver autenticado
      let uploaderName = "Anônimo";
      if (!isAnonymous && user?.id) {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", user.id)
            .single();

          uploaderName = profileData?.username || "Usuário";
        } catch (error) {
          console.warn("Erro ao buscar perfil:", error);
          uploaderName = "Usuário";
        }
      }

      const { data, error } = await supabase
        .from("memes")
        .insert({
          title,
          description,
          image_url: publicUrl,
          image_path: filePath,
          category_id: categoryId, // Usar category_id correto
          uploaded_by: user?.id || null, // null para uploads anônimos
          ocr_text: extractedText, // Usar ocr_text correto
          status: "pending", // Status pendente para aprovação
          view_count: 0,
          download_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      const successMessage = isAnonymous
        ? "Meme enviado para aprovação como anônimo! Aguarde a aprovação de um moderador."
        : `Meme enviado para aprovação por ${uploaderName}! Aguarde a aprovação de um moderador.`;

      toast.success("Meme enviado para aprovação!", { id: "upload" });
      return {
        success: true,
        message: successMessage,
        id: data.id,
      };
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast.error("Erro ao enviar meme", { id: "upload" });
      return { success: false, message: "Erro ao enviar meme" };
    }
  };

  const toggleFavorite = async (memeId: string) => {
    const isFavorited = favorites.includes(memeId);

    // Sempre salvar no localStorage primeiro
    const newFavorites = isFavorited
      ? favorites.filter((id) => id !== memeId)
      : [...favorites, memeId];

    setFavorites(newFavorites);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));

    // Se usuário logado, tentar salvar no Supabase também
    if (user && isSupabaseConfigured && supabase) {
      try {
        if (isFavorited) {
          await supabase
            .from("user_favorites")
            .delete()
            .eq("meme_id", memeId)
            .eq("user_id", user.id);
        } else {
          await supabase.from("user_favorites").insert({
            meme_id: memeId,
            user_id: user.id,
          });
        }
      } catch (error) {
        console.error("Erro ao salvar favorito no Supabase:", error);
      }
    }

    toast.success(
      isFavorited
        ? "Removido dos favoritos"
        : user
        ? "Adicionado aos favoritos"
        : "Adicionado aos favoritos (local)"
    );
  };

  const downloadMeme = async (meme: Meme) => {
    try {
      // Registrar download no Supabase se possível
      if (isSupabaseConfigured && supabase) {
        await supabase.from("meme_downloads").insert({
          meme_id: meme.id,
          user_id: user?.id || null,
          ip_address: "127.0.0.1",
        });
      }

      // Fazer download da imagem
      const response = await fetch(meme.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${(meme.title || "meme")
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

  const shareMeme = async (meme: Meme) => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.from("meme_shares").insert({
          meme_id: meme.id,
          user_id: user?.id || null,
        });
      }
    } catch (error) {
      console.error("Erro ao registrar compartilhamento:", error);
    }
  };

  const searchMemes = async (
    query: string,
    category?: string
  ): Promise<Meme[]> => {
    if (!isSupabaseConfigured || !supabase) return [];

    try {
      let queryBuilder = supabase
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
          ocr_text
        `
        )
        .eq("status", "approved");

      // Filtrar por categoria se especificada
      if (category && category !== "Todas") {
        // Buscar o ID da categoria pelo nome
        const { data: categoryData } = await supabase
          .from("categories")
          .select("id")
          .eq("name", category)
          .single();

        if (categoryData) {
          queryBuilder = queryBuilder.eq("category_id", categoryData.id);
        }
      }

      // Buscar por texto se fornecido
      if (query.trim()) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,description.ilike.%${query}%,ocr_text.ilike.%${query}%`
        );
      }

      const { data, error } = await queryBuilder
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      // Buscar informações das categorias separadamente
      if (data && data.length > 0) {
        const { data: categoriesData } = await supabase
          .from("categories")
          .select("id, name");

        // Buscar contagem de likes para cada meme
        const memeIds = data.map((m) => m.id);
        let likeCounts: Record<string, number> = {};

        if (memeIds.length > 0) {
          const { data: likesData, error: likesError } = await supabase
            .from("user_favorites")
            .select("meme_id")
            .in("meme_id", memeIds);

          if (!likesError && likesData) {
            // Contar likes por meme
            likeCounts = likesData.reduce((acc, like) => {
              acc[like.meme_id] = (acc[like.meme_id] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
          }
        }

        // Transformar dados para incluir category como string
        const transformedMemes = data.map((meme) => {
          const category = categoriesData?.find(
            (c) => c.id === meme.category_id
          );
          return {
            ...meme,
            category: category?.name || "Sem categoria",
            view_count: meme.view_count || 0,
            download_count: meme.download_count || 0,
            like_count: likeCounts[meme.id] || 0,
          };
        });

        return transformedMemes;
      }

      return [];
    } catch (error) {
      console.error("Erro na busca:", error);
      return [];
    }
  };

  // UseEffect otimizado - executar apenas uma vez
  useEffect(() => {
    loadMemes();
    loadFavorites();
  }, []); // Array vazio - só executa uma vez

  return {
    memes,
    loading,
    error,
    favorites,
    toggleFavorite,
    downloadMeme,
    shareMeme,
    uploadMeme,
    searchMemes,
    isBackendConfigured: isSupabaseConfigured,
    refresh: loadMemes,
  };
}
