import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface Stats {
  totalMemes: number;
  totalDownloads: number;
  totalUsers: number;
  totalFavorites: number;
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
  });

  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase não configurado");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log("Carregando estatísticas do Supabase...");

      // Buscar estatísticas reais do banco
      const [memesResult, usersResult, downloadsResult, favoritesResult] =
        await Promise.all([
          supabase
            .from("memes")
            .select("id", { count: "exact", head: true })
            .eq("status", "approved"),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("meme_downloads")
            .select("id", { count: "exact", head: true }),
          supabase
            .from("user_favorites")
            .select("id", { count: "exact", head: true }),
        ]);

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
  };

  const loadCategories = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase não configurado");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log("Carregando categorias do Supabase...");

      // Buscar categorias do banco de dados
      const { data: categoriesData, error } = await supabase
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
            const { count, error: countError } = await supabase
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

      console.log("Categorias processadas:", categoriesWithCount);
      setCategories(categoriesWithCount);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      setError(`Erro ao carregar categorias: ${error.message}`);
      setCategories([]);
    }
  };

  // Carregamento inicial
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      console.log("Iniciando carregamento de dados...");
      await Promise.all([loadStats(), loadCategories()]);

      setLoading(false);
      console.log("Carregamento de dados concluído");
    };

    loadData();
  }, []); // Sem dependências para evitar loops

  return {
    stats,
    categories,
    loading,
    error,
    refreshStats: loadStats,
    refreshCategories: loadCategories,
    refresh: async () => {
      setLoading(true);
      setError(null);
      await Promise.all([loadStats(), loadCategories()]);
      setLoading(false);
    },
  };
}
