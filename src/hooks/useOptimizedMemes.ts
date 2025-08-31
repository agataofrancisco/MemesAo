import { useState, useEffect, useCallback } from "react";
import { useMemes } from "./useMemes";

export function useOptimizedMemes() {
  console.log("🔍 useOptimizedMemes: Hook iniciando");

  const { memes, loading, error } = useMemes();

  console.log("🔍 useOptimizedMemes: Dados do useMemes:", {
    memesLength: memes?.length || 0,
    loading,
    error,
  });

  // Por enquanto, vamos retornar os dados diretamente do useMemes
  const safeMemes = memes || [];

  console.log("🔍 useOptimizedMemes: Retornando dados:", {
    memesLength: safeMemes.length,
    loading,
    error,
    hasMore: false,
    loadingMore: false,
  });

  return {
    memes: safeMemes,
    loading,
    error,
    hasMore: false,
    loadingMore: false,
  };
}
