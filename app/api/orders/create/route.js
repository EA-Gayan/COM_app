import { withApiAuth } from "../../../../lib/authMiddleware";
import connectionToDataBase from "../../../../lib/mongoose";
import Order from "../../../../models/orderModel";
import Product from "../../../../models/productModel";
import { NextResponse } from "next/server";
import pdfService from "../../../../services/pdfService";
import { sendSMS } from "../../../../services/smsService";

// --- Helper: generate daily sequential orderId ---
async function generateOrderId() {
  const today = new Date();
  const year = String(today.getFullYear()).slice(-2);
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const datePart = `${year}${month}${day}`;

  const lastOrder = await Order.findOne({
    orderId: new RegExp(`^${datePart}-\\d{3}$`),
  }).sort({ orderId: -1 });

  let seq = 1;
  if (lastOrder) {
    const lastSeq = parseInt(lastOrder.orderId.split("-")[1], 10);
    seq = lastSeq + 1;
  }

  return `${datePart}-${String(seq).padStart(3, "0")}`;
}
// --- END Helper ---

export const POST = withApiAuth(createOrderHandler);

async function createOrderHandler(request) {
  try {
    await connectionToDataBase();
    const body = await request.json();
    const { customerDetails, items, bills, orderStatus, isSMS } = body;

    if (!items?.length) {
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

    // --- Check stock availability ---
    for (const item of items) {
      const product = await Product.findById(item._id);
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ${item._id} not found` },
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

    // --- Generate orderId ---
    const orderId = await generateOrderId();

    // --- Build order object ---
    const newOrder = new Order({
      customerDetails: {
        name: customerDetails.name,
        telNo: customerDetails.tel,
      },
      orderId,
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

    await newOrder.save();

    // --- Update product stock ---
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item._id,
        { $inc: { stockQty: -item.quantity, availableQty: -item.quantity } },
        { new: true, runValidators: true }
      );
    }

    // --- Generate PDF ---
    const pdfBuffer = await pdfService.generateBuffer(newOrder, "invoice");
    const pdfBase64 = pdfBuffer.toString("base64");

    // Add these debug lines:
    const pdfHeader = pdfBuffer.toString("ascii", 0, 4);
    console.log("PDF Header:", pdfHeader); // Should show "%PDF"

    // --- Send SMS asynchronously with simulated bold ---
    if (isSMS && customerDetails.tel) {
      // Build item details
      const itemLines = items
        .map(
          (item) =>
            `*${item.quantity} x ${item.name.toUpperCase()}* @ Rs${
              item.pricePerQuantity
            } = Rs${item.price}`
        )
        .join("\n");

      const smsMessage =
        `HELLO ${customerDetails.name.toUpperCase()}, YOUR ORDER ${orderId} IS CONFIRMED ✅ \n` +
        `${itemLines}\n` +
        `DISCOUNT: Rs${bills.discount || 0}\n` +
        `TOTAL: Rs${bills.total}`;

      await sendSMS({
        recipient: customerDetails.tel,
        message: smsMessage,
      });
    }

    // --- Return PDF as base64 in JSON ---
    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orderId: newOrder.orderId,
      pdfBase64,
    });

    // // --- Return success response ---
    // return NextResponse.json(
    //   {
    //     success: true,
    //     message: "Order created successfully",
    //     orderId: newOrder.orderId,
    //     order: newOrder,
    //   },
    //   { status: 201 }
    // );
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
