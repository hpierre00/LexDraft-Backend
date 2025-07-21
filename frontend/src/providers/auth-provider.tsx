"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  authService,
  UserProfile,
  AuthResponse,
  updateUserProfile,
} from "@/api/auth";
import apiClient from "@/api/client";
import { FullPageShimmer } from "@/components/ui/full-page-shimmer";

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
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
      console.log("Auth Check: Starting...");
      setLoadingAuth(true);
      const currentToken = authService.getToken();

      if (currentToken) {
        console.log("Auth Check: Token found, attempting to fetch user data.");
        try {
          console.log("Auth Check: Attempting to fetch user data.");
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
          if (
            !userData.profile_setup_complete &&
            pathname !== "/profile" &&
            pathname !== "/login"
          ) {
            router.replace("/profile");
          }
          console.log(
            "Auth Check: User data fetched, isAuthenticated set to TRUE."
          );
        } catch (error: any) {
          console.error(
            "Auth Check: Error fetching user data, attempting refresh:",
            error
          );
          // Token might be expired or invalid, try to refresh
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
            if (
              !userData.profile_setup_complete &&
              pathname !== "/profile" &&
              pathname !== "/login"
            ) {
              router.replace("/profile");
            }
            console.log(
              "Auth Check: Token refreshed, user data fetched, isAuthenticated set to TRUE."
            );
          } catch (refreshError: any) {
            console.error(
              "Auth Check: Token refresh failed, logging out:",
              refreshError.response?.data ||
                refreshError.message ||
                refreshError
            );
            authService.logout();
            setIsAuthenticated(false);
            setUser(null);
            router.replace("/login");
            console.log(
              "Auth Check: isAuthenticated set to FALSE after refresh failure."
            );
          }
        }
      } else {
        console.log(
          "Auth Check: No token found, isAuthenticated set to FALSE."
        );
        setIsAuthenticated(false);
        setUser(null);
      }

      // Redirect if on auth pages while authenticated
      if (
        isAuthenticated && // Use current state, not updated state from above
        (pathname === "/login" || pathname === "/register")
      ) {
        console.log("Auth Check: Authenticated, redirecting from auth page.");
        router.replace("/dashboard");
      }
      setLoadingAuth(false);
      setIsAuthInitialized(true); // Auth is initialized after check
      console.log("Auth Check: Finished. isAuthInitialized set to TRUE.");
    };

    if (!isAuthInitialized) {
      // Run only once initially
      checkAuth();
    } else if (pathname === "/login" || pathname === "/register") {
      // Special handling for auth pages if already initialized
      if (isAuthenticated) {
        console.log(
          "Auth Check: Already initialized and authenticated on auth page, redirecting to dashboard."
        );
        router.replace("/dashboard");
      }
    }
  }, [pathname, router]); // Removed isAuthenticated from dependency array

  const login = async (email: string, password: string) => {
    try {
      console.log("Login Function: Attempting login...");
      const data = await authService.login({ email, password });
      setIsAuthenticated(true);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsAuthInitialized(true); // Auth is initialized after login
      if (!userData.profile_setup_complete) {
        router.replace("/profile");
      } else {
        router.replace("/dashboard");
      }
      console.log(
        "Login Function: Login successful, isAuthenticated set to TRUE, redirecting."
      );
    } catch (error) {
      console.error("Login Function: Login failed:", error);
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      const updatedUser = await updateUserProfile(profileData);
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update profile", error);
      throw error;
    }
  };

  const logout = () => {
    console.log("Logout Function: Initiating logout...");
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setIsAuthInitialized(false); // Auth is no longer initialized
    router.replace("/login");
    console.log(
      "Logout Function: Logout complete, isAuthenticated set to FALSE, redirecting."
    );
  };

  if (loadingAuth) {
    return <FullPageShimmer />;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        user,
        isAuthInitialized,
        updateProfile,
      }}
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
