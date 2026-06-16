export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  pricePkr: number;
  comparePkr?: number;
  image: string;
  hoverImage: string;
  rating: number;
  colors: string[];
  sizes: string[];
  badge?: string;
}

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

export const products: Product[] = [
  {
    id: "1", slug: "rose-lawn-3pc", name: "Rose Lawn 3-Piece", category: "Unstitched",
    pricePkr: 8900, comparePkr: 11900, image: img("photo-1490481651871-ab68de25d43d"),
    hoverImage: img("photo-1525507119028-ed4c629a60a3"), rating: 4.8,
    colors: ["#F4C2C2", "#C9A96E", "#1A1A2E"], sizes: ["S", "M", "L"], badge: "Bestseller",
  },
  {
    id: "2", slug: "charcoal-silk", name: "Charcoal Silk Formal", category: "Formal",
    pricePkr: 18500, image: img("photo-1539008835657-9e8e9680c956"),
    hoverImage: img("photo-1515372039744-b8f02a3ae446"), rating: 4.9,
    colors: ["#1A1A2E", "#C9A96E"], sizes: ["S", "M", "L", "XL"], badge: "New",
  },
  {
    id: "3", slug: "blush-chiffon", name: "Blush Chiffon Party", category: "Party",
    pricePkr: 14200, comparePkr: 16900, image: img("photo-1483985988355-763728e1935b"),
    hoverImage: img("photo-1469334031218-e382a71b716b"), rating: 4.7,
    colors: ["#F4C2C2", "#FAFAFA"], sizes: ["S", "M", "L"],
  },
  {
    id: "4", slug: "zara-bridal", name: "Zara Bridal Couture", category: "Bridal",
    pricePkr: 89000, comparePkr: 110000, image: img("photo-1496747611176-843222e1e57c"),
    hoverImage: img("photo-1502716119720-b23a93e5fe1b"), rating: 5.0,
    colors: ["#C9A96E", "#F4C2C2"], sizes: ["Custom"], badge: "Couture",
  },
  {
    id: "5", slug: "ivory-formal", name: "Ivory Embroidered", category: "Formal",
    pricePkr: 22500, image: img("photo-1487412720507-e7ab37603c6f"),
    hoverImage: img("photo-1485968579580-b6d095142e6e"), rating: 4.6,
    colors: ["#FAFAFA", "#C9A96E"], sizes: ["S", "M", "L"],
  },
  {
    id: "6", slug: "emerald-velvet", name: "Emerald Velvet Winter", category: "Winter",
    pricePkr: 26900, comparePkr: 31000, image: img("photo-1591047139829-d91aecb6caea"),
    hoverImage: img("photo-1551803091-e20673f15770"), rating: 4.8,
    colors: ["#2d6a4f", "#C9A96E"], sizes: ["M", "L", "XL"], badge: "Limited",
  },
  {
    id: "7", slug: "midnight-organza", name: "Midnight Organza", category: "Party",
    pricePkr: 19900, image: img("photo-1469504512102-900f29606341"),
    hoverImage: img("photo-1502716119720-b23a93e5fe1b"), rating: 4.5,
    colors: ["#1A1A2E", "#8E9AAF"], sizes: ["S", "M", "L"],
  },
  {
    id: "8", slug: "sand-cotton", name: "Sand Cotton Casual", category: "Casual",
    pricePkr: 6900, comparePkr: 8500, image: img("photo-1434389677669-e08b4cac3105"),
    hoverImage: img("photo-1485462537746-965f33f7f6a7"), rating: 4.4,
    colors: ["#C9A96E", "#FAFAFA"], sizes: ["S", "M", "L", "XL"],
  },
];

export const collections = [
  { name: "Bridal", image: products[3].image, slug: "bridal" },
  { name: "Formal", image: products[1].image, slug: "formal" },
  { name: "Party", image: products[2].image, slug: "party" },
  { name: "Unstitched", image: products[0].image, slug: "unstitched" },
];
