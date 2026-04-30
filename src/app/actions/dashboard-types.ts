export interface DashboardData {
  salesToday: { amount: number; orders: number };
  salesMonth: { amount: number; orders: number };
  avgTicket: number;
  lowStockCount: number;
  lowStockProducts: {
    id: number;
    name: string;
    sku: string;
    stock: number;
    minStock: number;
    mainImage: string | null;
  }[];
  chartData: { date: string; sales: number; orders: number }[];
  recentOrders: {
    id: number;
    orderNumber: string;
    customerName: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }[];
  topProducts: {
    productId: number;
    _sum: { quantity: number; subtotal: number };
    product?: { id: number; name: string; mainImage: string | null };
  }[];
  comparison: {
    revenueChange: number;
    ordersChange: number;
    currentMonthRevenue: number;
    previousMonthRevenue: number;
    currentMonthOrders: number;
    previousMonthOrders: number;
  };
}

/** U8: Order status translation map */
export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  PROCESSING: "En proceso",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado",
};
