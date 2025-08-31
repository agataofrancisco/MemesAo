import { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

export function useStats() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔍 useStats: Hook iniciando");

  useEffect(() => {
    console.log("🔍 useStats: useEffect executando");

    if (!isSupabaseConfigured || !supabase) {
      console.log("🔍 useStats: Supabase não configurado");
      setLoading(false);
      return;
    }

    // Por enquanto, vamos simular categorias vazias
    console.log("🔍 useStats: Definindo categorias vazias");
    setCategories([]);
    setLoading(false);

    // TODO: Implementar carregamento real de categorias
  }, []);

  console.log("🔍 useStats: Estado atual:", {
    categoriesLength: categories.length,
    loading,
    error,
  });

  return {
    categories,
    loading,
    error,
  };
}
