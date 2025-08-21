import connectionToDataBase from "../../../../lib/mongoose";
import Order from "../../../../models/orderModel";
import { withApiAuth } from "../../../../lib/authMiddleware";
import pdfService from "../../../../services/pdfService";
import { NextResponse } from "next/server";

export const POST = withApiAuth(downloadOrderHandler);

async function downloadOrderHandler(request) {
  try {
    await connectionToDataBase();

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "orderId is required" },
        { status: 400 }
      );
    }

    // --- Find order by id ---
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 }
      );
    }

    // --- Generate PDF using order data ---
    const pdfBuffer = await pdfService.generateBuffer(order, "invoice");

    // --- Return PDF with orderId as filename ---
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${order.orderId}.pdf`,
      },
    });
  } catch (error) {
    console.error("receipt download error:", error);

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
        message: "Failed to download receipt",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
