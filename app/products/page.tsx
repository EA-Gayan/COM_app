"use client";

import Spinner from "@/components/Common/Spinner/Spinner";
import Nav from "@/components/Helper/Navbar/Nav";
import { useEffect, useState } from "react";
import { Pagination, Product } from "./productsPage.types";
import ProductsTable from "@/components/ProductsTable/ProductsTable";
import ProductModal from "@/components/ProductPageModals/ProductModal";
import { ModalData } from "@/components/ProductPageModals/ProductModalTypes";
import { set } from "mongoose";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [productModelOpen, setProductModelOpen] = useState(false);
  const [productData, setProductData] = useState<ModalData | null>(null);
  const [categoryList, setCategoryList] = useState<string[]>([]);

  // Page state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, limit, searchText }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch");

      setProducts(data.data.products);
      setPagination(data.data.pagination);
      setCategoryList(data.data.categoryList || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, searchText]);

  // Actions
  const handleEdit = (product: Product) => {
    console.log("Edit product:", product);
  };

  const handleDelete = (id: string) => {
    console.log("Delete product:", id);
  };

  const addProductData = (modalData: ModalData) => {
    setProductData(modalData);
    console.log("Add product:", modalData);
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-10">
        <Nav showSearch={true} onSearchChange={(val) => setSearchText(val)} />
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6 flex items-center justify-end">
          <button
            className="px-4 py-2 text-sm bg-blue-800 text-white rounded-md hover:bg-blue-900"
            onClick={() => setProductModelOpen(true)}
          >
            Add Product
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : products.length === 0 ? (
          <p>No products found</p>
        ) : (
          <ProductsTable
            products={products}
            pagination={pagination}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPageChange={setPage}
          />
        )}
      </div>

      {productModelOpen && (
        <ProductModal
          categoryList={categoryList}
          onClose={() => setProductModelOpen(false)}
          onSubmit={(productData) => addProductData(productData)}
        />
      )}
    </div>
  );
};

export default ProductsPage;
