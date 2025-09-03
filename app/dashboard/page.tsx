"use client";
import Nav from "@/components/Helper/Navbar/Nav";
import React, { useEffect, useState } from "react";
import ProductOverviewSection from "../../components/ProductOverviewSection/ProductOverviewSection";
import OrderOverviewSection from "@/components/OrderOverviewSection/OrderOverviewSection";
import {
  FilterRequest,
  FilterType,
} from "@/components/OrderOverviewSection/OrderOverviewSection.types";
import Spinner from "@/components/Common/Spinner/Spinner";
import { dashboardResponseData } from "./dashboardPage.types";

const DashboardPage = () => {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [orderRequestPayload, setOrderRequestPayload] =
    useState<FilterRequest | null>({
      filterType: "TODAY",
    });
  const [productRequestPayload, setProductRequestPayload] = useState({});
  const [responseData, setResponseData] =
    useState<dashboardResponseData | null>(null);

  const [activeFilter, setActiveFilter] = useState<FilterType>("TODAY");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/dashboard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderRequestPayload),
      });

      const data = await res.json();
      setResponseData(data.data);

      if (!data.success) throw new Error(data.message || "Failed to fetch");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [orderRequestPayload]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navbar */}
      <div className="sticky top-0 z-10 shadow-md bg-white">
        <Nav showSearch={false} onSearchChange={(val) => setSearchText(val)} />
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {/* Dashboard Content */}
          <div className="flex-1 p-6 overflow-auto pb-10">
            {/* orders overview section */}
            <OrderOverviewSection
              ordersOverviewRequestPayload={setOrderRequestPayload}
              responseData={responseData}
              setActiveFilter={setActiveFilter}
              filterType={activeFilter}
            />

            {/* Products Overview Section */}
            {/* <ProductOverviewSection
              productOverviewRequestPayload={setProductRequestPayload}
              responseData={responseData}
            /> */}
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
