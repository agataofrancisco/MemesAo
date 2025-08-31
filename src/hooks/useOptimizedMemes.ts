import { useState, useEffect, useCallback } from "react";

export function useOptimizedMemes() {
  console.log("🔍 useOptimizedMemes: Hook iniciando");

  const [memes, setMemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔍 useOptimizedMemes: Estados iniciais:", {
    memes,
    loading,
    error,
  });

  // Por enquanto, vamos simular dados vazios
  useEffect(() => {
    console.log("🔍 useOptimizedMemes: useEffect executando");

    // Simular dados vazios
    setMemes([]);
    setLoading(false);
    setError(null);

    console.log("🔍 useOptimizedMemes: Estados definidos");
  }, []);

  console.log("🔍 useOptimizedMemes: Retornando dados:", {
    memesLength: memes.length,
    loading,
    error,
    hasMore: false,
    loadingMore: false,
  });

  return {
    memes,
    loading,
    error,
    hasMore: false,
    loadingMore: false,
    refresh,
  };
}
