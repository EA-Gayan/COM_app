import connectionToDataBase from "../../../lib/mongoose";
import Expenses from "../../../models/expensesModel";
import { NextResponse } from "next/server";
import { withApiAuth } from "../../../lib/authMiddleware";

// Export protected route handler
export const POST = withApiAuth(getExpensesHandler);

// POST - Retrieve expenses with optional description search and pagination
async function getExpensesHandler(request) {
  try {
    await connectionToDataBase();

    // Parse request body
    const body = await request.json();

    // Optional values
    const search = body.searchText?.trim();
    const page = body.page && body.page > 0 ? Number(body.page) : 1;
    const limit = body.limit && body.limit > 0 ? Number(body.limit) : 10;

    const filter = {};
    if (search) {
      filter.$or = [{ description: { $regex: search, $options: "i" } }];
    }

    const skip = (page - 1) * limit;

    // Query expenses
    const [expenses, totalExpenses] = await Promise.all([
      Expenses.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Expenses.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalExpenses / limit);

    const pagination = {
      currentPage: page,
      totalPages,
      totalExpenses,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return NextResponse.json({
      success: true,
      message: "Expenses retrieved successfully",
      data: { expenses, pagination },
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve expenses",
        error: error.message || "Unknown error",
        data: { expenses: [], pagination: {} },
      },
      { status: 500 }
    );
  }
}
