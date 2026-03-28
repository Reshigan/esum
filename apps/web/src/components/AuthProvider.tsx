"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiClient } from "@/lib/api-client";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Organisation {
  id: string;
  name: string;
  type: string;
}

interface AuthContextType {
  user: User | null;
  organisation: Organisation | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AUTH_TOKEN_KEY = "esum_auth_token";
const AUTH_USER_KEY = "esum_auth_user";
const AUTH_ORG_KEY = "esum_auth_org";

const AuthContext = createContext<AuthContextType>({
  user: null,
  organisation: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
});

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const storedUser = localStorage.getItem(AUTH_USER_KEY);
      const storedOrg = localStorage.getItem(AUTH_ORG_KEY);
      
      if (token && storedUser && storedOrg) {
        apiClient.setToken(token);
        setUser(JSON.parse(storedUser));
        setOrganisation(JSON.parse(storedOrg));
      }
    } catch {
      // ignore parse errors
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const isPublic = PUBLIC_PATHS.includes(pathname || "");
    if (!user && !isPublic) {
      router.replace("/login");
    }
  }, [user, isLoading, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);
      apiClient.setToken(response.access_token);
      
      const userData = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
      };
      const orgData = {
        id: response.organisation.id,
        name: response.organisation.name,
        type: response.organisation.type,
      };
      
      setUser(userData);
      setOrganisation(orgData);
      localStorage.setItem(AUTH_TOKEN_KEY, response.access_token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      localStorage.setItem(AUTH_ORG_KEY, JSON.stringify(orgData));
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Login failed" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch {
      // ignore logout errors
    } finally {
      apiClient.setToken(null);
      setUser(null);
      setOrganisation(null);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_ORG_KEY);
      router.replace("/login");
    }
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, organisation, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
