"use client";

import Nav from "@/components/Helper/Navbar/Nav";
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
} from "recharts";

const DashboardPage = () => {
  const [searchText, setSearchText] = useState("");
  const [pageName, setPageName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeDiscounted, setIncludeDiscounted] = useState(false);
  const [includeReturns, setIncludeReturns] = useState(false);

  const ordersData = [
    { date: "2025-08-01", orders: 25, revenue: 320 },
    { date: "2025-08-02", orders: 40, revenue: 480 },
    { date: "2025-08-03", orders: 35, revenue: 410 },
    { date: "2025-08-04", orders: 55, revenue: 600 },
    { date: "2025-08-05", orders: 30, revenue: 350 },
    { date: "2025-08-06", orders: 45, revenue: 520 },
    { date: "2025-08-07", orders: 50, revenue: 640 },
  ];

  const productsData = [
    { name: "Fiction", sales: 120 },
    { name: "Non-fiction", sales: 80 },
    { name: "Comics", sales: 100 },
    { name: "Children", sales: 90 },
    { name: "Academic", sales: 150 },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navbar */}
      <div className="sticky top-0 z-10 shadow-md bg-white">
        <Nav
          showSearch={false}
          onSearchChange={(val) => setSearchText(val)}
          pageType={setPageName}
        />
      </div>

      {/* Dashboard Content */}
      <div className="p-6 space-y-8 overflow-y-auto">
        {/* Orders Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold text-blue-700">
              Total Orders
            </h3>
            <p className="text-3xl font-bold text-gray-800">1,240</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold text-blue-700">Revenue</h3>
            <p className="text-3xl font-bold text-gray-800">$15,600</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold text-blue-700">
              Avg. Order Value
            </h3>
            <p className="text-3xl font-bold text-gray-800">$45</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mt-6 mb-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
          />
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={includeDiscounted}
              onChange={(e) => setIncludeDiscounted(e.target.checked)}
              className="accent-blue-500"
            />
            Include Discounted Orders
          </label>
          <label className="flex items-center gap-2 text-gray-700">
            <input
              type="checkbox"
              checked={includeReturns}
              onChange={() => setIncludeReturns(!includeReturns)}
              className="accent-blue-500"
            />
            Include Returns
          </label>
        </div>

        {/* Orders Analytics Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            📦 Orders Analytics
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ordersData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#1D4ED8" />
                <Line type="monotone" dataKey="revenue" stroke="#3B82F6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Products Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold text-blue-700">
              Top Selling Book
            </h3>
            <p className="text-xl text-gray-800">"The Great Gatsby"</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold text-blue-700">
              Most Viewed Category
            </h3>
            <p className="text-xl text-gray-800">Fiction</p>
          </div>
          <div className="bg-white shadow-lg rounded-xl p-6 border-l-4 border-blue-500 hover:shadow-xl transition">
            <h3 className="text-lg font-semibold text-blue-700">
              Low Stock Items
            </h3>
            <p className="text-xl text-gray-800">5 Books</p>
          </div>
        </div>

        {/* Products Analytics Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition">
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            📚 Products Analytics
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#1D4ED8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
