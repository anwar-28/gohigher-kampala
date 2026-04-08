"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { getCurrentUser, logout as appwriteLogout } from "@/lib/auth";

interface AuthUser {
  $id: string;
  name: string;
  email: string;
  role: "citizen" | "admin" | "vendor";
  profile_picture?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useAuthProvider() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const u = (await getCurrentUser()) as any;
      if (u) {
        // Extract profile_picture from profile object
        const authUser: AuthUser = {
          $id: u.$id,
          name: u.name,
          email: u.email,
          role: u.role,
          profile_picture: u.profile?.profile_picture,
        };
        setUser(authUser);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const logout = async () => {
    await appwriteLogout();
    setUser(null);
  };

  return { user, loading, logout, refreshUser };
}
