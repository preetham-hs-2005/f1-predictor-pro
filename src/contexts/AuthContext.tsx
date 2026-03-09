import React, { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "@/lib/api/auth";
import { apiClient } from "@/lib/api/client";

export interface User {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: "user" | "admin";
  totalPoints: number;
}

interface SessionData {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  setUsername: (username: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = "f1_session";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize session from localStorage on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const sessionData: SessionData = JSON.parse(session);
        setUser(sessionData.user);
        // Restore token to API client
        if (sessionData.token) {
          apiClient.setAuthToken(sessionData.token, sessionData.user);
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await authApi.loginUser(email, password);
      setUser(userData);
      // Token is stored by authApi.loginUser via apiClient.setAuthToken
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      const userData = await authApi.registerUser(name, email, password, username);
      
      setUser(userData);
      // Note: apiClient.setAuthToken is called in authApi.registerUser
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem(SESSION_KEY);
      setIsLoading(false);
    }
  };

  const setUsername = async (username: string) => {
    try {
      setIsLoading(true);
      const userData = await authApi.setUsername(username);
      setUser(userData);
      
      // Update session storage immediately to avoid refresh loss
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const sessionData: SessionData = JSON.parse(session);
        sessionData.user = userData;
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      }
      
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to set username";
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
