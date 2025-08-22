import { useState, useEffect, useCallback } from "react";

export interface Ad {
  id: string;
  title: string;
  description: string;
  cta: string;
  url: string;
  badge?: string;
  type: "banner" | "sidebar" | "inline" | "popup";
  position: "top" | "bottom" | "sidebar" | "inline";
  priority: "high" | "medium" | "low";
  startDate: string;
  endDate: string;
  maxImpressions: number;
  currentImpressions: number;
  maxClicks: number;
  currentClicks: number;
  targetAudience?: string[];
  isActive: boolean;
}

export interface AdPlacement {
  id: string;
  name: string;
  type: Ad["type"];
  position: Ad["position"];
  className?: string;
  showCloseButton?: boolean;
  maxAds?: number;
}

export function useAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dismissedAds, setDismissedAds] = useState<Set<string>>(new Set());

  // Dados de anúncios simulados (em produção, viriam de uma API)
  const mockAds: Ad[] = [
    {
      id: "1",
      title: "🚀 Promoção Especial!",
      description: "Aproveite 50% de desconto em todos os memes premium",
      cta: "Ver Ofertas",
      url: "#",
      badge: "LIMITADO",
      type: "banner",
      position: "top",
      priority: "high",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      maxImpressions: 10000,
      currentImpressions: 0,
      maxClicks: 1000,
      currentClicks: 0,
      isActive: true,
    },
    {
      id: "2",
      title: "⭐ Memes Exclusivos",
      description: "Acesso antecipado aos melhores memes da semana",
      cta: "Assinar Premium",
      url: "#",
      badge: "EXCLUSIVO",
      type: "sidebar",
      position: "sidebar",
      priority: "medium",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      maxImpressions: 5000,
      currentImpressions: 0,
      maxClicks: 500,
      currentClicks: 0,
      isActive: true,
    },
    {
      id: "3",
      title: "🔥 Trending Now",
      description: "Descubra os memes mais populares do momento",
      cta: "Explorar",
      url: "#",
      type: "inline",
      position: "inline",
      priority: "low",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      maxImpressions: 3000,
      currentImpressions: 0,
      maxClicks: 300,
      currentClicks: 0,
      isActive: true,
    },
    {
      id: "4",
      title: "🎉 Oferta por Tempo Limitado",
      description: "Apenas hoje: 70% de desconto em pacotes de memes",
      cta: "Aproveitar Agora",
      url: "#",
      badge: "FLASH SALE",
      type: "popup",
      position: "inline",
      priority: "high",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      maxImpressions: 2000,
      currentImpressions: 0,
      maxClicks: 200,
      currentClicks: 0,
      isActive: true,
    },
  ];

  // Configurações de posicionamento
  const mockPlacements: AdPlacement[] = [
    {
      id: "header-banner",
      name: "Banner Superior",
      type: "banner",
      position: "top",
      className: "mb-4",
      showCloseButton: true,
    },
    {
      id: "sidebar-ads",
      name: "Anúncios Laterais",
      type: "sidebar",
      position: "sidebar",
      className: "mb-6",
      maxAds: 2,
    },
    {
      id: "inline-content",
      name: "Anúncios Inline",
      type: "inline",
      position: "inline",
      className: "my-4",
    },
    {
      id: "footer-banner",
      name: "Banner Inferior",
      type: "banner",
      position: "bottom",
      className: "mt-8",
      showCloseButton: false,
    },
  ];

  // Carregar anúncios e posicionamentos
  const loadAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simular carregamento de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Filtrar anúncios ativos e dentro do período
      const now = new Date();
      const activeAds = mockAds.filter((ad) => {
        const startDate = new Date(ad.startDate);
        const endDate = new Date(ad.endDate);
        return ad.isActive && now >= startDate && now <= endDate;
      });

      setAds(activeAds);
      setPlacements(mockPlacements);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao carregar anúncios"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Registrar impressão de anúncio
  const recordImpression = useCallback((adId: string) => {
    setAds((prevAds) =>
      prevAds.map((ad) =>
        ad.id === adId
          ? { ...ad, currentImpressions: ad.currentImpressions + 1 }
          : ad
      )
    );
  }, []);

  // Registrar clique de anúncio
  const recordClick = useCallback((adId: string) => {
    setAds((prevAds) =>
      prevAds.map((ad) =>
        ad.id === adId ? { ...ad, currentClicks: ad.currentClicks + 1 } : ad
      )
    );
  }, []);

  // Fechar/dismiss anúncio
  const dismissAd = useCallback((adId: string) => {
    setDismissedAds((prev) => new Set([...prev, adId]));
  }, []);

  // Obter anúncios para uma posição específica
  const getAdsForPlacement = useCallback(
    (placementId: string) => {
      const placement = placements.find((p) => p.id === placementId);
      if (!placement) return [];

      const placementAds = ads.filter(
        (ad) =>
          ad.type === placement.type &&
          ad.position === placement.position &&
          !dismissedAds.has(ad.id)
      );

      // Ordenar por prioridade e limitar quantidade
      const sortedAds = placementAds.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      return placement.maxAds
        ? sortedAds.slice(0, placement.maxAds)
        : sortedAds;
    },
    [ads, placements, dismissedAds]
  );

  // Verificar se deve mostrar popup
  const shouldShowPopup = useCallback(() => {
    const popupAds = ads.filter(
      (ad) =>
        ad.type === "popup" &&
        !dismissedAds.has(ad.id) &&
        ad.currentImpressions < ad.maxImpressions
    );

    if (popupAds.length === 0) return null;

    // Mostrar popup de maior prioridade
    return popupAds.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })[0];
  }, [ads, dismissedAds]);

  // Carregar dados iniciais
  useEffect(() => {
    loadAds();
  }, [loadAds]);

  return {
    ads,
    placements,
    loading,
    error,
    dismissedAds,
    recordImpression,
    recordClick,
    dismissAd,
    getAdsForPlacement,
    shouldShowPopup,
    refreshAds: loadAds,
  };
}
