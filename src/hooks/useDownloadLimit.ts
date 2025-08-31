import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

const DOWNLOAD_LIMIT_KEY = "meme_download_count";
const DOWNLOAD_LIMIT_RESET_KEY = "meme_download_reset";
const MAX_DOWNLOADS_ANONYMOUS = 3;
const DOWNLOAD_RESET_HOURS = 24;

export function useDownloadLimit() {
  const { user } = useAuth();
  const [downloadCount, setDownloadCount] = useState(0);
  const [canDownload, setCanDownload] = useState(true);

  // Carregar contador de downloads do localStorage
  useEffect(() => {
    if (user) {
      // Usuário logado pode baixar ilimitado
      setCanDownload(true);
      setDownloadCount(0);
      return;
    }

    const savedCount = localStorage.getItem(DOWNLOAD_LIMIT_KEY);
    const savedReset = localStorage.getItem(DOWNLOAD_LIMIT_RESET_KEY);

    if (savedCount && savedReset) {
      const count = parseInt(savedCount, 10);
      const resetTime = parseInt(savedReset, 10);
      const now = Date.now();

      // Verificar se já passou 24h para resetar o contador
      if (now - resetTime > DOWNLOAD_RESET_HOURS * 60 * 60 * 1000) {
        // Resetar contador
        localStorage.setItem(DOWNLOAD_LIMIT_KEY, "0");
        localStorage.setItem(DOWNLOAD_LIMIT_RESET_KEY, now.toString());
        setDownloadCount(0);
        setCanDownload(true);
      } else {
        // Usar contador salvo
        setDownloadCount(count);
        setCanDownload(count < MAX_DOWNLOADS_ANONYMOUS);
      }
    } else {
      // Primeira vez - inicializar
      const now = Date.now();
      localStorage.setItem(DOWNLOAD_LIMIT_KEY, "0");
      localStorage.setItem(DOWNLOAD_LIMIT_RESET_KEY, now.toString());
      setDownloadCount(0);
      setCanDownload(true);
    }
  }, [user]);

  // Função para registrar um download
  const registerDownload = useCallback(() => {
    if (user) {
      // Usuário logado - sem limite
      return true;
    }

    if (!canDownload) {
      return false;
    }

    const newCount = downloadCount + 1;
    setDownloadCount(newCount);
    localStorage.setItem(DOWNLOAD_LIMIT_KEY, newCount.toString());

    if (newCount >= MAX_DOWNLOADS_ANONYMOUS) {
      setCanDownload(false);
    }

    return true;
  }, [user, canDownload, downloadCount]);

  // Função para verificar se pode baixar
  const checkCanDownload = useCallback(() => {
    if (user) return true;
    return canDownload;
  }, [user, canDownload]);

  // Função para obter informações do limite
  const getDownloadInfo = useCallback(() => {
    if (user) {
      return {
        canDownload: true,
        remaining: -1, // -1 significa ilimitado
        total: -1,
        isAnonymous: false,
      };
    }

    return {
      canDownload,
      remaining: Math.max(0, MAX_DOWNLOADS_ANONYMOUS - downloadCount),
      total: MAX_DOWNLOADS_ANONYMOUS,
      isAnonymous: true,
    };
  }, [user, canDownload, downloadCount]);

  // Função para resetar contador (útil para testes)
  const resetDownloadCount = useCallback(() => {
    if (user) return;

    localStorage.setItem(DOWNLOAD_LIMIT_KEY, "0");
    const now = Date.now();
    localStorage.setItem(DOWNLOAD_LIMIT_RESET_KEY, now.toString());
    setDownloadCount(0);
    setCanDownload(true);
  }, [user]);

  return {
    canDownload: checkCanDownload(),
    downloadCount,
    registerDownload,
    getDownloadInfo,
    resetDownloadCount,
    isAnonymous: !user,
    maxDownloads: MAX_DOWNLOADS_ANONYMOUS,
  };
}
