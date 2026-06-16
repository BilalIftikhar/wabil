"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { useEffect, useState } from "react";
import { useCurrency } from "@/store/useCurrency";

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
