export interface CustomerOrder {
  id: string;
  date: string;
  status: "Delivered" | "Shipped" | "Processing" | "Pending" | "Cancelled";
  totalPkr: number;
  items: { name: string; image: string; qty: number }[];
}

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=400&q=70`;

export const customerOrders: CustomerOrder[] = [
  {
    id: "WB748210",
    date: "2026-06-12",
    status: "Delivered",
    totalPkr: 27400,
    items: [
      { name: "Rose Lawn 3-Piece", image: img("photo-1490481651871-ab68de25d43d"), qty: 2 },
      { name: "Sand Cotton Casual", image: img("photo-1434389677669-e08b4cac3105"), qty: 1 },
    ],
  },
  {
    id: "WB748055",
    date: "2026-06-04",
    status: "Shipped",
    totalPkr: 18500,
    items: [{ name: "Charcoal Silk Formal", image: img("photo-1539008835657-9e8e9680c956"), qty: 1 }],
  },
  {
    id: "WB747800",
    date: "2026-05-21",
    status: "Processing",
    totalPkr: 89000,
    items: [{ name: "Zara Bridal Couture", image: img("photo-1496747611176-843222e1e57c"), qty: 1 }],
  },
];

export const STATUS_COLOR: Record<CustomerOrder["status"], string> = {
  Delivered: "#A3B18A",
  Shipped: "#C9A96E",
  Processing: "#8E9AAF",
  Pending: "#E07A5F",
  Cancelled: "#D62828",
};
