"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService, UserProfile, AuthResponse } from "@/api/auth";
import apiClient from "@/api/client";
import { FullPageShimmer } from "@/components/ui/full-page-shimmer";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthInitialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      setLoadingAuth(true);
      const currentToken = authService.getToken();

      if (currentToken) {
        apiClient.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${currentToken}`;
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error: any) {
          console.error("Error fetching user data after auth:", error);
          // Token might be expired or invalid, try to refresh
          try {
            const { access_token } = await authService.refreshToken();
            apiClient.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${access_token}`;
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
          } catch (refreshError: any) {
            console.error(
              "Token refresh failed:",
              refreshError.response?.data ||
                refreshError.message ||
                refreshError
            );
            authService.logout();
            apiClient.defaults.headers.common["Authorization"] = ""; // Clear header on logout
            setIsAuthenticated(false);
            setUser(null);
            router.replace("/login");
          }
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }

      // Redirect if on auth pages while authenticated
      if (
        isAuthenticated &&
        (pathname === "/login" || pathname === "/register")
      ) {
        router.replace("/dashboard");
      }
      setLoadingAuth(false);
      setIsAuthInitialized(true); // Auth is initialized after check
    };

    checkAuth();
  }, [pathname, router, isAuthenticated]); // Add isAuthenticated as a dependency

  const login = async (email: string, password: string) => {
    try {
      const data = await authService.login({ email, password });
      apiClient.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${data.access_token}`;
      setIsAuthenticated(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthInitialized(true); // Auth is initialized after login
      router.replace("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    apiClient.defaults.headers.common["Authorization"] = ""; // Clear header on logout
    setIsAuthenticated(false);
    setUser(null);
    setIsAuthInitialized(false); // Auth is no longer initialized
    router.replace("/login");
  };

  if (loadingAuth) {
    return <FullPageShimmer />;
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, user, isAuthInitialized }}
    >
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
