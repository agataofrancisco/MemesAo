import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";
import type { Profile } from "../lib/types";

export interface AuthUser {
  id: string;
  email: string;
  role: "user" | "moderator" | "admin";
}

export interface AuthResult {
  error: { message: string } | null;
}

interface MeResponse {
  user: AuthUser | null;
  profile: Profile | null;
}

interface SessionResponse {
  user: AuthUser;
  profile: Profile;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = true;

  const refresh = useCallback(async () => {
    try {
      const data = await apiGet<MeResponse>("/api/auth/me");
      setUser(data.user);
      setProfile(data.profile);
    } catch {
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    apiGet<MeResponse>("/api/auth/me")
      .then((data) => {
        if (!mounted) return;
        setUser(data.user);
        setProfile(data.profile);
      })
      .catch(() => {
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      try {
        const data = await apiPost<SessionResponse>("/api/auth/login", {
          email,
          password,
        });
        setUser(data.user);
        setProfile(data.profile);
        return { error: null };
      } catch (err) {
        return {
          error: {
            message:
              err instanceof Error ? err.message : "Erro ao entrar na conta",
          },
        };
      }
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      username: string
    ): Promise<AuthResult> => {
      try {
        const data = await apiPost<SessionResponse>("/api/auth/register", {
          email,
          password,
          username,
        });
        setUser(data.user);
        setProfile(data.profile);
        return { error: null };
      } catch (err) {
        return {
          error: {
            message:
              err instanceof Error ? err.message : "Erro ao criar a conta",
          },
        };
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      await apiPost("/api/auth/logout", {});
    } catch {
      // ignorar
    }
    setUser(null);
    setProfile(null);
  }, []);

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    isConfigured,
    signIn,
    signUp,
    signOut,
    refresh,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
