"use client";

import { useEffect, useState } from "react";
import { ExpenseModalProps } from "./ExpenseModal.types";

const ExpenseModal: React.FC<ExpenseModalProps> = (props) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [_id, set_id] = useState("");

  // Prefill form if editing
  useEffect(() => {
    if (props.isEdit && props.initialData) {
      set_id(props.initialData._id || "");
      setDescription(props.initialData.description);
      setAmount(props.initialData.amount);
      setDate(props.initialData.date);
    } else {
      // reset
      setDescription("");
      setAmount("");
      setCategory("");
      setDate("");
    }
  }, [props.isEdit, props.initialData]);

  const handleSubmit = () => {
    if (!description || !amount || !date) {
      alert("Please fill in all required fields");
      return;
    }

    props.onSubmit({
      _id,
      description,
      date,
      amount: Number(amount),
    });

    props.onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg p-6 mx-2 sm:mx-0">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {props.isEdit ? "Edit Expense" : "Add Expense"}
        </h2>

        <div className="flex flex-col space-y-3">
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value ? Number(e.target.value) : "")
            }
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end mt-6 space-x-3">
          <button
            onClick={props.onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-800 text-white font-medium rounded-md hover:bg-blue-900 transition"
          >
            {props.isEdit ? "Update Expense" : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;
