"use client";
import Nav from "@/components/Helper/Navbar/Nav";
import React, { useState } from "react";

import ProductOverviewSection from "../../components/ProductOverviewSection/ProductOverviewSection";
import OrderOverviewSection from "@/components/OrderOverviewSection/OrderOverviewSection";

const DashboardPage = () => {
  const [searchText, setSearchText] = useState("");
  const [pageName, setPageName] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // number of products per page

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
      <div className="flex-1 p-6 overflow-auto">
        {/* orders overview section */}
        <OrderOverviewSection />

        {/* Products Overview Section */}

        <ProductOverviewSection />
      </div>
    </div>
  );
};

export default DashboardPage;
