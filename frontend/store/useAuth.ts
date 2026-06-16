"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  // Mock auth — replace with POST {API}/auth/{login,register} (Sanctum) later.
  login: (email: string, name?: string) => AuthUser;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (email, name) => {
        const user: AuthUser = {
          id: "u_" + email.split("@")[0],
          name: name || email.split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase()),
          email,
          role: email.includes("admin") ? "admin" : "customer",
        };
        set({ user, token: "mock-sanctum-token" });
        return user;
      },
      logout: () => set({ user: null, token: null }),
    }),
    { name: "wabil-auth" },
  ),
);
