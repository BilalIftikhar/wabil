"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authFetch } from "@/lib/api/auth-fetch";
import { DEFAULT_SETTINGS, type PublicStoreSettings, type StoreSettings } from "@/lib/settings";

export type { StoreSettings } from "@/lib/settings";

interface StoreState {
  settings: StoreSettings;
  loaded: boolean;
  update: (patch: Partial<StoreSettings>) => void;
  setAll: (settings: StoreSettings) => void;
  loadPublic: () => Promise<void>;
  loadAdmin: () => Promise<StoreSettings | null>;
  saveAdmin: (settings: StoreSettings) => Promise<boolean>;
}

export const useStoreSettings = create<StoreState>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      loaded: false,
      update: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setAll: (settings) => set({ settings, loaded: true }),
      loadPublic: async () => {
        try {
          const res = await fetch("/api/settings/public");
          if (!res.ok) return;
          const data = (await res.json()) as { settings: PublicStoreSettings };
          set((s) => ({ settings: { ...s.settings, ...data.settings }, loaded: true }));
        } catch {
          // keep cached/local settings
        }
      },
      loadAdmin: async () => {
        try {
          const res = await authFetch("/api/settings");
          if (!res.ok) return null;
          const data = (await res.json()) as { settings: StoreSettings };
          set({ settings: data.settings, loaded: true });
          return data.settings;
        } catch {
          return null;
        }
      },
      saveAdmin: async (settings) => {
        try {
          const res = await authFetch("/api/settings", {
            method: "PUT",
            body: JSON.stringify({ settings }),
          });
          if (!res.ok) return false;
          const data = (await res.json()) as { settings: StoreSettings };
          set({ settings: data.settings, loaded: true });
          return true;
        } catch {
          return false;
        }
      },
    }),
    { name: "wabil-store-settings", partialize: (s) => ({ settings: s.settings }) },
  ),
);
