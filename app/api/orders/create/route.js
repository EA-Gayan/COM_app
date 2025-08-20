import { withApiAuth } from "../../../../lib/authMiddleware";
import connectionToDataBase from "../../../../lib/mongoose";
import Order from "../../../../models/orderModel";
import Product from "../../../../models/productModel";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

// Export protected route handlers
export const POST = withApiAuth(createOrderHandler);

async function createOrderHandler(request) {
  try {
    await connectionToDataBase();

    const body = await request.json();
    const { customerDetails, items, bills, orderStatus, isWhatsapp } = body;

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

    // Check stock availability before creating order
    for (const item of items) {
      const product = await Product.findOne({
        _id: item._id,
      });

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message: `Product with ID ${item._id} not found`,
          },
          { status: 400 }
        );
      }

      if (product.availableQty < item.quantity) {
        return NextResponse.json(
          {
            success: false,
            message: `Insufficient stock for ${product.name}. Available: ${product.availableQty}, Requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    // Build order object
    const newOrder = new Order({
      customerDetails: {
        name: customerDetails.name,
        telNo: customerDetails.tel,
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
        _id: item._id,
      })),
    });

    // Save the order
    await newOrder.save();

    // Update product stock quantities
    for (const item of items) {
      await Product.findOneAndUpdate(
        { _id: item._id },
        {
          $inc: {
            stockQty: -item.quantity,
            availableQty: -item.quantity,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully and stock updated",
        data: newOrder,
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
