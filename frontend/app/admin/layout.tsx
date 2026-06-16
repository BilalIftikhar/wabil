import { Sidebar } from "@/components/admin/Sidebar";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur">
          <div className="font-heading text-xl">Admin Console</div>
          <div className="flex items-center gap-4">
            <CurrencySwitcher />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-charcoal text-sm font-semibold text-ivory">
              WA
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
