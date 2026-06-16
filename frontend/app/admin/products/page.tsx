"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import { type AdminProduct, type AdminVariant, adminProducts } from "@/lib/mock/admin";
import { useCurrency } from "@/store/useCurrency";
import { PageHeader } from "@/components/admin/PageHeader";
import { Drawer } from "@/components/admin/Drawer";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

const blank: AdminProduct = {
  id: "",
  name: "",
  slug: "",
  category: "Unstitched",
  pricePkr: 0,
  image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=70",
  status: "draft",
  variants: [{ size: "M", color: "Default", stock: 0 }],
};

const CATEGORIES = ["Unstitched", "Formal", "Party", "Bridal", "Winter", "Casual"];

export default function AdminProductsPage() {
  const { format } = useCurrency();
  const [products, setProducts] = useState(adminProducts);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [confirm, setConfirm] = useState<string[] | null>(null);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  );

  const stockOf = (p: AdminProduct) => p.variants.reduce((n, v) => n + v.stock, 0);

  const save = (p: AdminProduct) => {
    const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (p.id) {
      setProducts((list) => list.map((x) => (x.id === p.id ? { ...p, slug } : x)));
      toast.success("Product updated");
    } else {
      setProducts((list) => [{ ...p, id: "p" + (list.length + 1), slug }, ...list]);
      toast.success("Product created");
    }
    setEditing(null);
  };

  const remove = (ids: string[]) => {
    setProducts((list) => list.filter((p) => !ids.includes(p.id)));
    setSelected((s) => s.filter((id) => !ids.includes(id)));
    toast.success(`Deleted ${ids.length} product${ids.length > 1 ? "s" : ""}`);
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products`}
        action={
          <button
            onClick={() => setEditing({ ...blank })}
            className="flex items-center gap-2 rounded-xl bg-charcoal px-4 py-2.5 text-sm font-medium text-ivory"
          >
            <Plus size={16} /> New product
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-luxe">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-rosegold"
          />
        </div>
      </div>

      {selected.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-3 flex items-center justify-between rounded-xl bg-charcoal px-4 py-2.5 text-ivory">
          <span className="text-sm">{selected.length} selected</span>
          <button onClick={() => setConfirm(selected)} className="flex items-center gap-1.5 rounded-lg bg-rose-500 px-3 py-1.5 text-sm">
            <Trash2 size={14} /> Delete
          </button>
        </motion.div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-luxe">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-foreground/50">
              <th className="p-3">
                <input
                  type="checkbox"
                  className="accent-rosegold"
                  checked={!!filtered.length && selected.length === filtered.length}
                  onChange={(e) => setSelected(e.target.checked ? filtered.map((p) => p.id) : [])}
                />
              </th>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const stock = stockOf(p);
              return (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="border-b border-border/60 hover:bg-muted/40"
                >
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="accent-rosegold"
                      checked={selected.includes(p.id)}
                      onChange={(e) => setSelected((s) => (e.target.checked ? [...s, p.id] : s.filter((id) => id !== p.id)))}
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt={p.name} className="h-12 w-9 rounded-md object-cover" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-foreground/45">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-foreground/60">{p.category}</td>
                  <td className="p-3 font-medium">{format(p.pricePkr)}</td>
                  <td className="p-3">
                    <span className={stock === 0 ? "text-rose-500" : stock < 5 ? "text-amber-500" : "text-foreground/60"}>
                      {stock} units
                    </span>
                  </td>
                  <td className="p-3">
                    <StatusBadge label={p.status} color={p.status === "active" ? "#A3B18A" : "#8E9AAF"} />
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditing(p)} className="rounded-lg p-1.5 hover:bg-muted">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => setConfirm([p.id])} className="rounded-lg p-1.5 text-foreground/40 hover:bg-rose-500/10 hover:text-rose-500">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ProductEditor product={editing} categories={CATEGORIES} onClose={() => setEditing(null)} onSave={save} />

      <ConfirmModal
        open={!!confirm}
        title="Delete product"
        message={`Permanently remove ${confirm?.length ?? 0} product(s)?`}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) remove(confirm);
          setConfirm(null);
        }}
      />
    </div>
  );
}

function ProductEditor({
  product,
  categories,
  onClose,
  onSave,
}: {
  product: AdminProduct | null;
  categories: string[];
  onClose: () => void;
  onSave: (p: AdminProduct) => void;
}) {
  const [current, setCurrent] = useState<AdminProduct | null>(product);

  // Reset the editable draft whenever a different product is opened.
  useEffect(() => {
    if (product) setCurrent({ ...product, variants: product.variants.map((v) => ({ ...v })) });
  }, [product]);

  const update = (patch: Partial<AdminProduct>) => setCurrent((c) => (c ? { ...c, ...patch } : c));
  const updateVariant = (idx: number, patch: Partial<AdminVariant>) =>
    setCurrent((c) => (c ? { ...c, variants: c.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)) } : c));

  const input =
    "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";
  const label = "mb-1.5 block text-sm font-medium text-foreground/70";

  return (
    <Drawer
      open={!!product}
      title={product?.id ? "Edit product" : "New product"}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted">
            Cancel
          </button>
          <button onClick={() => current && onSave(current)} className="rounded-xl bg-charcoal px-6 py-2.5 text-sm font-medium text-ivory">
            Save product
          </button>
        </div>
      }
    >
      {current && (
        <div className="space-y-5">
          {/* Image (drag-drop placeholder) */}
          <div>
            <label className={label}>Images</label>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={current.image} alt="" className="h-24 w-20 rounded-xl object-cover" />
              <div className="flex h-24 flex-1 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border text-xs text-foreground/45 hover:border-rosegold">
                <Plus size={18} />
                Drag & drop or click to upload
              </div>
            </div>
          </div>

          <div>
            <label className={label}>Name</label>
            <input className={input} value={current.name} onChange={(e) => update({ name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Category</label>
              <select className={input} value={current.category} onChange={(e) => update({ category: e.target.value })}>
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Status</label>
              <select className={input} value={current.status} onChange={(e) => update({ status: e.target.value as AdminProduct["status"] })}>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Price (PKR)</label>
              <input className={input} type="number" value={current.pricePkr} onChange={(e) => update({ pricePkr: Number(e.target.value) })} />
            </div>
            <div>
              <label className={label}>Compare at (PKR)</label>
              <input className={input} type="number" value={current.comparePkr ?? ""} onChange={(e) => update({ comparePkr: Number(e.target.value) || undefined })} />
            </div>
          </div>

          {/* Variant manager */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className={label.replace("mb-1.5 block ", "")}>Variants</label>
              <button
                onClick={() => update({ variants: [...current.variants, { size: "", color: "", stock: 0 }] })}
                className="text-sm text-rosegold hover:underline"
              >
                + Add variant
              </button>
            </div>
            <div className="space-y-2">
              {current.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                  <input className={input} placeholder="Size" value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} />
                  <input className={input} placeholder="Color" value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })} />
                  <input className={input} type="number" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })} />
                  <button
                    onClick={() => update({ variants: current.variants.filter((_, j) => j !== i) })}
                    className="rounded-lg px-2 text-foreground/40 hover:text-rose-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-border p-4">
            <p className="mb-3 text-sm font-semibold">SEO</p>
            <div className="space-y-3">
              <div>
                <label className={label}>Meta title</label>
                <input className={input} value={current.seoTitle ?? ""} onChange={(e) => update({ seoTitle: e.target.value })} />
              </div>
              <div>
                <label className={label}>Meta description</label>
                <textarea className={input} rows={2} value={current.seoDescription ?? ""} onChange={(e) => update({ seoDescription: e.target.value })} />
              </div>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
