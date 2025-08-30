"use client";

import Spinner from "@/components/Common/Spinner/Spinner";
import Nav from "@/components/Helper/Navbar/Nav";
import ProductModal from "@/components/ProductPageModals/ProductModal";
import { ModalData } from "@/components/ProductPageModals/ProductModalTypes";
import ProductsTable from "@/components/ProductsTable/ProductsTable";
import { useEffect, useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { Pagination, Product } from "./productsPage.types";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [productModelOpen, setProductModelOpen] = useState(false);
  const [productData, setProductData] = useState<ModalData | null>(null);
  const [categoryList, setCategoryList] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState<{
    id: string;
    name: string;
  } | null>(null);

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

  // Triggered from ProductsTable when user clicks delete
  const confirmDelete = (id: string, name: string) => {
    setDeleteInfo({ id, name });
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteInfo) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${deleteInfo.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        // refresh list
        fetchProducts();
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
      setShowConfirm(false);
      setDeleteInfo(null);
    }
  };

  const addProductData = async (modalData: ModalData) => {
    setProductData(modalData);
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modalData),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to add product");
      }

      // Close modal
      setProductModelOpen(false);
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      // Refresh current page but stay on it
      fetchProducts();
    }
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
            onDelete={confirmDelete}
            onPageChange={setPage}
          />
        )}
      </div>

      {productModelOpen && (
        <ProductModal
          categoryList={categoryList}
          onClose={() => setProductModelOpen(false)}
          onSubmit={addProductData}
        />
      )}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h2 className="text-sm text-gray-700 mb-4 flex items-start gap-2">
              <FaExclamationTriangle className="text-yellow-600 text-xl mt-0.5" />
              <span>
                Are you sure you want to delete{" "}
                <span className="font-semibold">{deleteInfo?.name}</span>?
              </span>
            </h2>
            <div className="flex justify-end gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
                onClick={() => setShowConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded bg-blue-700 text-white hover:bg-blue-800 transition"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
