import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  totalPoints: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface StoredUser extends User {
  password: string;
}

const USERS_KEY = "f1_users";
const SESSION_KEY = "f1_session";

const getStoredUsers = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveStoredUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        setUser(JSON.parse(session));
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const login = (email: string, password: string) => {
    const users = getStoredUsers();
    const found = users.find((u) => u.email === email.toLowerCase() && u.password === password);
    if (!found) return { success: false, error: "Invalid credentials" };
    const { password: _, ...userWithoutPassword } = found;
    setUser(userWithoutPassword);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
    return { success: true };
  };

  const register = (name: string, email: string, password: string) => {
    const users = getStoredUsers();
    if (users.some((u) => u.email === email.toLowerCase())) {
      return { success: false, error: "Email already exists" };
    }
    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email: email.toLowerCase(),
      password,
      role: "user",
      totalPoints: 0,
    };
    saveStoredUsers([...users, newUser]);
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem(SESSION_KEY, JSON.stringify(userWithoutPassword));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
