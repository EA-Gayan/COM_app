"use client";
import { useEffect, useState } from "react";
import { FaFileExport } from "react-icons/fa";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StatusEnum } from "../Common/enums/common_enums";
import {
  FilterRequest,
  filters,
  FilterType,
  OrderOverviewSectionProps,
} from "./OrderOverviewSection.types";

const OrderOverviewSection = (props: OrderOverviewSectionProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>();
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [filterRequest, setFilterRequest] = useState<FilterRequest | null>({
    filterType: "TODAY",
  });

  // data for chart
  const revenueData = props.responseData?.barChartData;

  useEffect(() => {
    setActiveFilter(props.filterType);
  }, []);

  const exportOrders = async (type: "income" | "expenses") => {
    try {
      let res: Response;
      let fileName = "export.xlsx";

      if (type === "expenses") {
        res = await fetch("/api/export/expenses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterRequest),
        });
        fileName = "expenses.xlsx";
      } else {
        res = await fetch("/api/export/income", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(filterRequest),
        });
        fileName = "income.xlsx";
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to export");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("Export failed:", err.message);
    }
  };

  const orderValueRanges =
    props.responseData?.pieChartData.orderValueRanges.map((item, index) => ({
      name: item.label,
      value: item.percentage, // or `item.value` depending on what you want charted
      orders: item.totalValue, // comes from API
      color: ["#6366f1", "#fbbf24", "#10b981", "#ef4444", "#3b82f6"][index % 5], // assign colors dynamically
    })) ?? [];

  const incomeExpenses =
    props.responseData?.pieChartData.incomeVsExpenses.map((item, index) => ({
      name: item.label,
      value: item.percentage, // or `item.value` depending on what you want charted
      color: ["#6366f1", "#fbbf24", "#10b981", "#ef4444", "#3b82f6"][index % 5],
    })) ?? [];

  const slowItemsData = [
    {
      item: "Vegetarian Pizza",
      category: "Pizza",
      growth: "-5%",
      revenue: "800 SAR",
    },
    {
      item: "Fish & Chips",
      category: "Main",
      growth: "-8%",
      revenue: "600 SAR",
    },
    {
      item: "Fruit Salad",
      category: "Dessert",
      growth: "-12%",
      revenue: "400 SAR",
    },
  ];

  const applyFilter = (filterType: FilterType) => {
    const payload: FilterRequest = { filterType };
    if (filterType === "FROM_TO") {
      payload.fromDate = fromDate;
      payload.toDate = toDate;
    }
    props.setActiveFilter(filterType);
    props.ordersOverviewRequestPayload(payload);
    setFilterRequest(payload);
  };

  return (
    <section className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Orders Overview</h1>
          <div className="flex space-x-2 relative">
            {filters.map((filter) => (
              <button
                key={filter.value}
                className={`px-4 py-2 text-sm rounded-md border ${
                  activeFilter === filter.value
                    ? "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
                }`}
                onClick={() => {
                  if (filter.value === "FROM_TO") {
                    setActiveFilter("FROM_TO");
                    setShowDatePicker(!showDatePicker);
                  } else {
                    setActiveFilter(filter.value);
                    setShowDatePicker(false);
                    applyFilter(filter.value);
                  }
                }}
              >
                {filter.label}
              </button>
            ))}

            {/* Dropdown Panel */}
            {showDatePicker && activeFilter === "FROM_TO" && (
              <div className="absolute top-full mt-2 left-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-64 flex flex-col space-y-3">
                <h3 className="text-md font-semibold text-gray-900 text-center">
                  Select Date Range
                </h3>

                <div className="flex flex-col space-y-2">
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">
                      From:
                    </label>
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="mt-1 px-2 py-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700">
                      To:
                    </label>
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="mt-1 px-2 py-1 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    applyFilter("FROM_TO");
                    setShowDatePicker(false);
                  }}
                  disabled={!fromDate || !toDate}
                  className={`px-4 py-2 text-sm rounded-md text-white w-full ${
                    fromDate && toDate
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Apply
                </button>

                <button
                  onClick={() => setShowDatePicker(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue</h3>
          <div className="flex items-baseline space-x-4 mb-6">
            <span className="text-sm text-gray-500">Rs</span>
            <span className="text-3xl font-bold text-gray-900">
              {props?.responseData?.totalIncome}
            </span>
            <span className="text-green-600 text-sm font-medium">
              {props.responseData?.incomePercentage !== undefined && (
                <span
                  className={`text-sm font-medium ${
                    props.responseData.ordersPercentage >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {props.responseData.incomePercentage >= 0 ? "↑" : "↓"}{" "}
                  {Math.abs(props.responseData.incomePercentage)}%
                </span>
              )}
            </span>
          </div>
          <div className="flex items-center space-x-4 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-sm"></div>
              <span>{activeFilter} income(so far)</span>
              <span className="font-medium">
                Rs.{props?.responseData?.totalIncome}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
              <span>{activeFilter} expense(so far)</span>
              <span className="font-medium">
                Rs.{props?.responseData?.totalExpenses}
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                {/* Income Bar */}
                <Bar dataKey="income" fill="#6366f1" name="Income" />

                {/* Expense Bar */}
                <Bar dataKey="expense" fill="#fbbf24" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column Stats */}
        <div className="space-y-6">
          {/* Total Orders */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Total Orders
              </h3>
              <button
                onClick={() => {
                  exportOrders("income");
                  console.log("Export clicked");
                }}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center gap-1"
              >
                <FaFileExport className="w-4 h-4" />
                Export
              </button>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-gray-900">
                {props.responseData?.totalOrders}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-sm font-medium">
                  {props.responseData?.ordersPercentage !== undefined && (
                    <span
                      className={`text-sm font-medium ${
                        props.responseData.ordersPercentage >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {props.responseData.ordersPercentage >= 0 ? "↑" : "↓"}{" "}
                      {Math.abs(props.responseData.ordersPercentage)}%
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Average Order Value */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Average Order Value
            </h3>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-bold text-gray-900">
                  {Number(props.responseData?.avgOrderValue).toFixed(2)}
                </span>
                <span className="text-sm text-gray-500 ml-1">Rs</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-sm font-medium">
                  {props.responseData?.ordersPercentage !== undefined && (
                    <span
                      className={`text-sm font-medium ${
                        props.responseData.ordersPercentage >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {props.responseData.ordersPercentage >= 0 ? "↑" : "↓"}{" "}
                      {Math.abs(props.responseData.ordersPercentage)}%
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Expenses
              </h3>{" "}
              <button
                onClick={() => {
                  exportOrders("expenses");
                  console.log("Export clicked");
                }}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200 flex items-center gap-1"
              >
                <FaFileExport className="w-4 h-4" />
                Export
              </button>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-gray-900">
                {props.responseData?.totalExpenses}
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-sm font-medium">
                  {props.responseData?.expensesPercentage !== undefined && (
                    <span
                      className={`text-sm font-medium ${
                        props.responseData.expensesPercentage >= 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {props.responseData.expensesPercentage >= 0 ? "↑" : "↓"}{" "}
                      {Math.abs(props.responseData.expensesPercentage)}%
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Orders Classification */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 py-1">
              Order Value Range
            </h3>
            {/* <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>Number of orders</option>
            </select> */}
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderValueRanges}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {orderValueRanges.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-gray-900">
                  {props.responseData?.totalOrders}
                </span>
                <span className="text-sm text-gray-500">Orders</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {orderValueRanges.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded`}
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium">
                    {item.orders} total value
                  </span>
                </div>
                <span className="text-sm font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shifts */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4 py-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Income Vs Expenses
            </h3>
            {/* <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>Value</option>
            </select> */}
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeExpenses}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {incomeExpenses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-xl font-bold text-gray-900">100%</span>
                <span className="text-sm text-gray-500">Total</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {incomeExpenses.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded`}
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold text-sm">
                    {props.responseData?.totalOrders}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Orders
                </span>
              </div>
              <span className="text-sm text-gray-600">{activeFilter}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">
                    {
                      props.responseData?.allProducts.filter(
                        (p) => p.stockQty > 0
                      ).length
                    }
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">Items</span>
              </div>
              <span className="text-sm text-gray-600">Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row - Best Sellers & Slow Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Best Sellers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Best Selling Items
            </h3>
            {/* <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>Category</option>
            </select> */}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    PRODUCT NAME
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    TOTAL SOLD QTY
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    REVENUE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {props.responseData?.bestSellingProducts.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm text-gray-500">
                          {item.productName}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-600 font-medium">
                        {item.totalSoldQty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {item.totalRevenue}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Slow Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Least Selling Items
            </h3>
            {/* <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>Category</option>
            </select> */}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    PRODUCT NAME
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    TOTAL SOLD QTY
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    REVENUE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {props.responseData?.leastSellingProducts.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.productName}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {item.totalSoldQty}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-red-600 font-medium">
                        {item.totalRevenue}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Additional Table Section */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  ORDER ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  CUSTOMER
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  ITEMS
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  TOTAL
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  TIME
                </th>
              </tr>
            </thead>
            {props.responseData?.orderList.map((i) => (
              <tbody key={i._id} className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {i?.orderId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {i.customerDetails.name !== ""
                      ? i.customerDetails.name
                      : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {i.items.map((x) => x.name).join(", ")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {i.bills.total}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      {StatusEnum[i.orderStatus]}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {i.createdAt}
                  </td>
                </tr>
              </tbody>
            ))}
          </table>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Expenses
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  DESCRIPTION
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  DATE
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">
                  AMOUNT
                </th>
              </tr>
            </thead>
            {props.responseData?.expenseList.map((i) => (
              <tbody key={i._id} className="divide-y divide-gray-200">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {i?.expenseId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {i.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{i.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {i.amount}
                  </td>
                </tr>
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </section>
  );
};

export default OrderOverviewSection;
