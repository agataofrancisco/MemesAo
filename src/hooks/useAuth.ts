import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost } from "../lib/api";
import type { Profile } from "../lib/types";

export interface AuthUser {
  id: string;
  email: string;
  role: "user" | "moderator" | "admin";
}

interface AuthResult {
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

export function useAuth() {
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

  return {
    user,
    profile,
    loading,
    isConfigured,
    signIn,
    signUp,
    signOut,
    refresh,
  };
}
