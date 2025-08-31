import { useState, useEffect, useCallback, useMemo } from "react";
import { useMemes } from "./useMemes";
import { getOptimizedConfig, throttle } from "../config/performance";

interface UseOptimizedMemesOptions {
  pageSize?: number;
  preloadDistance?: number;
  enableVirtualization?: boolean;
}

export function useOptimizedMemes(options: UseOptimizedMemesOptions = {}) {
  const config = getOptimizedConfig();
  const {
    pageSize = config.PAGINATION.ITEMS_PER_PAGE,
    preloadDistance = config.PAGINATION.PRELOAD_DISTANCE,
    enableVirtualization = false,
  } = options;

  const {
    memes,
    loading,
    error,
    toggleFavorite,
    favorites,
    shareMeme,
    downloadMeme,
  } = useMemes();

  // Debug logs
  console.log("useOptimizedMemes:", {
    memesLength: memes?.length || 0,
    loading,
    error,
    pageSize,
    preloadDistance,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [visibleMemes, setVisibleMemes] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [memeCache, setMemeCache] = useState<Map<string, any>>(new Map());

  // Garantir que memes seja sempre um array
  const safeMemes = memes || [];

  // Calcular memes visíveis baseado na página atual
  const getVisibleMemes = useCallback(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return safeMemes.slice(startIndex, endIndex);
  }, [safeMemes, currentPage, pageSize]);

  // Carregar mais memes
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    // Simular delay de carregamento
    await new Promise((resolve) =>
      setTimeout(resolve, config.PAGINATION.LOAD_DELAY)
    );

    setCurrentPage((prev) => prev + 1);
    setLoadingMore(false);
  }, [loadingMore, hasMore]);

  // Carregar memes automaticamente quando chegar perto do fim
  const handleScroll = useCallback(() => {
    if (enableVirtualization) return;

    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (documentHeight - scrollPosition < preloadDistance) {
      loadMore();
    }
  }, [loadMore, preloadDistance, enableVirtualization]);

  // Adicionar listener de scroll com throttle
  useEffect(() => {
    if (!enableVirtualization) {
      const throttledScroll = throttle(
        handleScroll,
        config.SCROLL.THROTTLE_DELAY
      );
      window.addEventListener("scroll", throttledScroll, {
        passive: config.SCROLL.PASSIVE,
      });
      return () => window.removeEventListener("scroll", throttledScroll);
    }
  }, [
    handleScroll,
    enableVirtualization,
    config.SCROLL.THROTTLE_DELAY,
    config.SCROLL.PASSIVE,
  ]);

  // Atualizar memes visíveis quando mudar página ou memes
  useEffect(() => {
    const visible = getVisibleMemes();
    setVisibleMemes(visible);
    setHasMore(visible.length < safeMemes.length);
  }, [getVisibleMemes, safeMemes.length]);

  // Cache de memes para melhor performance
  const getCachedMeme = useCallback(
    (id: string) => {
      if (memeCache.has(id)) {
        return memeCache.get(id);
      }

      const meme = safeMemes.find((m) => m.id === id);
      if (meme) {
        setMemeCache((prev) => {
          const newCache = new Map(prev);
          // Limpar cache se exceder o tamanho máximo
          if (newCache.size >= config.CACHE.MAX_MEME_CACHE_SIZE) {
            const firstKey = newCache.keys().next().value;
            newCache.delete(firstKey);
          }
          newCache.set(id, meme);
          return newCache;
        });
      }

      return meme;
    },
    [safeMemes, memeCache, config.CACHE.MAX_MEME_CACHE_SIZE]
  );

  // Limpar cache quando necessário
  const clearCache = useCallback(() => {
    setMemeCache(new Map());
  }, []);

  // Reset para primeira página
  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
    setVisibleMemes([]);
    setHasMore(true);
  }, []);

  // Filtrar memes por categoria
  const filterByCategory = useCallback(
    (category: string) => {
      const filtered = safeMemes.filter((meme) => meme.category === category);
      setVisibleMemes(filtered.slice(0, pageSize));
      setHasMore(filtered.length > pageSize);
      setCurrentPage(1);
    },
    [safeMemes, pageSize]
  );

  // Buscar memes por texto
  const searchMemes = useCallback(
    (query: string) => {
      if (!query.trim()) {
        resetToFirstPage();
        return;
      }

      const searchResults = safeMemes.filter(
        (meme) =>
          meme.title?.toLowerCase().includes(query.toLowerCase()) ||
          meme.category?.toLowerCase().includes(query.toLowerCase())
      );

      setVisibleMemes(searchResults.slice(0, pageSize));
      setHasMore(searchResults.length > pageSize);
      setCurrentPage(1);
    },
    [safeMemes, pageSize, resetToFirstPage]
  );

  // Estatísticas de performance
  const performanceStats = useMemo(
    () => ({
      totalMemes: safeMemes.length,
      visibleCount: visibleMemes.length,
      currentPage,
      hasMore,
      cacheSize: memeCache.size,
      loadingMore,
    }),
    [
      safeMemes.length,
      visibleMemes.length,
      currentPage,
      hasMore,
      memeCache.size,
      loadingMore,
    ]
  );

  return {
    // Dados
    memes: visibleMemes,
    allMemes: safeMemes,
    loading,
    error,
    loadingMore,
    hasMore,

    // Ações
    loadMore,
    resetToFirstPage,
    filterByCategory,
    searchMemes,
    clearCache,

    // Funções do useMemes
    toggleFavorite,
    favorites,
    shareMeme,
    downloadMeme,

    // Utilitários
    getCachedMeme,
    performanceStats,
  };
}
