"use client";
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
const OrderOverviewSection = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeDiscounted, setIncludeDiscounted] = useState(false);
  const [includeReturns, setIncludeReturns] = useState(false);
  // Sample data for charts
  const revenueData = [
    { day: "Sun", thisWeek: 8, lastWeek: 6 },
    { day: "Mon", thisWeek: 9, lastWeek: 7 },
    { day: "Tue", thisWeek: 8, lastWeek: 6 },
    { day: "Wed", thisWeek: 7, lastWeek: 5 },
    { day: "Thu", thisWeek: 6, lastWeek: 4 },
    { day: "Fri", thisWeek: 8, lastWeek: 6 },
    { day: "Sat", thisWeek: 7, lastWeek: 5 },
  ];

  const ordersClassification = [
    { name: "Cashier", value: 50, orders: 187, color: "#6366f1" },
    { name: "Delivery", value: 25, orders: 94, color: "#fbbf24" },
    { name: "Cancelled", value: 25, orders: 93, color: "#10b981" },
  ];

  const shiftsData = [
    { name: "First", value: 50, amount: "2850 SAR", color: "#fbbf24" },
    { name: "Second", value: 25, amount: "1425 SAR", color: "#6366f1" },
    { name: "Third", value: 25, amount: "1425 SAR", color: "#10b981" },
  ];

  const bestSellersData = [
    {
      item: "Margherita Pizza",
      category: "Pizza",
      growth: "+15%",
      revenue: "2,500 SAR",
    },
    {
      item: "Pepperoni Pizza",
      category: "Pizza",
      growth: "+12%",
      revenue: "2,200 SAR",
    },
    {
      item: "Caesar Salad",
      category: "Salad",
      growth: "+8%",
      revenue: "1,800 SAR",
    },
    {
      item: "Garlic Bread",
      category: "Sides",
      growth: "+5%",
      revenue: "1,200 SAR",
    },
  ];

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

  return (
    <section className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Orders Overview</h1>
          <div className="flex space-x-2">
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50">
              TODAY
            </button>
            <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
              THIS WEEK
            </button>
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50">
              THIS MONTH
            </button>
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50">
              THIS QUARTER
            </button>
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50">
              THIS YEAR
            </button>
            <button className="px-4 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-600 hover:bg-gray-50">
              FROM/TO
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue</h3>
          <div className="flex items-baseline space-x-4 mb-6">
            <span className="text-3xl font-bold text-gray-900">40,200</span>
            <span className="text-sm text-gray-500">SAR</span>
            <span className="text-green-600 text-sm font-medium">↑ 13.8%</span>
          </div>
          <div className="flex items-center space-x-4 mb-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-indigo-600 rounded-sm"></div>
              <span>This week (so far)</span>
              <span className="font-medium">40K SAR</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
              <span>Last week</span>
              <span className="font-medium">32K SAR</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="thisWeek" fill="#6366f1" />
                <Bar dataKey="lastWeek" fill="#fbbf24" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column Stats */}
        <div className="space-y-6">
          {/* Total Orders */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total Orders
            </h3>
            <div className="flex items-baseline justify-between">
              <span className="text-3xl font-bold text-gray-900">374</span>
              <span className="text-green-600 text-sm font-medium">
                ↑ 13.8%
              </span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This week</span>
                <span className="font-medium">374</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last week</span>
                <span className="font-medium">291</span>
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
                <span className="text-3xl font-bold text-gray-900">15</span>
                <span className="text-sm text-gray-500 ml-1">SAR</span>
              </div>
              <span className="text-red-600 text-sm font-medium">↓ 2%</span>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">This week</span>
                <span className="font-medium">15 SAR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Last week</span>
                <span className="font-medium">16 SAR</span>
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
            <h3 className="text-lg font-semibold text-gray-900">
              Orders Classification
            </h3>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>Number of orders</option>
            </select>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersClassification}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {ordersClassification.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-gray-900">374</span>
                <span className="text-sm text-gray-500">Orders</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {ordersClassification.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded`}
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium">
                    {item.orders} Orders
                  </span>
                </div>
                <span className="text-sm font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Shifts */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Shifts</h3>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>Value</option>
            </select>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="relative w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={shiftsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    dataKey="value"
                  >
                    {shiftsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-gray-900">5700</span>
                <span className="text-sm text-gray-500">SAR</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {shiftsData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded`}
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                  <span className="text-sm font-medium">{item.amount}</span>
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
                    298
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Orders
                </span>
              </div>
              <span className="text-sm text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold text-sm">
                    76
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Completed
                </span>
              </div>
              <span className="text-sm text-gray-600">Today</span>
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
              Best Sellers
            </h3>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>Category</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    MENU ITEM
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    GROWTH
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    REVENUE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bestSellersData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.item}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-600 font-medium">
                        {item.growth}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {item.revenue}
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
            <h3 className="text-lg font-semibold text-gray-900">Slow Items</h3>
            <select className="text-sm border border-gray-300 rounded px-2 py-1">
              <option>Category</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    MENU ITEM
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    GROWTH
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    REVENUE
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {slowItemsData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.item}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.category}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-red-600 font-medium">
                        {item.growth}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900">
                        {item.revenue}
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
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  #12345
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  Ahmed Al-Rashid
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  2x Margherita Pizza, 1x Caesar Salad
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  85 SAR
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">2:30 PM</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  #12346
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  Sarah Mohammed
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  1x Pepperoni Pizza, 2x Garlic Bread
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  65 SAR
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                    Preparing
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">2:45 PM</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  #12347
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">Omar Hassan</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  3x Vegetarian Pizza
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  120 SAR
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Out for Delivery
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">3:00 PM</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default OrderOverviewSection;
