"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Sidebar } from "@/components/admin/Sidebar";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { useAuth } from "@/store/useAuth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, ready, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
    } else if (user.role !== "admin") {
      router.replace("/");
    }
  }, [user, ready, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "WA";

  if (!ready || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-rosegold border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur">
          <div className="font-heading text-xl">Admin Console</div>
          <div className="flex items-center gap-4">
            <CurrencySwitcher />
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-none">{user.name ?? user.email}</p>
              <p className="text-xs text-foreground/50">{user.email}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal text-sm font-semibold text-ivory">
              {initials}
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-sm text-rose-500 hover:border-rose-500 hover:bg-rose-500/10"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
