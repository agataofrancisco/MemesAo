import { useState, useEffect } from "react";

export function useStats() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔍 useStats: Hook iniciando");

  useEffect(() => {
    console.log("🔍 useStats: useEffect executando");

    // Por enquanto, vamos simular categorias vazias
    console.log("🔍 useStats: Definindo categorias vazias");
    setCategories([]);
    setLoading(false);

      // Buscar categorias do banco de dados
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (categoriesError) {
        console.error(
          "🔍 useStats: Erro ao buscar categorias:",
          categoriesError
        );
        throw categoriesError;
      }

      console.log(
        "🔍 useStats: Categorias encontradas:",
        categoriesData?.length || 0
      );

      if (!categoriesData || categoriesData.length === 0) {
        console.log("🔍 useStats: Nenhuma categoria encontrada no banco");
        setCategories([]);
        setLoading(false);
        return;
      }

      // Para cada categoria, contar memes aprovados
      console.log("🔍 useStats: Contando memes por categoria...");
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
                `🔍 useStats: Erro ao contar memes da categoria ${category.name}:`,
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
              `🔍 useStats: Erro ao processar categoria ${category.name}:`,
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
        .filter((category) => category.count > 0)
        .sort((a, b) => b.count - a.count);

      console.log(
        "🔍 useStats: Todas as categorias processadas:",
        allCategories
      );
      setCategories(allCategories);
      setLoading(false);
    } catch (error) {
      console.error("🔍 useStats: Erro ao carregar categorias:", error);
      setError(error instanceof Error ? error.message : String(error));
      setCategories([]);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("🔍 useStats: useEffect executando");
    loadCategories();
  }, [loadCategories]);

  console.log("🔍 useStats: Estado atual:", {
    categoriesLength: categories.length,
    loading,
    error,
  });

  return {
    categories,
    loading,
    error,
    refresh: loadCategories,
  };
}
