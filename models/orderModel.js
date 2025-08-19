import mongoose from "mongoose";

// Counter schema for daily increment
const counterSchema = new mongoose.Schema({
  date: { type: String, required: true }, // e.g. "250819"
  seq: { type: Number, default: 0 },
});
const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

// Order schema
const orderSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: { type: String, trim: true },
      telNo: { type: String, trim: true },
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
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
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

// Pre-save hook to auto-generate orderId like "250819-01"
orderSchema.pre("validate", async function (next) {
  if (this.isNew) {
    const today = new Date();
    const datePart = today
      .toLocaleDateString("en-GB")
      .split("/")
      .join("")
      .slice(0, 6);

    // Get counter for today
    const counter = await Counter.findOneAndUpdate(
      { date: datePart },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const seqNumber = String(counter.seq).padStart(2, "0"); // 01, 02...
    this.orderId = `${datePart}-${seqNumber}`;
  }
  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
