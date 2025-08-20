"use client";

import Nav from "@/components/Helper/Navbar/Nav";
import React, { useState } from "react";

const DashboardPage = () => {
  const [searchText, setSearchText] = useState("");
  const [pageName, setPageName] = useState("");
  return (
    <div className="flex flex-col h-screen">
      {/* Top Navbar */}
      <div className="sticky top-0 z-10">
        <Nav
          showSearch={false}
          onSearchChange={(val) => setSearchText(val)}
          pageType={setPageName}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
