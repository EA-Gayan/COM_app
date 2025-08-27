import { OrderProps } from "../orders/orderPage.types";

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
  allProducts: [];
}
