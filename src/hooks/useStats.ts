import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { useAuth } from "./useAuth";

interface Stats {
  totalMemes: number;
  totalDownloads: number;
  totalUsers: number;
  totalFavorites: number;
  userDownloads: number;
  userFavorites: number;
  userShares: number;
}

interface CategoryStats {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
  description: string;
}

export function useStats() {
  const [stats, setStats] = useState<Stats>({
    totalMemes: 0,
    totalDownloads: 0,
    totalUsers: 0,
    totalFavorites: 0,
    userDownloads: 0,
    userFavorites: 0,
    userShares: 0,
  });

  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadStats = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase não configurado");
      return;
    }

    try {
      setError(null);
      console.log("Carregando estatísticas do Supabase...");

      // Buscar estatísticas reais do banco (globais)
      const [memesResult, usersResult, downloadsResult, favoritesResult] = await Promise.all([
        supabase
          .from("memes")
          .select("id", { count: "exact", head: true })
          .eq("status", "approved"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("meme_downloads").select("id", { count: "exact", head: true }),
        supabase.from("user_favorites").select("id", { count: "exact", head: true }),
      ]);

      // Buscar estatísticas do usuário (se logado)
      let userDownloadsCount = 0;
      let userFavoritesCount = 0;
      let userSharesCount = 0;
      if (user) {
        const [userDownloadsResult, userFavoritesResult, userSharesResult] = await Promise.all([
          supabase
            .from("meme_downloads")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("user_favorites")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
          supabase
            .from("meme_shares")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id),
        ]);
        if (!userDownloadsResult.error) userDownloadsCount = userDownloadsResult.count || 0;
        if (!userFavoritesResult.error) userFavoritesCount = userFavoritesResult.count || 0;
        if (!userSharesResult.error) userSharesCount = userSharesResult.count || 0;
      }

      // Verificar se houve erros
      if (memesResult.error) throw memesResult.error;
      if (usersResult.error) throw usersResult.error;
      if (downloadsResult.error) throw downloadsResult.error;
      if (favoritesResult.error) throw favoritesResult.error;

      const newStats = {
        totalMemes: memesResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalDownloads: downloadsResult.count || 0,
        totalFavorites: favoritesResult.count || 0,
        userDownloads: userDownloadsCount,
        userFavorites: userFavoritesCount,
        userShares: userSharesCount,
      };

      console.log("Estatísticas carregadas:", newStats);
      setStats(newStats);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      setError(
        `Erro ao carregar estatísticas: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }, []); // Sem dependências para evitar loops

  const loadCategories = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase não configurado");
      return;
    }

    try {
      setError(null);
      console.log("Carregando categorias do Supabase...");

      // Buscar categorias do banco de dados
      const { data: categoriesData, error } = await supabase!
        .from("categories")
        .select("*")
        .order("name");

      if (error) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
      }

      console.log("Categorias encontradas:", categoriesData?.length || 0);

      if (!categoriesData || categoriesData.length === 0) {
        console.log("Nenhuma categoria encontrada no banco");
        setCategories([]);
        return;
      }

      // Para cada categoria, contar memes aprovados
      console.log("Contando memes por categoria...");
      const categoriesWithCount = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            const { count, error: countError } = await supabase!
              .from("memes")
              .select("*", { count: "exact", head: true })
              .eq("category_id", category.id)
              .eq("status", "approved");

            if (countError) {
              console.error(
                `Erro ao contar memes da categoria ${category.name}:`,
                countError
              );
              return {
                id: category.id,
                name: category.name,
                count: 0,
                icon: category.icon || "Tag",
                color: category.color || "from-gray-500 to-gray-600",
                description:
                  category.description || `Categoria ${category.name}`,
              };
            }

            return {
              id: category.id,
              name: category.name,
              count: count || 0,
              icon: category.icon || "Tag",
              color: category.color || "from-gray-500 to-gray-600",
              description: category.description || `Categoria ${category.name}`,
            };
          } catch (error) {
            console.error(
              `Erro ao processar categoria ${category.name}:`,
              error
            );
            return {
              id: category.id,
              name: category.name,
              count: 0,
              icon: category.icon || "Tag",
              color: category.color || "from-gray-500 to-gray-600",
              description: category.description || `Categoria ${category.name}`,
            };
          }
        })
      );

      // Filtrar apenas categorias com memes e ordenar por quantidade
      const allCategories = categoriesWithCount
        .filter((category) => category.count > 0) // Só categorias com memes
        .sort((a, b) => b.count - a.count); // Ordenar por quantidade decrescente

      console.log("Todas as categorias processadas:", allCategories);
      setCategories(allCategories);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      setError(
        `Erro ao carregar categorias: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setCategories([]);
    }
  }, []); // Sem dependências para evitar loops

  // Carregamento inicial - executar apenas uma vez
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      console.log("Iniciando carregamento de dados...");
      await Promise.all([loadStats(), loadCategories()]);

      if (isMounted) {
        setLoading(false);
        console.log("Carregamento de dados concluído");
      }
    };

    loadData();

    // Cleanup para evitar updates após unmount
    return () => {
      isMounted = false;
    };
  }, []); // Array vazio - só executa uma vez

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([loadStats(), loadCategories()]);
    setLoading(false);
  }, [loadStats, loadCategories]);

  return {
    stats,
    categories,
    loading,
    error,
    refreshStats: loadStats,
    refreshCategories: loadCategories,
    refresh,
  };
}
