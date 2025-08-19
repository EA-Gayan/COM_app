import connectionToDataBase from "../../../lib/mongoose";
import { NextResponse } from "next/server";
import { withApiAuth } from "../../../lib/authMiddleware";
import Order from "../../../models/orderModel";

// Export protected route handlers
export const POST = withApiAuth(getOrdersHandler);

// POST - Retrieve orders with pagination + total count
async function getOrdersHandler(request) {
  try {
    await connectionToDataBase();

    // read JSON body directly
    const { page = 1, limit = 10, searchText } = await request.json();

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    if (searchText) {
      filter.$or = [
        { orderId: { $regex: searchText, $options: "i" } },
        { "customer.name": { $regex: searchText, $options: "i" } },
      ];
    }

    // Fetch orders
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Total count
    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    return NextResponse.json({
      success: true,
      message: "Orders retrieved successfully",
      data: {
        orders,
        pagination: {
          currentPage: page,
          totalPages,
          totalOrders,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve orders",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
