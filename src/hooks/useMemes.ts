import { useState, useEffect, useCallback } from "react";

export function useMemes() {
  const [memes, setMemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔍 useMemes: Hook iniciando");

  const loadMemes = useCallback(async () => {
    console.log("🔍 useMemes: loadMemes iniciado");

    try {
      setError(null);
      console.log("🔍 useMemes: Simulando carregamento de memes...");

      // Por enquanto, vamos simular memes vazios
      console.log("🔍 useMemes: Definindo memes vazios");
      setMemes([]);
      setLoading(false);
      console.log(
        "🔍 useMemes: Memes definidos no estado, loading definido como false"
      );
    } catch (error) {
      console.error("🔍 useMemes: Erro ao carregar memes:", error);
      setError(error instanceof Error ? error.message : String(error));
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    console.log("🔍 useMemes: useEffect executando...");
    loadMemes();
  }, [loadMemes]);

  console.log("🔍 useMemes: Estado atual:", {
    memesLength: memes.length,
    loading,
    error,
  });

  return {
    memes,
    loading,
    error,
    refresh: loadMemes,
  };
}
