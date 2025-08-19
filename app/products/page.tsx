"use client";

import Spinner from "@/components/Common/Spinner/Spinner";
import Nav from "@/components/Helper/Navbar/Nav";
import ProductCard from "@/components/ProductCard/ProductCard";
import { useEffect, useState } from "react";
import { Pagination, Product } from "./productsPage.types";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [pageName, setPageName] = useState("");

  // Page state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/products", {
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

      setProducts(data.data.products);
      setPagination(data.data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchText]);

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-10">
        <Nav
          showSearch={true}
          onSearchChange={(val) => setSearchText(val)}
          pageType={setPageName}
        />
      </div>

      {/* Products Area */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <Spinner />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : products.length === 0 ? (
          <p>No products found</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                name={product.name}
                description={product.description}
                price={product.sellingPrice}
                imageUrl={product.imageUrl}
                availableQty={product.availableQty}
              />
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

export default ProductsPage;
