import { authService } from "@/src/services/auth.service";
import { create } from "zustand";
import { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    phone?: string,
    inviteCode?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setToken: (token) => set({ token, isAuthenticated: !!token }),

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { user, token } = await authService.login(email, password);
      set({ user, token, isAuthenticated: true, error: null });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Login failed" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password, name, phone, inviteCode) => {
    try {
      set({ isLoading: true, error: null });
      const { user, token } = await authService.register(
        email,
        password,
        name,
        phone,
        inviteCode
      );
      set({ user, token, isAuthenticated: true, error: null });
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Registration failed" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      set({ user: null, token: null, isAuthenticated: false, error: null });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },

  loadStoredAuth: async () => {
    try {
      set({ isLoading: true });
      const [storedUser, storedToken] = await Promise.all([
        authService.getStoredUser(),
        authService.getStoredToken(),
      ]);

      if (storedUser && storedToken) {
        set({ user: storedUser, token: storedToken, isAuthenticated: true });
      }
    } catch (error) {
      console.error("Error loading stored auth:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
