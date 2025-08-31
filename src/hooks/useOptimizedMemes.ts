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

  // Garantir que memes seja sempre um array
  const safeMemes = memes || [];

  // Por enquanto, vamos retornar todos os memes sem paginação
  // para identificar o problema
  const visibleMemes = safeMemes;
  const hasMore = false;
  const loadingMore = false;
  const currentPage = 1;

  // Funções simplificadas
  const loadMore = useCallback(async () => {
    console.log("loadMore chamado (desabilitado temporariamente)");
  }, []);

  const resetToFirstPage = useCallback(() => {
    console.log("resetToFirstPage chamado (desabilitado temporariamente)");
  }, []);

  const filterByCategory = useCallback((category: string) => {
    console.log("filterByCategory chamado:", category);
  }, []);

  const searchMemes = useCallback((query: string) => {
    console.log("searchMemes chamado:", query);
  }, []);

  const clearCache = useCallback(() => {
    console.log("clearCache chamado");
  }, []);

  const getCachedMeme = useCallback(
    (id: string) => {
      return safeMemes.find((m) => m.id === id);
    },
    [safeMemes]
  );

  const performanceStats = useMemo(
    () => ({
      totalMemes: safeMemes.length,
      visibleCount: visibleMemes.length,
      currentPage,
      hasMore,
      cacheSize: 0,
      loadingMore,
    }),
    [safeMemes.length, visibleMemes.length, currentPage, hasMore, loadingMore]
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
