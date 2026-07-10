"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import { activeProducts, useProducts } from "@/store/useProducts";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const all = useProducts((s) => s.products);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = activeProducts(all);
    if (!term) return [];
    return list.filter(
      (p) => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term),
    );
  }, [q, all]);

  const suggestions = ["Bridal", "Lawn", "Silk", "Chiffon", "Formal"];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-6 text-center font-heading text-4xl font-semibold">Search WABIL</h1>

      <div className="relative mx-auto max-w-xl">
        <SearchIcon size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search suits, collections, colours…"
          className="w-full rounded-full border border-border bg-card py-3.5 pl-12 pr-4 text-base outline-none focus:border-rosegold focus:ring-2 focus:ring-rosegold/20"
        />
      </div>

      {!q && (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {suggestions.map((s) => (
            <button key={s} onClick={() => setQ(s)} className="rounded-full border border-border px-4 py-1.5 text-sm hover:border-rosegold">
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mt-10">
        {q && results.length === 0 && (
          <p className="text-center text-foreground/50">
            No matches for “{q}”. <Link href="/shop" className="text-rosegold underline">Browse all</Link>
          </p>
        )}
        {results.length > 0 && (
          <>
            <p className="mb-5 text-sm text-foreground/55">{results.length} result{results.length > 1 ? "s" : ""}</p>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {results.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
