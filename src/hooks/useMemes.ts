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

  // Debug logs
  console.log("useMemes estado atual:", {
    memesLength: memes.length,
    loading,
    error,
    user: !!user,
  });

  const loadMemes = useCallback(async () => {
    console.log("loadMemes iniciado");
    if (!isSupabaseConfigured || !supabase) {
      console.log("Supabase não configurado");
      setError("Supabase não configurado");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log("Carregando memes do Supabase...");
      console.log("URL do Supabase:", supabase.supabaseUrl);
      console.log("Status da configuração:", isSupabaseConfigured);

      // Verificar se conseguimos acessar a tabela
      console.log("Testando acesso à tabela memes...");

      try {
        // Query mais básica possível
        const { data: basicTest, error: basicError } = await supabase
          .from("memes")
          .select("count", { count: "exact", head: true });

        console.log("Teste básico de contagem:", { basicTest, basicError });
      } catch (basicTestError) {
        console.error("Erro no teste básico:", basicTestError);
      }

      // Query simplificada - buscar apenas memes aprovados
      console.log("Executando query para buscar memes...");

      // Primeiro, vamos tentar uma query mais simples para testar
      const { data: testData, error: testError } = await supabase
        .from("memes")
        .select("id, title")
        .limit(5);

      console.log("Query de teste:", { testData, testError });

      // Agora a query principal
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
        .order("created_at", { ascending: false })
        .limit(100);

      console.log("Query principal executada, resultado:", {
        memesData,
        memesError,
      });

      // Se não houver memes aprovados, vamos ver todos os memes
      if (!memesData || memesData.length === 0) {
        console.log(
          "Nenhum meme encontrado, tentando buscar todos os memes..."
        );

        const { data: allMemes, error: allMemesError } = await supabase
          .from("memes")
          .select("id, title, status")
          .limit(10);

        console.log("Todos os memes:", { allMemes, allMemesError });

        if (allMemes && allMemes.length > 0) {
          console.log(
            "Status dos memes encontrados:",
            allMemes.map((m) => ({
              id: m.id,
              title: m.title,
              status: m.status,
            }))
          );
        }
      }

      console.log("Query executada, resultado:", { memesData, memesError });

      if (memesError) {
        console.error("Erro ao buscar memes:", memesError);
        throw memesError;
      }

      console.log(`Encontrados ${memesData?.length || 0} memes`);
      console.log("Primeiros memes:", memesData?.slice(0, 3));

      if (!memesData || memesData.length === 0) {
        console.log("Nenhum meme encontrado no banco");
        console.log("Verificando se a tabela memes existe...");

        // Verificar se a tabela existe
        const { data: tableCheck, error: tableError } = await supabase
          .from("memes")
          .select("id")
          .limit(1);

        console.log("Verificação da tabela:", { tableCheck, tableError });

        setMemes([]);
        setLoading(false);
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
      console.log("Memes definidos no estado, loading definido como false");
    } catch (error) {
      console.error("Erro ao carregar memes:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(`Erro ao carregar memes: ${errorMessage}`);
      toast.error("Erro ao carregar memes");
      setMemes([]);
    } finally {
      setLoading(false);
      console.log("loadMemes finalizado, loading definido como false");
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
    categoryId: string, // Categoria principal (compatibilidade)
    tags: string[] = [],
    allCategories: string[] = [] // Array de todas as categorias
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
              "Meme duplicado detectado pelo sistema OCR. Tente Publicar outro meme.",
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
          category_id: categoryId, // Categoria principal (compatibilidade)
          uploaded_by: user?.id || null, // null para uploads anônimos
          ocr_text: extractedText, // Usar ocr_text correto
          status: "pending", // Status pendente para aprovação
          view_count: 0,
          download_count: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Inserir multi-categorias se fornecidas
      if (allCategories.length > 1) {
        try {
          const categoryInserts = allCategories.map((catId) => ({
            meme_id: data.id,
            category_id: catId,
          }));

          const { error: categoriesError } = await supabase
            .from("meme_categories")
            .insert(categoryInserts);

          if (categoriesError) {
            console.warn(
              "Erro ao inserir categorias adicionais:",
              categoriesError
            );
          }
        } catch (error) {
          console.warn("Erro ao inserir categorias adicionais:", error);
        }
      }

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
      toast.error("Erro ao Publicar meme", { id: "upload" });
      return { success: false, message: "Erro ao Publicar meme" };
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

  // Função para registrar download
  const registerDownload = async (memeId: string) => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      await supabase.from("meme_downloads").insert({
        meme_id: memeId,
        user_id: user?.id || null,
        ip_address: "127.0.0.1",
      });
    } catch (error) {
      console.error("Erro ao registrar download:", error);
    }
  };

  const downloadMeme = useCallback(async (meme: Meme) => {
    if (!meme.image_url) {
      toast.error("URL da imagem não encontrada");
      return;
    }

    try {
      // Criar canvas para adicionar watermark
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas não suportado");
      }

      // Carregar imagem
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        // Configurar dimensões do canvas
        canvas.width = img.width;
        canvas.height = img.height;

        // Desenhar a imagem original
        ctx.drawImage(img, 0, 0);

        // Configurar estilo do watermark
        ctx.font = `${Math.max(
          16,
          img.width * 0.03
        )}px Inter, Arial, sans-serif`;
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"; // Branco com 80% opacidade
        ctx.strokeStyle = "rgba(0, 0, 0, 0.6)"; // Preto com 60% opacidade
        ctx.lineWidth = 2;

        // Texto do watermark
        const watermarkText = "Baixado em memes.ao";

        // Posicionar no canto inferior direito
        const textMetrics = ctx.measureText(watermarkText);
        const padding = 20;
        const x = img.width - textMetrics.width - padding;
        const y = img.height - padding;

        // Desenhar outline (borda preta)
        ctx.strokeText(watermarkText, x, y);

        // Desenhar texto principal (branco)
        ctx.fillText(watermarkText, x, y);

        // Converter para blob e baixar
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${meme.title || "meme"}.jpg`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);

              // Registrar download no Supabase
              registerDownload(meme.id);
              toast.success("Meme baixado com sucesso!");
            }
          },
          "image/jpeg",
          0.9
        );
      };

      img.onerror = () => {
        // Fallback: baixar imagem original sem watermark
        const a = document.createElement("a");
        a.href = meme.image_url;
        a.download = `${meme.title || "meme"}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        registerDownload(meme.id);
        toast.success("Meme baixado com sucesso!");
      };

      img.src = meme.image_url;
    } catch (error) {
      console.error("Erro ao baixar meme:", error);
      toast.error("Erro ao baixar meme");
    }
  }, []);

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

  // Função para gerar URL específica do meme
  const getMemeShareUrl = (meme: Meme) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/meme/${meme.id}`;
  };

  // Função para partilhar com URL específica
  const shareMemeWithUrl = async (meme: Meme) => {
    const shareUrl = getMemeShareUrl(meme);

    if (navigator.share) {
      try {
        await navigator.share({
          title: meme.title || "Meme Engraçado",
          text: meme.description || "Olha esse meme!",
          url: shareUrl,
        });
        await shareMeme(meme);
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback para copiar URL
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link do meme copiado para área de transferência!");
        await shareMeme(meme);
      } catch (error) {
        toast.error("Erro ao copiar link");
      }
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

  // Função para atualizar estatísticas de um meme específico
  const updateMemeStats = useCallback(async (memeId: string) => {
    if (!isSupabaseConfigured || !supabase) return;

    try {
      // Buscar estatísticas atualizadas
      const { data: likesData, error: likesError } = await supabase
        .from("user_favorites")
        .select("meme_id")
        .eq("meme_id", memeId);

      const { data: downloadsData, error: downloadsError } = await supabase
        .from("meme_downloads")
        .select("meme_id")
        .eq("meme_id", memeId);

      const { data: sharesData, error: sharesError } = await supabase
        .from("meme_shares")
        .select("meme_id")
        .eq("meme_id", memeId);

      if (!likesError && !downloadsError && !sharesError) {
        const likeCount = likesData?.length || 0;
        const downloadCount = downloadsData?.length || 0;
        const shareCount = sharesData?.length || 0;

        // Atualizar o meme na lista local
        setMemes((prevMemes) =>
          prevMemes.map((meme) =>
            meme.id === memeId
              ? {
                  ...meme,
                  like_count: likeCount,
                  download_count: downloadCount,
                  share_count: shareCount,
                }
              : meme
          )
        );

        return { likeCount, downloadCount, shareCount };
      }
    } catch (error) {
      console.error("Erro ao atualizar estatísticas do meme:", error);
    }
  }, []);

  // Função para buscar um meme específico
  const getMemeById = useCallback(async (memeId: string) => {
    if (!isSupabaseConfigured || !supabase) return null;

    try {
      const { data, error } = await supabase
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
        .eq("id", memeId)
        .eq("status", "approved")
        .single();

      if (error) throw error;

      if (data) {
        // Buscar categoria
        const { data: categoryData } = await supabase
          .from("categories")
          .select("name")
          .eq("id", data.category_id)
          .single();

        // Buscar perfil do usuário
        const { data: profileData } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", data.uploaded_by)
          .single();

        // Buscar contagem de likes
        const { data: likesData } = await supabase
          .from("user_favorites")
          .select("meme_id")
          .eq("meme_id", memeId);

        const transformedMeme = {
          ...data,
          category: categoryData?.name || "Sem categoria",
          profile: profileData ? { username: profileData.username } : undefined,
          like_count: likesData?.length || 0,
          download_count: data.download_count || 0,
          share_count: 0, // Por enquanto
        };

        return transformedMeme;
      }
    } catch (error) {
      console.error("Erro ao buscar meme por ID:", error);
    }

    return null;
  }, []);

  // UseEffect otimizado - executar apenas uma vez
  useEffect(() => {
    console.log("useMemes useEffect executando...");
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
    shareMemeWithUrl,
    getMemeShareUrl,
    uploadMeme,
    searchMemes,
    isBackendConfigured: isSupabaseConfigured,
    refresh: loadMemes,
    updateMemeStats,
    getMemeById,
  };
}
