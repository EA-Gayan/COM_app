import { OrderProps } from "../orders/orderPage.types";

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
  bestSellingProducts: [];
  leastSellingProducts: [];
  allProducts: [];
}
