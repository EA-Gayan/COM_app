import { Expense } from "../expenses/expensesPage.types";
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

interface incomeVsExpensesPieChart {
  label: string;
  value: number;
  percentage: number;
}
// --- END PIE CHART ITEMS TYPES ---

// Final PieChartData structure
interface PieChartData {
  categoryRevenue: CategoryRevenuePieChart[];
  productRevenue: ProductRevenuePieChart[];
  orderValueRanges: OrderValuePieChart[];
  incomeVsExpenses: incomeVsExpensesPieChart[];
}

export interface dashboardResponseData {
  totalOrders: number;
  totalIncome: number;
  totalExpenses: number;
  avgOrderValue: number;
  ordersPercentage: number;
  incomePercentage: number;
  expensesPercentage: number;
  orderList: OrderProps[];
  expenseList: Expense[];
  dateWiseIncome: [];
  barChartData: [];
  productWiseProfit: [];
  bestSellingProducts: bestSellingProducts[];
  leastSellingProducts: leastSellingProducts[];
  allProducts: Product[];
  pieChartData: PieChartData;
}
