import { useState, useEffect, useCallback } from "react";
import { apiGet } from "../lib/api";

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
    try {
      setError(null);
      const data = await apiGet<Category[]>("/api/categories");
      setCategories(data);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
      setError(
        `Erro ao carregar categorias: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      await loadAllCategories();
      if (isMounted) {
        setLoading(false);
      }
    };

    loadData();

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
