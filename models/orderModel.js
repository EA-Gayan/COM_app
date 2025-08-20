import mongoose from "mongoose";

// Counter schema for daily increment
const counterSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true, // Ensure each date is unique
  },
  seq: { type: Number, default: 0 },
});

// Add index explicitly
counterSchema.index({ date: 1 }, { unique: true });

const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

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

// Pre-save hook to auto-generate orderId like "250820-01"
// Pre-save hook with debug logs
orderSchema.pre("validate", async function (next) {
  try {
    if (this.isNew) {
      const today = new Date();
      console.log("=== DEBUG ORDER ID GENERATION ===");
      console.log("Current date:", today);

      // Format as YYMMDD (25 for 2025, 08 for August, 20 for day)
      const year = String(today.getFullYear()).slice(-2); // Get last 2 digits of year
      const month = String(today.getMonth() + 1).padStart(2, "0"); // Month (0-11, so +1)
      const day = String(today.getDate()).padStart(2, "0"); // Day

      console.log("Year:", year);
      console.log("Month:", month);
      console.log("Day:", day);

      const datePart = `${year}${month}${day}`;
      console.log("Generated datePart:", datePart);

      // Get counter for today with proper error handling
      const counter = await Counter.findOneAndUpdate(
        { date: datePart },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      const seqNumber = String(counter.seq).padStart(2, "0");
      this.orderId = `${datePart}-${seqNumber}`;

      console.log("Final orderId:", this.orderId);
      console.log("=== END DEBUG ===");
    }
    next();
  } catch (error) {
    console.error("Error in pre-save hook:", error);
    next(error);
  }
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
