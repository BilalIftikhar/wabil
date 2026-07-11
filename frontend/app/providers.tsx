"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { useCurrency } from "@/store/useCurrency";
import { useProducts } from "@/store/useProducts";
import { useAuth } from "@/store/useAuth";
import { useStoreSettings } from "@/store/useStore";
import { fetchProducts } from "@/lib/api/products";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, refetchOnWindowFocus: false },
        },
      }),
  );
  const loadRates = useCurrency((s) => s.loadRates);

  useEffect(() => {
    loadRates();
    // Restore an existing Supabase session (no-op in mock mode).
    useAuth.getState().init();
    useStoreSettings.getState().loadPublic();
    // Load the catalog:
    (async () => {
      try {
        const remote = await fetchProducts();
        if (remote && remote.length) useProducts.getState().setAll(remote);
        else useProducts.persist.rehydrate();
      } catch {
        useProducts.persist.rehydrate();
      }
    })();
  }, [loadRates]);

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: "var(--font-dm-sans)",
              borderRadius: "0.75rem",
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
