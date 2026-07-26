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
  seoTitle?: string;
  seoDescription?: string;
}

const img = (slug: string, n: 1 | 2) => `/images/products/${slug}-${n}.jpg`;

export const products: Product[] = [
  {
    id: "p101", slug: "black-floral-lawn", name: "Noir Rose Embroidered Lawn", category: "Unstitched",
    pricePkr: 4500, image: img("black-floral-lawn", 1), hoverImage: img("black-floral-lawn", 2),
    rating: 0, colors: ["#1A1A2E", "#E8B4B8"], sizes: ["Unstitched"], badge: "New",
    seoTitle: "Noir Rose Embroidered Lawn | WABIL",
    seoDescription: "3-piece unstitched lawn suit in black — heavy floral embroidery on the neckline, front and sleeves, an embroidered border patch, a dyed trouser, and a digital-printed chiffon dupatta in coral floral tones.",
  },
  {
    id: "p102", slug: "ivory-jazmin-lawn", name: "Ivory Paisley Embroidered Lawn", category: "Unstitched",
    pricePkr: 5000, image: img("ivory-jazmin-lawn", 1), hoverImage: img("ivory-jazmin-lawn", 2),
    rating: 0, colors: ["#F3EFE3", "#0B3D3C"], sizes: ["Unstitched"], badge: "New",
    seoTitle: "Ivory Paisley Embroidered Lawn | WABIL",
    seoDescription: "3-piece unstitched lawn suit in ivory with heavy multicolour paisley embroidery on the neckline, front and border, matching embroidered sleeves, a dyed teal trouser with an embroidered patch, and a digital-printed chiffon dupatta.",
  },
  {
    id: "p103", slug: "mustard-sharara", name: "Mustard Gota Sharara Suit", category: "Unstitched",
    pricePkr: 4500, image: img("mustard-sharara", 1), hoverImage: img("mustard-sharara", 2),
    rating: 0, colors: ["#B8860B"], sizes: ["Unstitched"], badge: "New",
    seoTitle: "Mustard Gota Sharara Suit | WABIL",
    seoDescription: "3-piece lawn suit in mustard with gota-embroidered neckline, embroidered sleeve and hem patches. Choice of fancy, shafoon or 4-patti dupatta.",
  },
  {
    id: "p104", slug: "teal-jequard-lawn", name: "Teal Jequard Mirror-Work Lawn", category: "Unstitched",
    pricePkr: 4300, image: img("teal-jequard-lawn", 1), hoverImage: img("teal-jequard-lawn", 2),
    rating: 0, colors: ["#0F6674"], sizes: ["Unstitched"], badge: "New",
    seoTitle: "Teal Jequard Mirror-Work Lawn | WABIL",
    seoDescription: "3-piece lawn suit in teal with heavy diagonal thread and sequin embroidery on the front and sleeves, a mirror-and-bead embellished border, and a jequard striped lawn dupatta.",
  },
  {
    id: "p105", slug: "maroon-jequard-lawn", name: "Maroon Jequard Mirror-Work Lawn", category: "Unstitched",
    pricePkr: 4300, image: img("maroon-jequard-lawn", 1), hoverImage: img("maroon-jequard-lawn", 2),
    rating: 0, colors: ["#7A1E22"], sizes: ["Unstitched"], badge: "New",
    seoTitle: "Maroon Jequard Mirror-Work Lawn | WABIL",
    seoDescription: "3-piece lawn suit in maroon with heavy diagonal thread and sequin embroidery on the front and sleeves, a mirror-and-bead embellished border, and a jequard striped lawn dupatta.",
  },
  {
    id: "p106", slug: "black-jequard-lawn", name: "Black Jequard Mirror-Work Lawn", category: "Unstitched",
    pricePkr: 4300, image: img("black-jequard-lawn", 1), hoverImage: img("black-jequard-lawn", 2),
    rating: 0, colors: ["#141414"], sizes: ["Unstitched"], badge: "New",
    seoTitle: "Black Jequard Mirror-Work Lawn | WABIL",
    seoDescription: "3-piece lawn suit in black with heavy diagonal thread and sequin embroidery on the front and sleeves, a mirror-and-bead embellished border, and a jequard striped lawn dupatta.",
  },
  {
    id: "p107", slug: "teal-peacock-net-suit", name: "Peacock Floral Net Embroidered Suit", category: "Unstitched",
    pricePkr: 5000, image: img("teal-peacock-net-suit", 1), hoverImage: img("teal-peacock-net-suit", 2),
    rating: 0, colors: ["#0C5C63"], sizes: ["Unstitched"], badge: "New",
    seoTitle: "Peacock Floral Net Embroidered Suit | WABIL",
    seoDescription: "Heavily embroidered lawn suit in peacock teal with floral vine embroidery from neckline to hem, an embroidered trouser patch, and a ready-to-wear embroidered cotton-net dupatta.",
  },
  {
    id: "p108", slug: "black-palm-floral-lawn", name: "Noir Botanical Embroidered Lawn", category: "Unstitched",
    pricePkr: 4500, image: img("black-palm-floral-lawn", 1), hoverImage: img("black-palm-floral-lawn", 2),
    rating: 0, colors: ["#111111"], sizes: ["Unstitched"], badge: "New",
    seoTitle: "Noir Botanical Embroidered Lawn | WABIL",
    seoDescription: "3-piece lawn suit in black with an elaborate multicolour botanical embroidery panel from neckline to hem. Choice of fancy, shafoon or 4-patti dupatta.",
  },
  {
    id: "p109", slug: "lavender-lace-suit", name: "Lavender Lace Applique Suit", category: "Unstitched",
    pricePkr: 5000, image: img("lavender-lace-suit", 1), hoverImage: img("lavender-lace-suit", 2),
    rating: 0, colors: ["#B9A6D9"], sizes: ["Unstitched"], badge: "New",
    seoTitle: "Lavender Lace Applique Suit | WABIL",
    seoDescription: "3-piece lawn suit in lavender with an embroidered neckline and sleeves, an appliqued floral yoke, and an embroidered trouser patch. Choice of fancy or 4-patti dupatta.",
  },
  {
    id: "p110", slug: "black-kaftan-lawn", name: "Noir Floral Kaftan Suit", category: "Unstitched",
    pricePkr: 4500, image: img("black-kaftan-lawn", 1), hoverImage: img("black-kaftan-lawn", 2),
    rating: 0, colors: ["#111111"], sizes: ["Unstitched"], badge: "New",
    seoTitle: "Noir Floral Kaftan Suit | WABIL",
    seoDescription: "Relaxed kaftan-style suit in black with an embroidered floral yoke in cream and pink, wide kimono sleeves, and matching trouser.",
  },
  {
    id: "p111", slug: "rose-print-net-suit", name: "Midnight Rose Print Net Suit", category: "Unstitched",
    pricePkr: 5000, image: img("rose-print-net-suit", 1), hoverImage: img("rose-print-net-suit", 2),
    rating: 0, colors: ["#111111"], sizes: ["Unstitched"], badge: "New",
    seoTitle: "Midnight Rose Print Net Suit | WABIL",
    seoDescription: "Digital rose-print suit in black with heavy gold-embroidered neckline and border, paired with a gold-embroidered black net dupatta.",
  },
];

export const collections = [
  { name: "Unstitched", image: img("black-floral-lawn", 1), slug: "unstitched" },
];
