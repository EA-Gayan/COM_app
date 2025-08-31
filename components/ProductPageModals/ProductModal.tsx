"use client";

import { useEffect, useState } from "react";
import { ProductModalProps } from "./ProductModalTypes";
import { set } from "mongoose";

const ProductModal: React.FC<ProductModalProps> = (props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [purchasePrice, setPurchasePrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [category, setCategory] = useState("");
  const [stockQty, setStockQty] = useState<number | "">("");
  const [sName, setSName] = useState("");
  const [_id, set_id] = useState("");
  // Pre-fill form when editing
  useEffect(() => {
    if (props.isEdit && props.initialData) {
      set_id(props.initialData._id || "");
      setName(props.initialData.name);
      setDescription(props.initialData.description);
      setPurchasePrice(props.initialData.purchasePrice);
      setSellingPrice(props.initialData.sellingPrice);
      setCategory(props.initialData.category);
      setStockQty(props.initialData.stockQty);
      setSName(props.initialData.sName);
    } else {
      // Reset when adding new product
      setName("");
      setDescription("");
      setPurchasePrice("");
      setSellingPrice("");
      setCategory("");
      setStockQty("");
      setSName("");
    }
  }, [props.isEdit, props.initialData]);

  const handleSubmit = () => {
    if (
      !name ||
      !purchasePrice ||
      !sellingPrice ||
      !category ||
      !stockQty ||
      !sName
    ) {
      alert("Please fill in all required fields");
      return;
    }

    props.onSubmit({
      _id,
      name,
      description,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      category,
      stockQty: Number(stockQty),
      sName,
    });

    props.onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg p-6 mx-2 sm:mx-0">
        <h2 className="text-xl font-semibold mb-4 text-center">
          {props.isEdit ? "Edit Product" : "Add Product"}
        </h2>

        <div className="flex flex-col space-y-3">
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number"
            placeholder="Purchase Price"
            value={purchasePrice}
            onChange={(e) =>
              setPurchasePrice(e.target.value ? Number(e.target.value) : "")
            }
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="number"
            placeholder="Selling Price"
            value={sellingPrice}
            onChange={(e) =>
              setSellingPrice(e.target.value ? Number(e.target.value) : "")
            }
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {props.categoryList.map((cat, index) => (
              <option key={index} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Stock Quantity"
            value={stockQty}
            onChange={(e) =>
              setStockQty(e.target.value ? Number(e.target.value) : "")
            }
            className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Short Name"
            value={sName}
            onChange={(e) => setSName(e.target.value)}
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
            {props.isEdit ? "Update Product" : "Add Product"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
