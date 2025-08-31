import { useState, useEffect } from "react";

export function useAuth() {
  const [user, setUser] = useState<{ email: string; role: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  console.log("🔍 useAuth: Hook iniciando");

  useEffect(() => {
    console.log("🔍 useAuth: useEffect executando");

    // Por enquanto, vamos simular um usuário anônimo
    console.log("🔍 useAuth: Definindo usuário anônimo");
    setUser(null);
    setLoading(false);

    // TODO: Implementar autenticação real
  }, []);

  console.log("🔍 useAuth: Estado atual:", { user, loading });

  return {
    user,
    loading,
    signOut: async () => {
      console.log("🔍 useAuth: signOut chamado");
      setUser(null);
    },
  };
}
