"use client";

import { useEffect, useState } from "react";
import Cart from "@/components/Common/Cart/Cart";
import { CartItem } from "@/components/Common/Cart/Cart.types";
import { prodctsProps } from "./homePage.types";
import Nav from "@/components/Helper/Navbar/Nav";

const Home = () => {
  const [products, setProducts] = useState<prodctsProps[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Page state
  const [searchText, setSearchText] = useState("");
  const [pageName, setPageName] = useState("");

  // Fetch products
  const getProducts = async () => {
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page: 1, limit: 10, searchText }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        setProducts(result.data.products);
      } else {
        console.error("Failed to fetch products:", result.message);
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    getProducts();
  }, [searchText]);

  // Add product to cart or increase quantity
  const handleAddToCart = (product: {
    productId: number;
    name: string;
    price: number;
    _id: string;
  }) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.productId
      );

      const productInList = products.find(
        (p) => p.productId === product.productId
      );
      const stockQty = productInList?.stockQty ?? 0;

      if (existing) {
        if (existing.quantity < stockQty) {
          return prev.map((item) =>
            item.productId === product.productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          return prev;
        }
      } else {
        if (stockQty > 0) {
          return [...prev, { ...product, quantity: 1 }];
        }
        return prev;
      }
    });
  };

  const handleRemoveItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.productId !== id));
  };

  const handleClearAll = () => {
    setCart([]);
  };

  // Update product stock after order
  const handleUpdateStockAfterOrder = () => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const cartItem = cart.find((c) => c.productId === p.productId);
        if (cartItem) {
          return { ...p, stockQty: p.stockQty - cartItem.quantity };
        }
        return p;
      })
    );
  };

  // Calculate totals
  const discount = 0;
  const vat =
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0) * 0.15; // 15% VAT
  const total =
    cart.reduce((acc, item) => acc + item.price * item.quantity, 0) +
    vat -
    discount;

  return (
    <div className="flex flex-col h-screen">
      <div className="sticky top-0 z-10">
        <Nav showSearch={true} onSearchChange={(val) => setSearchText(val)} />
      </div>

      <div className="flex flex-1 gap-6 p-6 overflow-hidden">
        <div className="flex-1 h-full overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const cartItem = cart.find(
                (item) => item.productId === product.productId
              );
              const currentQty = cartItem?.quantity ?? 0;
              const isOutOfStock = currentQty >= product.stockQty;

              return (
                <div
                  key={product.productId}
                  className={`p-8 border rounded-2xl border-black bg-white text-center text-lg font-semibold ${
                    isOutOfStock
                      ? "cursor-not-allowed bg-gray-200 opacity-50"
                      : "cursor-pointer hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    if (!isOutOfStock) {
                      handleAddToCart({
                        productId: product.productId,
                        name: product.name,
                        price: product.sellingPrice,
                        _id: product._id,
                      });
                    }
                  }}
                >
                  {product.name} <br /> Rs {product.sellingPrice.toFixed(2)}
                  <br />
                  <span className="text-sm text-red-600">
                    {isOutOfStock
                      ? "Out of Stock"
                      : `Remaining: ${product.stockQty - currentQty}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-72 bg-gray-100 p-6 rounded-2xl shadow flex flex-col">
          <Cart
            items={cart}
            discount={discount}
            vat={vat}
            total={total}
            onRemoveItem={handleRemoveItem}
            onClearAll={handleClearAll}
            onOrderComplete={handleUpdateStockAfterOrder} // <-- NEW
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
