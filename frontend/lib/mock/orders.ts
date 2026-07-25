export interface CustomerOrder {
  id: string;
  date: string;
  status: "Delivered" | "Shipped" | "Processing" | "Pending" | "Cancelled";
  totalPkr: number;
  items: { name: string; image: string; qty: number }[];
}

export const customerOrders: CustomerOrder[] = [];

export const STATUS_COLOR: Record<CustomerOrder["status"], string> = {
  Delivered: "#A3B18A",
  Shipped: "#C9A96E",
  Processing: "#8E9AAF",
  Pending: "#E07A5F",
  Cancelled: "#D62828",
};
