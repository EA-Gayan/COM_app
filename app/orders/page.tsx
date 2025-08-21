"use client";

import { StatusEnum } from "@/components/Common/enums/common_enums";
import Spinner from "@/components/Common/Spinner/Spinner";
import Nav from "@/components/Helper/Navbar/Nav";
import { useEffect, useState } from "react";
import { OrderProps, Pagination } from "./orderPage.types";
import { FaDownload } from "react-icons/fa";

const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderProps[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [pageName, setPageName] = useState("");

  // Page state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          page,
          limit,
          searchText,
        }),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Failed to fetch");

      setOrders(data.data.orders);
      setPagination(data.data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, searchText]);

  const getStatusLabel = (status: number) => {
    switch (status) {
      case StatusEnum.COMPLETE:
        return "Completed";
      case StatusEnum.INPROGRESS:
        return "Pending";
      case StatusEnum.OVERDUE:
        return "Overdue";
      default:
        return "Unknown";
    }
  };

  const handleDownload = async (_Id: string, orderId: string) => {
    try {
      const res = await fetch("/api/orders/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: _Id }),
      });

      if (!res.ok) throw new Error("Failed to download invoice");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(err);
      alert("Failed to download invoice");
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-10">
        <Nav
          showSearch={true}
          onSearchChange={(val) => setSearchText(val)}
          pageType={setPageName}
        />
      </div>

      {/* Orders Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : orders.length === 0 ? (
          <p>No orders found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="relative border rounded-lg p-4 shadow-sm bg-white"
              >
                {/* Download Icon */}
                <button
                  onClick={() => handleDownload(order._id, order.orderId)}
                  className="absolute top-2 right-2 text-blue-800 hover:text-blue-950"
                  title="Download Invoice"
                >
                  <FaDownload size={18} />
                </button>

                <h3 className="font-semibold text-lg text-gray-800">
                  Order #{order.orderId}
                </h3>
                <p className="text-sm text-gray-500">
                  Customer: {order?.customerDetails?.name}
                </p>
                <p className="text-sm text-gray-500">
                  Status:{" "}
                  <span
                    className={`font-medium bold ${
                      order.orderStatus === 0
                        ? "text-green-600"
                        : order.orderStatus === 1
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {getStatusLabel(order.orderStatus)}
                  </span>
                </p>
                <p className="text-medium font-bold text-green-800">
                  Total: Rs {order?.bills?.total}
                </p>

                {/* Items Preview */}
                <div className="mt-3">
                  <h4 className="font-medium text-gray-700">Items:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {order.items.slice(0, 3).map((item, idx) => (
                      <li key={idx}>
                        {item.name} x {item.quantity}
                      </li>
                    ))}
                    {order.items.length > 3 && (
                      <li className="text-gray-400">
                        + {order.items.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && (
          <div className="flex justify-center gap-4 mt-6">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 rounded-md bg-blue-800 text-white 
               hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="px-4 py-2 disabled:opacity-50">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-md bg-blue-800 text-white 
               hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
