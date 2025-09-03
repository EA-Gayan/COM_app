import { withApiAuth } from "../../../../lib/authMiddleware";
import connectionToDataBase from "../../../../lib/mongoose";
import Expenses from "../../../../models/expensesModel";
import { NextResponse } from "next/server";

// Export protected route handlers
export const POST = withApiAuth(createExpensesHandler, {
  roles: ["admin", "user"],
});

// POST - Create or update an expense (Protected - Admin/User only)
async function createExpensesHandler(request) {
  try {
    await connectionToDataBase();

    const body = await request.json();
    const { description, amount, date } = body;

    // Validate required fields
    if (!description || !amount) {
      return NextResponse.json(
        {
          success: false,
          message: "description and amount are required",
        },
        { status: 400 }
      );
    }

    // Validate amount
    if (isNaN(amount) || amount < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "amount must be a valid positive number",
        },
        { status: 400 }
      );
    }

    // Check if expense already exists with same description
    let existingExpense = await Expenses.findOne({
      description: description.trim(),
    });

    let savedExpenses;

    if (existingExpense) {
      // If exists, increase the amount
      existingExpense.amount += parseFloat(amount);
      savedExpenses = await existingExpense.save();
    } else {
      // Otherwise create new expense
      const newExpense = new Expenses({
        amount: parseFloat(amount),
        description: description.trim(),
        date: date || new Date().toISOString().split("T")[0],
      });
      savedExpenses = await newExpense.save();
    }

    return NextResponse.json(
      {
        success: true,
        message: existingExpense
          ? "Expense updated successfully"
          : "Expense created successfully",
        data: {
          expense: savedExpenses,
        },
      },
      { status: existingExpense ? 200 : 201 }
    );
  } catch (error) {
    console.error("Create expense error:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        {
          success: false,
          message: validationErrors.join(", "),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create expense",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
