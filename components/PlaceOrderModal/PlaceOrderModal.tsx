import React, { useState } from "react";
import { PlaceOrderModalProps } from "./PlaceOrderModal.types";
import { FaWhatsapp } from "react-icons/fa";

const PlaceOrderModal: React.FC<PlaceOrderModalProps> = (props) => {
  const [name, setName] = useState("");
  const [telNo, setTelNo] = useState("");

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6 mx-2 sm:mx-0">
        <h2 className="text-xl font-semibold mb-4 text-center">
          Enter Details
        </h2>

        <div className="flex flex-col space-y-4">
          <input
            type="text"
            placeholder="Name"
            value={name}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Telephone Number"
            value={telNo}
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setTelNo(e.target.value)}
            maxLength={9}
          />
        </div>

        <div className="flex justify-between mt-6 space-x-3">
          <button
            onClick={props.onClose}
            className="flex items-center justify-center px-4 py-2 bg-green-800 text-white font-medium rounded-md hover:bg-green-900 transition w-full sm:w-auto"
          >
            <FaWhatsapp className="mr-2 text-xl" />
            WhatsApp
          </button>

          <button
            onClick={() => {
              props.onSubmit({ name, telNo: telNo });
              props.onClose();
              props.onCompleteOrder(true);
            }}
            className="px-4 py-2 bg-blue-800 text-white font-medium rounded-md hover:bg-blue-900 transition w-full sm:w-auto"
          >
            Complete Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderModal;
