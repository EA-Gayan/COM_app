"use client";

import React, { useState, useEffect } from "react";
import { FaTrash } from "react-icons/fa";
import { CartProps } from "./Cart.types";
import PlaceOrderModal from "@/components/PlaceOrderModal/PlaceOrderModal";
import { CreateOrderProps } from "@/app/orders/orderPage.types";
import { placeOrderOnSubmitData } from "@/components/PlaceOrderModal/PlaceOrderModal.types";

const Cart = (props: CartProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [completeOrder, setCompleteOrder] = useState(false);
  const [isWhatsapp, setIsWhatsapp] = useState(false);
  const [modalData, setModalData] = useState<placeOrderOnSubmitData | null>(
    null
  );
  const [createOrderData, setCreateOrderData] =
    useState<CreateOrderProps | null>(null);

  useEffect(() => {
    if (modalData && props.items.length > 0) {
      const orderData: CreateOrderProps = {
        customerDetails: {
          name: modalData.name || "",
          tel: modalData.telNo || "",
        },
        bills: {
          total: props.total,
          tax: props.vat,
          discount: props.discount,
        },
        items: props.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          pricePerQuantity: item.price,
          quantity: item.quantity,
          price: item.price * item.quantity,
          _id: item._id,
        })),
        isWhatsapp: isWhatsapp,
        orderStatus: 0,
      };

      // Send order data
      fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("Order creation failed");

          const data = await res.json();
          if (data.success && data.pdfBase64) {
            // Convert base64 to Blob
            const byteCharacters = atob(data.pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "application/pdf" });

            // Trigger download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `invoice_${data.orderId || "order"}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
          }

          // Clear cart after order is placed
          handleClearAll();

          props.onOrderComplete?.();
        })
        .catch((err) => console.error(err));
    }
  }, [modalData, props.items, props.total, props.vat, props.discount]);

  const handleClearAll = () => {
    props.onClearAll?.();
    setModalData(null);
    setCreateOrderData(null);
    setCompleteOrder(false);
    setIsWhatsapp(false);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cart</h2>
        {props.items.length > 0 && (
          <button
            className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
            onClick={handleClearAll}
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
            key={item.productId}
            className="flex justify-between items-center mb-2 border-b pb-2"
          >
            <div className="flex items-center gap-2">
              <FaTrash
                className="text-red-600 cursor-pointer hover:text-red-800"
                onClick={() => props.onRemoveItem(item.productId)}
              />
              <span>
                {item.quantity} x {item.name}
              </span>
            </div>
            <div>Rs {(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t pt-4 text-sm">
        <div className="flex justify-between">
          <span>VAT</span>
          <span>Rs {props.vat.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-green-600">
          <span>Total Amount</span>
          <span>Rs {props.total.toFixed(2)}</span>
        </div>
      </div>

      <button
        disabled={props.items.length === 0}
        className="mt-4 bg-green-800 text-white font-bold text-xl p-4 text-center rounded-lg cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        Place order
      </button>

      {/* Modal */}
      {isOpen && (
        <PlaceOrderModal
          onClose={() => setIsOpen(false)}
          onSubmit={setModalData}
          onCompleteOrder={setCompleteOrder}
          onWhatsappOrder={setIsWhatsapp}
        />
      )}
    </div>
  );
};

export default Cart;
