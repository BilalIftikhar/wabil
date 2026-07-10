"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase, supabaseEnabled } from "@/lib/supabase";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
}

interface AuthState {
  user: AuthUser | null;
  ready: boolean;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (name: string, email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

// Fetch the profile row (role lives there) for a signed-in Supabase user.
async function profileFor(id: string, fallback: AuthUser): Promise<AuthUser> {
  if (!supabase) return fallback;
  const { data } = await supabase.from("profiles").select("name, email, role").eq("id", id).single();
  if (!data) return fallback;
  return {
    id,
    name: data.name ?? fallback.name,
    email: data.email ?? fallback.email,
    role: (data.role as AuthUser["role"]) ?? "customer",
  };
}

function mockUser(email: string, name?: string): AuthUser {
  return {
    id: "u_" + email.split("@")[0],
    name: name || email.split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase()),
    email,
    role: email.includes("admin") ? "admin" : "customer",
  };
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      ready: false,
      init: async () => {
        if (supabaseEnabled && supabase) {
          const { data } = await supabase.auth.getUser();
          if (data.user) {
            const u = await profileFor(data.user.id, {
              id: data.user.id,
              name: data.user.email?.split("@")[0] ?? "Member",
              email: data.user.email ?? "",
              role: "customer",
            });
            set({ user: u, ready: true });
            return;
          }
        }
        set({ ready: true });
      },
      signIn: async (email, password) => {
        if (supabaseEnabled && supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          const u = await profileFor(data.user.id, mockUser(email));
          set({ user: u });
          return u;
        }
        const u = mockUser(email);
        set({ user: u });
        return u;
      },
      signUp: async (name, email, password) => {
        if (supabaseEnabled && supabase) {
          const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
          if (error) throw error;
          const u: AuthUser = { id: data.user?.id ?? "u_" + email, name, email, role: "customer" };
          set({ user: u });
          return u;
        }
        const u = mockUser(email, name);
        set({ user: u });
        return u;
      },
      signOut: async () => {
        if (supabaseEnabled && supabase) await supabase.auth.signOut();
        set({ user: null });
      },
    }),
    { name: "wabil-auth", partialize: (s) => ({ user: s.user }) },
  ),
);
