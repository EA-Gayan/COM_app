import connectionToDataBase from "../../../lib/mongoose";
import { NextResponse } from "next/server";
import { withApiAuth } from "../../../lib/authMiddleware";
import Order from "../../../models/orderModel";

// Export protected route handlers
export const GET = withApiAuth(getOrdersHandler);
export const POST = withApiAuth(createOrderHandler, {
  roles: ["admin", "user", "helper"],
});

// GET - Retrieve orders with pagination + total count
async function getOrdersHandler(request) {
  try {
    await connectionToDataBase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const skip = (page - 1) * limit;

    //  Fetch orders
    const orders = await Order.find()
      .populate("items.product")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    //  Total count
    const totalOrders = await Order.countDocuments();
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

// POST - Create a new order
async function createOrderHandler(request) {
  try {
    await connectionToDataBase();

    const body = await request.json();
    const { customerDetails, items, bills, orderStatus } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one order item is required" },
        { status: 400 }
      );
    }

    if (!bills?.total || bills.total <= 0) {
      return NextResponse.json(
        { success: false, message: "Order total is required" },
        { status: 400 }
      );
    }

    //  Build order object
    const newOrder = new Order({
      customerDetails: {
        name: customerDetails.name,
        telNo: customerDetails.telNo,
      },
      orderStatus: orderStatus || 0,
      bills: {
        total: bills.total,
        tax: bills.tax || 0,
        discount: bills.discount || 0,
      },
      items: items.map((item) => ({
        productId: item.productId,
        name: item.name,
        pricePerQuantity: item.pricePerQuantity,
        quantity: item.quantity,
        price: item.price,
      })),
    });

    await newOrder.save();

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: "Order created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        { success: false, message: validationErrors.join(", ") },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
