"use client";

import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type {
  AuthUser,
  LoginCredentials,
  LoginResponse,
  MeResponse,
} from "@/lib/auth-types";
import { apiClient } from "@/lib/api-client";

export interface AuthContextType {
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchCurrentUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const me = await apiClient.get<MeResponse>("/api/v1/auth/me");
      return {
        id: me.id,
        username: me.username,
        email: me.email,
        full_name: me.full_name,
        employee_number: me.employee_number,
        status: me.status,
        status_label: me.status_label,
        profiles: me.profiles,
        permissions: me.permissions,
        organization_scope: me.organization_scope,
      };
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function validateSession() {
      const currentUser = await fetchCurrentUser();
      if (!cancelled) {
        setUser(currentUser);
        setIsLoading(false);
      }
    }

    validateSession();

    return () => {
      cancelled = true;
    };
  }, [fetchCurrentUser]);

  useEffect(() => {
    function handleSessionExpired() {
      setUser(null);
      router.push("/login");
    }

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, [router]);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await apiClient.post<LoginResponse>(
        "/api/v1/auth/login",
        credentials,
      );

      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      router.push("/");
    },
    [fetchCurrentUser, router],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.post("/api/v1/auth/logout");
    } catch {
      // Ignore logout errors — clear local state regardless
    }
    setUser(null);
    router.push("/login");
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isLoading,
    }),
    [user, login, logout, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
