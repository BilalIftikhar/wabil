"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Star } from "lucide-react";
import { Typewriter } from "@/components/store/Typewriter";
import { ProductCard } from "@/components/store/ProductCard";
import { Reveal } from "@/components/ui/Reveal";
import { collections } from "@/lib/mock/products";
import { activeProducts, useProducts } from "@/store/useProducts";

const testimonials: { name: string; text: string; city: string }[] = [];

export default function HomePage() {
  const trending = activeProducts(useProducts((s) => s.products)).slice(0, 8);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <div>
      {/* Hero with parallax + typewriter */}
      <section ref={heroRef} className="relative flex h-[88vh] items-center justify-center overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/products/lavender-lace-suit-1.jpg"
            alt="WABIL lookbook"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/30 via-charcoal/20 to-charcoal/60" />
        </motion.div>

        <motion.div style={{ opacity }} className="relative z-10 max-w-3xl px-6 text-center text-ivory">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-3 text-sm uppercase tracking-[0.3em] text-blush"
          >
            WABIL — Premium Ladies Suits
          </motion.p>
          <h1 className="font-heading text-5xl font-semibold leading-tight sm:text-7xl">
            <Typewriter words={["Elegant Suits", "Bridal Collection", "New Arrivals"]} />
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-ivory/80">Dress Like Royalty.</p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex justify-center gap-4"
          >
            <Link href="/shop" className="rounded-full bg-ivory px-8 py-3 font-medium text-charcoal transition hover:bg-blush">
              Shop Collection
            </Link>
            <Link href="/categories/unstitched" className="rounded-full border border-ivory/60 px-8 py-3 font-medium text-ivory transition hover:bg-ivory/10">
              Unstitched Collection
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Featured collections */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <Reveal className="mb-10 text-center">
          <h2 className="font-heading text-4xl font-semibold">Featured Collections</h2>
          <p className="mt-2 text-foreground/55">Curated edits for every occasion</p>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((c, i) => (
            <Reveal key={c.slug} delay={i * 0.08}>
              <Link href={`/categories/${c.slug}`} className="group relative block aspect-[3/4] overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-charcoal/30 transition group-hover:bg-charcoal/45" />
                <span className="absolute bottom-5 left-5 font-heading text-2xl font-semibold text-ivory">{c.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Trending products */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <Reveal className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="font-heading text-4xl font-semibold">Trending Now</h2>
            <p className="mt-2 text-foreground/55">Most-loved pieces this season</p>
          </div>
          <Link href="/shop" className="text-sm font-medium text-rosegold hover:underline">
            View all →
          </Link>
        </Reveal>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="bg-charcoal py-20 text-ivory">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal className="mb-10 text-center">
              <h2 className="font-heading text-4xl font-semibold">Loved by Royalty</h2>
            </Reveal>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.1}>
                  <div className="h-full rounded-2xl border border-ivory/10 bg-ivory/5 p-6">
                    <div className="mb-3 flex gap-0.5 text-rosegold">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <Star key={j} size={16} className="fill-rosegold" />
                      ))}
                    </div>
                    <p className="text-ivory/85">“{t.text}”</p>
                    <p className="mt-4 text-sm font-medium text-rosegold">
                      {t.name} · {t.city}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
