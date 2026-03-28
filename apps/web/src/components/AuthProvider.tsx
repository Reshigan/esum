"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { verifyAccess } from "@/lib/demo-accounts";

interface User {
  email: string;
  name: string;
  role: string;
  company: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, credential: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AUTH_KEY = "esum_auth_user";

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => ({ success: false }),
  logout: () => {},
});

const PUBLIC_PATHS = ["/", "/login", "/register"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
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

  const login = useCallback((email: string, credential: string) => {
    const account = verifyAccess(email.toLowerCase(), credential);
    if (!account) {
      return { success: false, error: "Invalid email or credentials" };
    }
    const authenticatedUser: User = { email: account.email, name: account.name, role: account.role, company: account.company };
    setUser(authenticatedUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(authenticatedUser));
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
