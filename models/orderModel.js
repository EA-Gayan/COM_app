import mongoose from "mongoose";

// Order schema
const orderSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: { type: String },
      telNo: { type: String },
    },
    orderId: {
      type: String,
      unique: true,
      required: true,
    },
    orderStatus: {
      type: Number,
      required: true,
      default: 0, // 0 = pending, 1 = paid, 2 = shipped, etc.
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    bills: {
      total: { type: Number, required: true },
      tax: { type: Number, required: true },
      discount: { type: Number, default: 0 },
    },
    items: [
      {
        productId: { type: Number, required: true },
        name: { type: String, required: true },
        pricePerQuantity: { type: Number, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
