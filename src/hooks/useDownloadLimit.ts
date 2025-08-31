import { useState, useEffect } from "react";

export function useDownloadLimit() {
  const [downloadCount, setDownloadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  console.log("🔍 useDownloadLimit: Hook iniciando");

  useEffect(() => {
    console.log("🔍 useDownloadLimit: useEffect executando");

    // Por enquanto, vamos simular um usuário anônimo com 0 downloads
    console.log("🔍 useDownloadLimit: Definindo downloadCount como 0");
    setDownloadCount(0);
    setLoading(false);

    // TODO: Implementar lógica real de limite de downloads
  }, []);

  const canDownload = downloadCount < 3;
  const registerDownload = () => {
    console.log("🔍 useDownloadLimit: registerDownload chamado");
    setDownloadCount((prev) => prev + 1);
  };

  console.log("🔍 useDownloadLimit: Estado atual:", {
    downloadCount,
    canDownload,
    loading,
  });

  return {
    canDownload,
    registerDownload,
    downloadCount,
    loading,
  };
}
