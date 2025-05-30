"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService, UserProfile, AuthResponse } from "@/api/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.isAuthenticated();
      setIsAuthenticated(token);

      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (error) {
          // Token might be expired, try to refresh
          try {
            await authService.refreshToken();
            const userData = await authService.getCurrentUser();
            setUser(userData);
          } catch (refreshError) {
            authService.logout();
            setIsAuthenticated(false);
            setUser(null);
            router.replace("/login");
          }
        }
      }

      // Redirect if on auth pages while authenticated
      if (token && (pathname === "/login" || pathname === "/register")) {
        router.replace("/dashboard");
      }
    };

    checkAuth();
  }, [pathname, router]);

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });
      setIsAuthenticated(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      router.replace("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    router.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
