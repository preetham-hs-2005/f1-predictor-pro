/**
 * API Client - Base HTTP client for all API calls
 * Handles authentication, error handling, and request/response formatting
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  token?: string;
  error?: string;
  details?: unknown;
}

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization token from localStorage
   */
  private getAuthToken(): string | null {
    try {
      const session = localStorage.getItem("f1_session");
      if (session) {
        const userData = JSON.parse(session);
        const token = userData.token || null;
        console.log("[ApiClient] getAuthToken found token:", !!token);
        return token;
      }
      console.log("[ApiClient] getAuthToken: no session in localStorage");
    } catch (error) {
      console.error("[ApiClient] getAuthToken error:", error);
      return null;
    }
    return null;
  }

  /**
   * Store token in localStorage
   */
  setAuthToken(token: string, user: unknown): void {
    const sessionData = { ...user as Record<string, unknown>, token };
    localStorage.setItem("f1_session", JSON.stringify(sessionData));
    console.log("[ApiClient] setAuthToken: stored session with token", {
      hasToken: !!token,
      keys: Object.keys(sessionData),
    });
  }

  /**
   * Clear stored token
   */
  clearAuthToken(): void {
    localStorage.removeItem("f1_session");
  }

  /**
   * Make an HTTP request
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = this.getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
      console.log("[ApiClient] request: Authorization header set");
    } else {
      console.log("[ApiClient] request: No token found, request will not include Authorization");
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`API Error [${response.status}]:`, data);
        const errorMessage = data.error || data.message || "API request failed";
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error occurred");
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
