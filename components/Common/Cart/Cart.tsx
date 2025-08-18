import React from "react";
import { FaTrash } from "react-icons/fa";
import { CartProps } from "./Cart.types";

const Cart = (props: CartProps) => {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cart</h2>
        {props.items.length > 0 && props.onClearAll && (
          <button
            className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
            onClick={props.onClearAll}
          >
            <FaTrash /> Clear All
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto max-h-[60vh]">
        {props.items.length === 0 && (
          <p className="text-gray-500">Cart is empty</p>
        )}
        {props.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center mb-2 border-b pb-2"
          >
            <div className="flex items-center gap-2">
              <FaTrash
                className="text-red-600 cursor-pointer hover:text-red-800"
                onClick={() => props.onRemoveItem(item.id)}
              />
              <span>
                {item.quantity} x {item.name}
              </span>
            </div>
            <div>£{(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-4 text-sm">
        <div className="flex justify-between">
          <span>Discount</span>
          <span>£{props.discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>VAT</span>
          <span>£{props.vat.toFixed(2)}</span>
        </div>
      </div>

      <div className="mt-4 bg-green-600 text-white font-bold text-xl p-4 text-center rounded-lg cursor-pointer">
        CHARGE £{props.total.toFixed(2)}
      </div>
    </div>
  );
};

export default Cart;
