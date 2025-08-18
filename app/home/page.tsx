"use client";

import { useState } from "react";
import ResponsiveNav from "@/components/Helper/Navbar/ResponsiveNav";
import Cart from "@/components/Common/Cart/Cart";
import { CartItem } from "@/components/Common/Cart/Cart.types";

// Example product list
const products = [
  { id: 1, name: "Apple Pie", price: 7.2 },
  { id: 2, name: "Caesar Salad", price: 24.0 },
  { id: 3, name: "Burger", price: 10.5 },
  { id: 4, name: "Pizza", price: 15.0 },
  { id: 5, name: "Apple Pie", price: 7.2 },
  { id: 6, name: "Caesar Salad", price: 24.0 },
  { id: 7, name: "Burger", price: 10.5 },
  { id: 8, name: "Pizza", price: 15.0 },
  { id: 9, name: "Apple Pie", price: 7.2 },
  { id: 10, name: "Caesar Salad", price: 24.0 },
  { id: 11, name: "Burger", price: 10.5 },
  { id: 12, name: "Pizza", price: 15.0 },
  { id: 13, name: "Apple Pie", price: 7.2 },
  { id: 14, name: "Caesar Salad", price: 24.0 },
  { id: 15, name: "Burger", price: 10.5 },
  { id: 16, name: "Pizza", price: 15.0 },
];

const Home = () => {
  const [cart, setCart] = useState<CartItem[]>([]);

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
                key={product.id}
                className="p-8 border border-black bg-white text-center text-lg font-semibold cursor-pointer hover:bg-gray-100"
                onClick={() => handleAddToCart(product)}
              >
                {product.name} <br /> £{product.price.toFixed(2)}
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
