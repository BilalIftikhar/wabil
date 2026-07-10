"use client";

import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import { activeProducts, useProducts } from "@/store/useProducts";

const CATEGORIES = ["Unstitched", "Formal", "Party", "Bridal", "Winter", "Casual"];
const SIZES = ["S", "M", "L", "XL", "Custom"];
const SORTS = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Top Rated" },
];

export default function ShopPage() {
  const [cats, setCats] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(120000);
  const [sort, setSort] = useState("featured");
  const all = useProducts((s) => s.products);

  const filtered = useMemo(() => {
    let list = activeProducts(all).filter((p) => p.pricePkr <= maxPrice);
    if (cats.length) list = list.filter((p) => cats.includes(p.category));
    if (sizes.length) list = list.filter((p) => p.sizes.some((s) => sizes.includes(s)));
    if (sort === "price-asc") list = [...list].sort((a, b) => a.pricePkr - b.pricePkr);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.pricePkr - a.pricePkr);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [all, cats, sizes, maxPrice, sort]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-semibold">Shop All</h1>
        <p className="text-foreground/55">{filtered.length} pieces</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters sidebar */}
        <aside className="space-y-6">
          <div className="flex items-center gap-2 font-medium">
            <SlidersHorizontal size={18} /> Filters
          </div>

          <FilterGroup title="Category">
            {CATEGORIES.map((c) => (
              <Check key={c} label={c} checked={cats.includes(c)} onChange={() => toggle(cats, setCats, c)} />
            ))}
          </FilterGroup>

          <FilterGroup title="Size">
            <div className="flex flex-wrap gap-2">
              {SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggle(sizes, setSizes, s)}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                    sizes.includes(s) ? "border-rosegold bg-rosegold/10 text-rosegold" : "border-border"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </FilterGroup>

          <FilterGroup title={`Max Price · Rs ${maxPrice.toLocaleString()}`}>
            <input
              type="range"
              min={5000}
              max={120000}
              step={1000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-rosegold"
            />
          </FilterGroup>
        </aside>

        {/* Grid */}
        <div>
          <div className="mb-5 flex justify-end">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-rosegold"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-foreground/60">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-rosegold" />
      {label}
    </label>
  );
}
