import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const AutoIncrement = AutoIncrementFactory(mongoose);

const expensesSchema = new mongoose.Schema(
  {
    expenseId: {
      type: Number,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "amount cannot be negative"],
      default: 0,
    },
    date: {
      type: String,
      default: new Date().toISOString().split("T")[0], // YYYY-MM-DD
    },
  },
  {
    timestamps: true,
  }
);

// Enable auto increment for expenseId
expensesSchema.plugin(AutoIncrement, { inc_field: "expenseId" });

const Expenses =
  mongoose.models.Expenses || mongoose.model("Expenses", expensesSchema);

export default Expenses;
