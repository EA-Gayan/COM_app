import { OrderProps } from "../orders/orderPage.types";
import { Product } from "../products/productsPage.types";

interface bestSellingProducts {
  productId: string;
  productName: string;
  totalSoldQty: number;
  totalRevenue: number;
}

interface leastSellingProducts {
  productId: string;
  productName: string;
  totalSoldQty: number;
  totalRevenue: number;
}

// --- START PIE CHART ITEMS TYPES ---
interface CategoryRevenuePieChart {
  label: string;
  value: number;
  quantity: number;
  percentage: number;
}

interface ProductRevenuePieChart {
  label: string;
  value: number;
  quantity: number;
  percentage: number;
}

interface OrderValuePieChart {
  label: string;
  value: number;
  totalValue: number;
  percentage: number;
}
// --- END PIE CHART ITEMS TYPES ---

// Final PieChartData structure
interface PieChartData {
  categoryRevenue: CategoryRevenuePieChart[];
  productRevenue: ProductRevenuePieChart[];
  orderValueRanges: OrderValuePieChart[];
}

export interface dashboardResponseData {
  totalOrders: number;
  totalIncome: number;
  avgOrderValue: number;
  ordersPercentage: number;
  incomePercentage: number;
  orderList: OrderProps[];
  dateWiseIncome: [];
  barChartData: [];
  productWiseProfit: [];
  bestSellingProducts: bestSellingProducts[];
  leastSellingProducts: leastSellingProducts[];
  allProducts: Product[];
  pieChartData: PieChartData;
}
