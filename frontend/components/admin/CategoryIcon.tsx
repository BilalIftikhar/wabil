"use client";

import {
  HeartPulse,
  Megaphone,
  ShoppingBasket,
  Shirt,
  Truck,
  Users,
  Utensils,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  shirt: Shirt,
  megaphone: Megaphone,
  users: Users,
  truck: Truck,
  "shopping-basket": ShoppingBasket,
  zap: Zap,
  utensils: Utensils,
  "heart-pulse": HeartPulse,
  wallet: Wallet,
};

export function CategoryIcon({
  name,
  size = 16,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const Icon = MAP[name] ?? Wallet;
  return <Icon size={size} className={className} />;
}
