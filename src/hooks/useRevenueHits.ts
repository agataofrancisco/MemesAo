import { useState, useEffect, useCallback } from "react";

interface RevenueHitsAd {
  id: string;
  position: string;
  impressions: number;
  clicks: number;
  ctr: number;
  revenue: number;
  status: "loading" | "loaded" | "error";
}

interface RevenueHitsStats {
  totalImpressions: number;
  totalClicks: number;
  totalRevenue: number;
  averageCTR: number;
  estimatedCPM: number;
  adsLoaded: number;
  maxAds: number;
}

interface RevenueHitsConfig {
  publisherId: string;
  enableAnalytics: boolean;
  enableOptimization: boolean;
  maxAdsPerPage: number;
  showAdLabels: boolean;
}

export function useRevenueHits() {
  const [ads, setAds] = useState<RevenueHitsAd[]>([]);
  const [stats, setStats] = useState<RevenueHitsStats>({
    totalImpressions: 0,
    totalClicks: 0,
    totalRevenue: 0,
    averageCTR: 0,
    estimatedCPM: 0,
    adsLoaded: 0,
    maxAds: 6,
  });
  const [config, setConfig] = useState<RevenueHitsConfig>({
    publisherId: "",
    enableAnalytics: true,
    enableOptimization: true,
    maxAdsPerPage: 6,
    showAdLabels: true,
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // IDs padrão dos anúncios
  const defaultAdIds = [
    "rh_header_001",
    "rh_inline_001",
    "rh_inline_002",
    "rh_inline_003",
    "rh_sidebar_001",
    "rh_footer_001",
  ];

  // Posições dos anúncios
  const adPositions = [
    "header",
    "inline-1",
    "inline-2",
    "inline-3",
    "sidebar",
    "footer",
  ];

  // Inicializar sistema de anúncios
  const initializeAds = useCallback(() => {
    const initialAds = defaultAdIds.map((id, index) => ({
      id,
      position: adPositions[index],
      impressions: 0,
      clicks: 0,
      ctr: 0,
      revenue: 0,
      status: "loading" as const,
    }));

    setAds(initialAds);
    setIsInitialized(true);
  }, []);

  // Carregar configuração salva
  useEffect(() => {
    const savedConfig = localStorage.getItem("revenueHitsConfig");
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig((prev) => ({ ...prev, ...parsedConfig }));
      } catch (error) {
        console.error("Erro ao carregar configuração:", error);
      }
    }

    const savedPublisherId = localStorage.getItem("revenueHitsPublisherId");
    if (savedPublisherId) {
      setConfig((prev) => ({ ...prev, publisherId: savedPublisherId }));
    }

    initializeAds();
  }, [initializeAds]);

  // Salvar configuração
  const saveConfig = useCallback(
    (newConfig: Partial<RevenueHitsConfig>) => {
      const updatedConfig = { ...config, ...newConfig };
      setConfig(updatedConfig);

      localStorage.setItem("revenueHitsConfig", JSON.stringify(updatedConfig));

      if (newConfig.publisherId) {
        localStorage.setItem("revenueHitsPublisherId", newConfig.publisherId);
      }
    },
    [config]
  );

  // Registrar impressão
  const recordImpression = useCallback((adId: string) => {
    setAds((prevAds) =>
      prevAds.map((ad) =>
        ad.id === adId
          ? {
              ...ad,
              impressions: ad.impressions + 1,
              ctr:
                ad.impressions > 0
                  ? (ad.clicks / (ad.impressions + 1)) * 100
                  : 0,
              status: "loaded",
            }
          : ad
      )
    );

    setStats((prevStats) => ({
      ...prevStats,
      totalImpressions: prevStats.totalImpressions + 1,
      adsLoaded: Math.min(prevStats.adsLoaded + 1, prevStats.maxAds),
    }));
  }, []);

  // Registrar clique
  const recordClick = useCallback((adId: string) => {
    // Calcular revenue estimado baseado em CPM médio
    const estimatedCPM = 7.5; // Média entre $5 e $10
    const revenuePerClick = (estimatedCPM / 1000) * 100; // Assumindo CTR de 1%

    setAds((prevAds) =>
      prevAds.map((ad) =>
        ad.id === adId
          ? {
              ...ad,
              clicks: ad.clicks + 1,
              ctr:
                ad.impressions > 0
                  ? ((ad.clicks + 1) / ad.impressions) * 100
                  : 0,
              revenue: ad.revenue + revenuePerClick,
            }
          : ad
      )
    );

    setStats((prevStats) => ({
      ...prevStats,
      totalClicks: prevStats.totalClicks + 1,
      totalRevenue: prevStats.totalRevenue + revenuePerClick,
    }));
  }, []);

  // Calcular estatísticas atualizadas
  useEffect(() => {
    if (ads.length === 0) return;

    const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
    const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
    const totalRevenue = ads.reduce((sum, ad) => sum + ad.revenue, 0);
    const averageCTR =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const estimatedCPM =
      totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0;

    setStats((prevStats) => ({
      ...prevStats,
      totalImpressions,
      totalClicks,
      totalRevenue,
      averageCTR,
      estimatedCPM,
    }));
  }, [ads]);

  // Otimizar posicionamento dos anúncios
  const optimizeAdPlacement = useCallback(async () => {
    if (!config.enableOptimization) return;

    try {
      // Simular processo de otimização
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Reordenar anúncios por CTR (melhor performance primeiro)
      setAds((prevAds) => [...prevAds].sort((a, b) => b.ctr - a.ctr));

      console.log("🎯 Otimização de anúncios concluída!");
    } catch (error) {
      console.error("Erro na otimização:", error);
    }
  }, [config.enableOptimization]);

  // Resetar estatísticas
  const resetStats = useCallback(() => {
    setAds((prevAds) =>
      prevAds.map((ad) => ({
        ...ad,
        impressions: 0,
        clicks: 0,
        ctr: 0,
        revenue: 0,
      }))
    );

    setStats((prevStats) => ({
      ...prevStats,
      totalImpressions: 0,
      totalClicks: 0,
      totalRevenue: 0,
      averageCTR: 0,
      estimatedCPM: 0,
      adsLoaded: 0,
    }));
  }, []);

  // Exportar dados para CSV
  const exportToCSV = useCallback(() => {
    const csvContent = [
      ["ID", "Posição", "Impressões", "Cliques", "CTR (%)", "Revenue ($)"],
      ...ads.map((ad) => [
        ad.id,
        ad.position,
        ad.impressions.toString(),
        ad.clicks.toString(),
        ad.ctr.toFixed(2),
        ad.revenue.toFixed(2),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `revenuehits-stats-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [ads]);

  // Verificar se RevenueHits está configurado
  const isConfigured = config.publisherId.trim().length > 0;

  return {
    // Estado
    ads,
    stats,
    config,
    isInitialized,
    isConfigured,

    // Ações
    recordImpression,
    recordClick,
    saveConfig,
    optimizeAdPlacement,
    resetStats,
    exportToCSV,

    // Utilitários
    defaultAdIds,
    adPositions,
  };
}
