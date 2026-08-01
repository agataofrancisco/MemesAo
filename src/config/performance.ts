// Configurações de performance para o app
export const PERFORMANCE_CONFIG = {
  // Configurações de imagens
  IMAGES: {
    // Tamanho máximo para lazy loading (px)
    LAZY_LOAD_THRESHOLD: 50,
    // Placeholder padrão
    DEFAULT_PLACEHOLDER:
      "https://via.placeholder.com/400x400.png?text=Carregando...",
    // Fallback padrão para erros
    DEFAULT_FALLBACK:
      "https://via.placeholder.com/400x400.png?text=Erro+Carregamento",
    // Qualidade de compressão (0-100)
    COMPRESSION_QUALITY: 85,
    // Formato preferido
    PREFERRED_FORMAT: "webp",
  },

  // Configurações de paginação
  PAGINATION: {
    // Itens por página
    ITEMS_PER_PAGE: 20,
    // Distância para pré-carregar (px)
    PRELOAD_DISTANCE: 800,
    // Delay entre carregamentos (ms)
    LOAD_DELAY: 300,
  },

  // Configurações de cache
  CACHE: {
    // Tamanho máximo do cache de memes
    MAX_MEME_CACHE_SIZE: 100,
    // Tempo de expiração do cache (ms)
    CACHE_EXPIRY: 5 * 60 * 1000, // 5 minutos
    // Limpar cache automaticamente
    AUTO_CLEANUP: true,
  },

  // Configurações de animações
  ANIMATIONS: {
    // Duração das animações (ms)
    DURATION: 300,
    // Delay entre animações de itens (ms)
    ITEM_DELAY: 50,
    // Reduzir animações em dispositivos lentos
    REDUCE_MOTION: true,
  },

  // Configurações de scroll
  SCROLL: {
    // Throttle do scroll (ms)
    THROTTLE_DELAY: 16, // ~60fps
    // Scroll passivo
    PASSIVE: true,
    // Debounce para carregamento
    DEBOUNCE_DELAY: 100,
  },

  // Configurações de rede
  NETWORK: {
    // Timeout para requisições (ms)
    REQUEST_TIMEOUT: 10000,
    // Retry automático
    AUTO_RETRY: true,
    // Máximo de tentativas
    MAX_RETRIES: 3,
  },
};

// Função para detectar dispositivo lento
export const isSlowDevice = (): boolean => {
  // Verificar se o dispositivo tem memória limitada
  if ("memory" in performance) {
    const memory = (performance as unknown as {
      memory?: { usedJSHeapSize: number };
    }).memory;
    if (memory && memory.usedJSHeapSize < 50 * 1024 * 1024) {
      // < 50MB
      return true;
    }
  }

  // Verificar se é um dispositivo móvel com conexão lenta
  if ("connection" in navigator) {
    const connection = (navigator as unknown as {
      connection?: { effectiveType: string };
    }).connection;
    if (
      connection &&
      (connection.effectiveType === "slow-2g" ||
        connection.effectiveType === "2g")
    ) {
      return true;
    }
  }

  // Verificar se o usuário prefere menos movimento
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return true;
  }

  return false;
};

// Função para aplicar configurações baseadas no dispositivo
export const getOptimizedConfig = () => {
  const isSlow = isSlowDevice();

  if (isSlow) {
    return {
      ...PERFORMANCE_CONFIG,
      PAGINATION: {
        ...PERFORMANCE_CONFIG.PAGINATION,
        ITEMS_PER_PAGE: 12, // Menos itens por página
        PRELOAD_DISTANCE: 1200, // Pré-carregar mais cedo
      },
      ANIMATIONS: {
        ...PERFORMANCE_CONFIG.ANIMATIONS,
        DURATION: 200, // Animações mais rápidas
        ITEM_DELAY: 25, // Menos delay entre itens
      },
      IMAGES: {
        ...PERFORMANCE_CONFIG.IMAGES,
        COMPRESSION_QUALITY: 75, // Compressão maior
      },
    };
  }

  return PERFORMANCE_CONFIG;
};

// Função para debounce
export const debounce = <Args extends unknown[]>(
  func: (...args: Args) => unknown,
  wait: number
): ((...args: Args) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Função para throttle
export const throttle = <Args extends unknown[]>(
  func: (...args: Args) => unknown,
  limit: number
): ((...args: Args) => void) => {
  let inThrottle: boolean;
  return (...args: Args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
