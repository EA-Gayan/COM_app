import ResponsiveNav from "@/components/Helper/Navbar/ResponsiveNav";
import React from "react";

const ProductsPage = () => {
  return (
    <div className="flex flex-col h-screen">
      {/* Top Navbar */}
      <div className="sticky top-0 z-10">
        <ResponsiveNav />
      </div>

      {/* Content Area */}
      <div className="flex flex-1 gap-6 p-6 overflow-hidden">Products</div>
    </div>
  );
};

export default ProductsPage;
