import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: Number,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    perchasePrice: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be a positive number"],
    },
    sellingPrice: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price must be a positive number"],
    },
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
    },
    stockQty: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    availableQty: {
      type: Number,
      required: true,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    sName: {
      type: String,
      required: [true, "Product short Name is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enable auto increment for productId
productSchema.plugin(AutoIncrement, { inc_field: "productId" });

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
