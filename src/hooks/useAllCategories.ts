import { useState, useEffect, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

export function useAllCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllCategories = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setError("Supabase não configurado");
      return;
    }

    try {
      setError(null);
      console.log("Carregando todas as categorias do Supabase...");

      // Buscar TODAS as categorias, não apenas as top 3
      const { data: categoriesData, error } = await supabase
        .from("categories")
        .select("*")
        .order("name"); // Ordenar alfabeticamente

      if (error) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
      }

      console.log(
        "Todas as categorias encontradas:",
        categoriesData?.length || 0
      );

      if (!categoriesData || categoriesData.length === 0) {
        console.log("Nenhuma categoria encontrada no banco");
        setCategories([]);
        return;
      }

      // Mapear para o formato esperado
      const formattedCategories = categoriesData.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description || `Categoria ${category.name}`,
        icon: category.icon || "Tag",
        color: category.color || "from-gray-500 to-gray-600",
      }));

      console.log("Categorias formatadas:", formattedCategories.length);
      setCategories(formattedCategories);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      setError(
        `Erro ao carregar categorias: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setCategories([]);
    }
  }, []);

  // Carregamento inicial - executar apenas uma vez
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      console.log("Iniciando carregamento de todas as categorias...");
      await loadAllCategories();

      if (isMounted) {
        setLoading(false);
        console.log("Carregamento de todas as categorias concluído");
      }
    };

    loadData();

    // Cleanup para evitar updates após unmount
    return () => {
      isMounted = false;
    };
  }, [loadAllCategories]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    await loadAllCategories();
    setLoading(false);
  }, [loadAllCategories]);

  return {
    categories,
    loading,
    error,
    refresh,
  };
}
