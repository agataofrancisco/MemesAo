import { useState, useEffect, useCallback } from "react";
import { apiGet } from "../lib/api";
import { useAuth } from "./useAuth";

export interface Stats {
  totalMemes: number;
  totalDownloads: number;
  totalUsers: number;
  totalFavorites: number;
  userDownloads: number;
  userFavorites: number;
  userShares: number;
  userMemes: number;
}

export interface CategoryStats {
  id: string;
  name: string;
  count: number;
  icon: string;
  color: string;
  description: string;
}

export function useStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalMemes: 0,
    totalDownloads: 0,
    totalUsers: 0,
    totalFavorites: 0,
    userDownloads: 0,
    userFavorites: 0,
    userShares: 0,
    userMemes: 0,
  });
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setError(null);
      const data = await apiGet<Stats>("/api/stats");
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
      setError(
        `Erro ao carregar estatísticas: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setError(null);
      const data = await apiGet<CategoryStats[]>("/api/categories");
      setCategories(
        data
          .filter((category) => category.count > 0)
          .sort((a, b) => b.count - a.count)
      );
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
      await Promise.all([loadStats(), loadCategories()]);
      if (isMounted) {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user, loadStats, loadCategories]);

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
