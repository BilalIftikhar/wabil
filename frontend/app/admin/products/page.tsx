"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Edit3, Film, ImagePlus, Plus, Search, Trash2, X } from "lucide-react";
import { type StoreProduct, type Variant, slugify, useProducts } from "@/store/useProducts";
import { useCurrency } from "@/store/useCurrency";
import { uploadMedia, MAX_IMAGE_MB, MAX_VIDEO_MB, sizeMb } from "@/lib/upload";
import { deleteProducts, productsRemote, saveProduct } from "@/lib/api/products";
import { PageHeader } from "@/components/admin/PageHeader";
import { Drawer } from "@/components/admin/Drawer";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmModal } from "@/components/admin/ConfirmModal";

const CATEGORIES = ["Unstitched", "Formal", "Party", "Bridal", "Winter", "Casual"];

const blank = (): StoreProduct => ({
  id: "",
  name: "",
  slug: "",
  category: "Unstitched",
  pricePkr: 0,
  image: "",
  hoverImage: "",
  images: [],
  rating: 5,
  colors: ["#C9A96E"],
  sizes: ["S", "M", "L"],
  status: "draft",
  variants: [{ size: "M", color: "Default", stock: 0 }],
});

export default function AdminProductsPage() {
  const { format } = useCurrency();
  const { products, add, update, remove } = useProducts();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [editing, setEditing] = useState<StoreProduct | null>(null);
  const [confirm, setConfirm] = useState<string[] | null>(null);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase())),
    [products, query],
  );

  const stockOf = (p: StoreProduct) => p.variants.reduce((n, v) => n + v.stock, 0);

  const save = async (p: StoreProduct) => {
    const slug = p.slug || slugify(p.name);
    const image = p.images[0] ?? p.image ?? "";
    const clean: StoreProduct = { ...p, id: p.id || "p" + Date.now(), slug, image, hoverImage: p.images[1] ?? image };
    // Update the in-memory store immediately for a snappy UI…
    if (p.id) update(clean);
    else add(clean);
    setEditing(null);
    // …then persist to Supabase when configured (shared across all visitors).
    try {
      await saveProduct(clean);
      toast.success(productsRemote ? "Saved to database — live on storefront" : "Saved — live on storefront");
    } catch (e) {
      toast.error("Saved locally, but the database write failed");
    }
  };

  const doRemove = async (ids: string[]) => {
    remove(ids);
    setSelected((s) => s.filter((id) => !ids.includes(id)));
    try {
      await deleteProducts(ids);
      toast.success(`Deleted ${ids.length} product${ids.length > 1 ? "s" : ""}`);
    } catch {
      toast.error("Removed locally, but the database delete failed");
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products · edits appear instantly on the storefront`}
        action={
          <button onClick={() => setEditing(blank())} className="flex items-center gap-2 rounded-xl bg-charcoal px-4 py-2.5 text-sm font-medium text-ivory">
            <Plus size={16} /> New product
          </button>
        }
      />

      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-luxe">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-rosegold" />
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
                <input type="checkbox" className="accent-rosegold" checked={!!filtered.length && selected.length === filtered.length} onChange={(e) => setSelected(e.target.checked ? filtered.map((p) => p.id) : [])} />
              </th>
              <th className="p-3 font-medium">Product</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Stock</th>
              <th className="p-3 font-medium">Media</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const stock = stockOf(p);
              return (
                <motion.tr key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }} className="border-b border-border/60 hover:bg-muted/40">
                  <td className="p-3">
                    <input type="checkbox" className="accent-rosegold" checked={selected.includes(p.id)} onChange={(e) => setSelected((s) => (e.target.checked ? [...s, p.id] : s.filter((id) => id !== p.id)))} />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt={p.name} className="h-12 w-9 rounded-md object-cover" />
                      ) : (
                        <div className="flex h-12 w-9 items-center justify-center rounded-md bg-muted text-foreground/30">
                          <ImagePlus size={14} />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{p.name || "Untitled"}</p>
                        <p className="text-xs text-foreground/45">/{p.slug || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-foreground/60">{p.category}</td>
                  <td className="p-3 font-medium">{format(p.pricePkr)}</td>
                  <td className="p-3">
                    <span className={stock === 0 ? "text-rose-500" : stock < 5 ? "text-amber-500" : "text-foreground/60"}>{stock} units</span>
                  </td>
                  <td className="p-3">
                    <span className="flex items-center gap-2 text-xs text-foreground/55">
                      <span className="flex items-center gap-1"><ImagePlus size={13} /> {p.images.length}</span>
                      {p.video && <span className="flex items-center gap-1 text-rosegold"><Film size={13} /> 1</span>}
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

      <ProductEditor product={editing} onClose={() => setEditing(null)} onSave={save} />

      <ConfirmModal
        open={!!confirm}
        title="Delete product"
        message={`Permanently remove ${confirm?.length ?? 0} product(s)? This also removes them from the storefront.`}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm) doRemove(confirm);
          setConfirm(null);
        }}
      />
    </div>
  );
}

function ProductEditor({ product, onClose, onSave }: { product: StoreProduct | null; onClose: () => void; onSave: (p: StoreProduct) => void }) {
  const [current, setCurrent] = useState<StoreProduct | null>(product);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) setCurrent({ ...product, images: [...product.images], variants: product.variants.map((v) => ({ ...v })) });
  }, [product]);

  const update = (patch: Partial<StoreProduct>) => setCurrent((c) => (c ? { ...c, ...patch } : c));
  const updateVariant = (idx: number, patch: Partial<Variant>) =>
    setCurrent((c) => (c ? { ...c, variants: c.variants.map((v, i) => (i === idx ? { ...v, ...patch } : v)) } : c));

  const onImages = async (files: FileList | null) => {
    if (!files || !current) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        if (sizeMb(file) > MAX_IMAGE_MB) {
          toast.error(`${file.name} is over ${MAX_IMAGE_MB}MB — skipped`);
          continue;
        }
        urls.push(await uploadMedia(file, "products"));
      }
      if (urls.length) {
        update({ images: [...current.images, ...urls] });
        toast.success(`${urls.length} image(s) uploaded`);
      }
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onVideo = async (files: FileList | null) => {
    if (!files?.[0] || !current) return;
    const file = files[0];
    if (sizeMb(file) > MAX_VIDEO_MB) return toast.error(`Video is over ${MAX_VIDEO_MB}MB`);
    setUploading(true);
    try {
      update({ video: await uploadMedia(file, "videos") });
      toast.success("Video uploaded");
    } catch {
      toast.error("Video upload failed");
    } finally {
      setUploading(false);
    }
  };

  const input = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-rosegold focus:ring-2 focus:ring-rosegold/20";
  const label = "mb-1.5 block text-sm font-medium text-foreground/70";

  return (
    <Drawer
      open={!!product}
      title={product?.id ? "Edit product" : "New product"}
      onClose={onClose}
      footer={
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted">Cancel</button>
          <button
            onClick={() => {
              if (!current?.name) return toast.error("Enter a product name");
              if (!current.images.length) return toast.error("Upload at least one image");
              onSave(current);
            }}
            className="rounded-xl bg-charcoal px-6 py-2.5 text-sm font-medium text-ivory"
          >
            Save product
          </button>
        </div>
      }
    >
      {current && (
        <div className="space-y-5">
          {/* Image gallery upload */}
          <div>
            <label className={label}>Photos</label>
            <div className="flex flex-wrap gap-2">
              {current.images.map((src, i) => (
                <div key={i} className="group relative h-24 w-20 overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-cover" />
                  {i === 0 && <span className="absolute left-1 top-1 rounded bg-charcoal/80 px-1 text-[9px] text-ivory">Cover</span>}
                  <button onClick={() => update({ images: current.images.filter((_, j) => j !== i) })} className="absolute right-1 top-1 rounded-full bg-charcoal/70 p-0.5 text-ivory opacity-0 transition group-hover:opacity-100">
                    <X size={12} />
                  </button>
                </div>
              ))}
              <label className="flex h-24 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border text-[10px] text-foreground/45 hover:border-rosegold">
                <ImagePlus size={18} />
                Add
                <input type="file" accept="image/*" multiple hidden onChange={(e) => onImages(e.target.files)} />
              </label>
            </div>
          </div>

          {/* Video upload */}
          <div>
            <label className={label}>Product video (optional)</label>
            {current.video ? (
              <div className="relative overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                <video src={current.video} controls className="max-h-52 w-full bg-black object-contain" />
                <button onClick={() => update({ video: undefined })} className="absolute right-2 top-2 rounded-full bg-charcoal/70 p-1 text-ivory">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex h-20 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-xs text-foreground/45 hover:border-rosegold">
                <Film size={18} /> Upload a video (max {MAX_VIDEO_MB}MB)
                <input type="file" accept="video/*" hidden onChange={(e) => onVideo(e.target.files)} />
              </label>
            )}
          </div>

          {uploading && <p className="text-xs text-rosegold">Processing upload…</p>}

          <div>
            <label className={label}>Name</label>
            <input className={input} value={current.name} onChange={(e) => update({ name: e.target.value })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Category</label>
              <select className={input} value={current.category} onChange={(e) => update({ category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Status</label>
              <select className={input} value={current.status} onChange={(e) => update({ status: e.target.value as StoreProduct["status"] })}>
                <option value="active">Active (visible)</option>
                <option value="draft">Draft (hidden)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Badge label <span className="text-foreground/40 font-normal">(shows on card)</span></label>
              <select className={input} value={current.badge ?? ""} onChange={(e) => update({ badge: e.target.value || undefined })}>
                <option value="">None</option>
                <option value="Bestseller">Bestseller</option>
                <option value="New">New</option>
                <option value="Sale">Sale</option>
                <option value="Limited">Limited</option>
                <option value="Trending">Trending</option>
                <option value="Exclusive">Exclusive</option>
              </select>
            </div>
            <div>
              <label className={label}>Rating <span className="text-foreground/40 font-normal">(out of 5)</span></label>
              <input className={input} type="number" min="1" max="5" step="0.1" value={current.rating ?? 5} onChange={(e) => update({ rating: Number(e.target.value) })} />
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

          {/* Variants */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground/70">Variants</span>
              <button onClick={() => update({ variants: [...current.variants, { size: "", color: "", stock: 0 }] })} className="text-sm text-rosegold hover:underline">
                + Add variant
              </button>
            </div>
            <div className="space-y-2">
              {current.variants.map((v, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                  <input className={input} placeholder="Size" value={v.size} onChange={(e) => updateVariant(i, { size: e.target.value })} />
                  <input className={input} placeholder="Color" value={v.color} onChange={(e) => updateVariant(i, { color: e.target.value })} />
                  <input className={input} type="number" placeholder="Stock" value={v.stock} onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })} />
                  <button onClick={() => update({ variants: current.variants.filter((_, j) => j !== i) })} className="rounded-lg px-2 text-foreground/40 hover:text-rose-500">
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
