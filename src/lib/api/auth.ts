/**
 * Authentication API - All auth-related API calls
 */

import { apiClient, ApiResponse } from "./client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  totalPoints: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse extends ApiResponse<AuthUser> {
  user?: AuthUser;
  token?: string;
}

/**
 * Login with email and password
 */
export async function loginUser(
  email: string,
  password: string
): Promise<AuthUser> {
  console.log("[AuthAPI] loginUser called with email:", email);
  const response = await apiClient.post<AuthResponse>("/api/auth/login", {
    email,
    password,
  });

  console.log("[AuthAPI] loginUser response:", { success: response.success, hasUser: !!response.user, hasToken: !!response.token });

  if (!response.success || !response.user) {
    throw new Error(response.error || "Login failed");
  }

  // Store token if provided
  if (response.token) {
    console.log("[AuthAPI] loginUser: storing token via setAuthToken");
    apiClient.setAuthToken(response.token, response.user);
  } else {
    console.warn("[AuthAPI] loginUser: no token in response!");
  }

  return response.user;
}

/**
 * Register a new user
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthUser> {
  const response = await apiClient.post<AuthResponse>("/api/auth/register", {
    name,
    email,
    password,
  });

  if (!response.success || !response.user) {
    throw new Error(response.error || "Registration failed");
  }

  // Store token if provided
  if (response.token) {
    apiClient.setAuthToken(response.token, response.user);
  }

  return response.user;
}

/**
 * Get current user info
 */
export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiClient.get<AuthResponse>("/api/auth/me");

  if (!response.success || !response.user) {
    throw new Error(response.error || "Failed to fetch user");
  }

  return response.user;
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
  try {
    await apiClient.post("/api/auth/logout", {});
  } catch {
    // Logout always clears local session, even if API fails
  } finally {
    apiClient.clearAuthToken();
  }
}
