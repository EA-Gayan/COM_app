export interface dashboardResponseData {
  totalOrders: number;
  totalIncome: number;
  avgOrderValue: number;
  ordersPercentage: number;
  incomePercentage: number;
  orderList: [];
  dateWiseIncome: [];
  barChartData: [];
  productWiseProfit: [];
  bestSellingProducts: [];
  leastSellingProducts: [];
  allProducts: [];
}
