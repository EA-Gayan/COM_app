"use client";

import { useEffect, useState } from "react";
import ResponsiveNav from "@/components/Helper/Navbar/ResponsiveNav";
import Cart from "@/components/Common/Cart/Cart";
import { CartItem } from "@/components/Common/Cart/Cart.types";
import { prodctsProps, productPageProps } from "./homePage.types";

const Home = () => {
  const [products, setProduts] = useState<prodctsProps[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const getProducts = async () => {
      const response = await fetch("/api/products", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      setProduts(data.data.products);
    };

    getProducts();
  }, []);

  // Add product to cart or increase quantity
  const handleAddToCart = (product: {
    id: number;
    name: string;
    price: number;
  }) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  // Remove single item from cart
  const handleRemoveItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear all items from cart
  const handleClearAll = () => {
    setCart([]);
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
      {/* Top Navbar */}
      <div className="sticky top-0 z-10">
        <ResponsiveNav />
      </div>

      {/* Content Area */}
      <div className="flex flex-1 gap-6 p-6 overflow-hidden">
        {/* Left Side - Products */}
        <div className="flex-1 h-full overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.productId}
                className="p-8 border rounded-2xl border-black bg-white text-center text-lg font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() =>
                  handleAddToCart({
                    id: product.productId,
                    name: product.name,
                    price: product.sellingPrice,
                  })
                }
              >
                {product.name} <br /> Rs {product.sellingPrice.toFixed(2)}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="w-72 bg-gray-100 p-6 rounded-2xl shadow flex flex-col">
          <Cart
            items={cart}
            discount={discount}
            vat={vat}
            total={total}
            onRemoveItem={handleRemoveItem}
            onClearAll={handleClearAll}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
