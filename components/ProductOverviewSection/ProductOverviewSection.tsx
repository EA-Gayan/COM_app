"use client";
import React, { useState } from "react";
import { ProductOverviewSectionProps } from "./ProductOverviewSection.types";

const ProductOverviewSection = (props: ProductOverviewSectionProps) => {
  const [searchText, setSearchText] = useState("");
  const [pageName, setPageName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [includeDiscounted, setIncludeDiscounted] = useState(false);
  const [includeReturns, setIncludeReturns] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // number of products per page
  const topProductsData = [
    {
      name: "Margherita Pizza",
      category: "Pizza",
      sales: 120,
      revenue: "1,200 SAR",
    },
    { name: "Caesar Salad", category: "Salad", sales: 80, revenue: "800 SAR" },
  ];

  const inventoryData = [
    { name: "Margherita Pizza", stock: 15 },
    { name: "Caesar Salad", stock: 50 },
  ];

  // Calculate paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = topProductsData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(topProductsData.length / itemsPerPage);

  const handlePageChange = (page: any) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  return (
    <section className="space-y-6 mt-20">
      {/* Header with Filters + Add Product */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products Overview</h1>
        <div className="flex items-center space-x-2">
          {/* Add Product Button */}
          <button
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={() => console.log("Add Product clicked")} // Replace with modal or navigation
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Main Grid for Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Products
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    PRODUCT
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    CATEGORY
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    SALING PRICE
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                    STOCK QTY
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {props.responseData?.allProducts.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.category}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {item.sellingPrice}
                    </td>
                    <td className="px-4 py-3 font-medium text-red-600">
                      {item.stockQty}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center mt-4">
            <button
              className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>

            <button
              className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Inventory Snapshot */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Inventory Snapshot
          </h3>
          <div className="space-y-3">
            {inventoryData.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-gray-600">{item.name}</span>
                <span
                  className={`font-medium ${
                    item.stock < 20 ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {item.stock} in stock
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductOverviewSection;
