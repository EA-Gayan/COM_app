import connectionToDataBase from "../../../../lib/mongoose";
import Expenses from "../../../../models/expensesModel";
import { NextResponse } from "next/server";
import { withApiAuth } from "../../../../lib/authMiddleware";

// DELETE - Remove an expense by ID (Protected - Admin only)
export const DELETE = withApiAuth(deleteExpenseHandler, {
  roles: ["admin", "user"], // only admin and user can delete
});

// PUT - Update an expense by ID (Protected - Admin/User)
export const PUT = withApiAuth(updateExpenseHandler, {
  roles: ["admin", "user"],
});

async function deleteExpenseHandler(request, { params }) {
  try {
    await connectionToDataBase();

    const { id } = params;
    const deletedExpense = await Expenses.findByIdAndDelete(id);

    if (!deletedExpense) {
      return NextResponse.json(
        { success: false, message: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Expense deleted successfully",
        data: { expense: deletedExpense },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete expense",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

async function updateExpenseHandler(request, { params }) {
  try {
    await connectionToDataBase();

    const { id } = params;
    const body = await request.json();
    const { description, amount, date } = body;

    const updatedExpense = await Expenses.findByIdAndUpdate(
      id,
      {
        ...(description && { description: description.trim() }),
        ...(amount !== undefined && { amount: parseFloat(amount) }),
        ...(date && { date }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return NextResponse.json(
        { success: false, message: "Expense not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Expense updated successfully",
        data: { expense: updatedExpense },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update expense",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
