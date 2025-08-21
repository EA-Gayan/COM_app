import { withApiAuth } from "../../../../lib/authMiddleware";
import connectionToDataBase from "../../../../lib/mongoose";
import Product from "../../../../models/productModel";
import { NextResponse } from "next/server";

// Export protected route handlers
export const POST = withApiAuth(createProductHandler, {
  roles: ["admin", "user"],
});

// POST - Create a new product (Protected - Admin/User only)
async function createProductHandler(request) {
  try {
    await connectionToDataBase();

    const body = await request.json();
    const {
      name,
      description,
      perchasePrice,
      sellingPrice,
      category,
      stockQty,
      sName,
    } = body;

    // Validate required fields
    if (!name || !perchasePrice || !sellingPrice || !category || !sName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Name, purchase price, selling price, and category are required",
        },
        { status: 400 }
      );
    }

    // Check if product already exists with same name and category
    const existingProduct = await Product.findOne({
      name: name.trim(),
      category: category.trim(),
      sName: sName.trim(),
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A product with the same name,short name and category already exists",
        },
        { status: 400 }
      );
    }

    // Validate purchase price
    if (isNaN(perchasePrice) || perchasePrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Purchase price must be a valid positive number",
        },
        { status: 400 }
      );
    }

    // Validate selling price
    if (isNaN(sellingPrice) || sellingPrice < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Selling price must be a valid positive number",
        },
        { status: 400 }
      );
    }

    // Validate stockQty if provided
    if (stockQty !== undefined && (isNaN(stockQty) || stockQty < 0)) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock quantity must be a valid non-negative number",
        },
        { status: 400 }
      );
    }

    // Create new product
    const newProduct = new Product({
      name: name.trim(),
      description: description?.trim() || "",
      perchasePrice: parseFloat(perchasePrice),
      sellingPrice: parseFloat(sellingPrice),
      category: category.trim(),
      stockQty: stockQty || 0,
      initialQty: stockQty,
      sName: sName.trim(),
    });

    const savedProduct = await newProduct.save();

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: {
          product: savedProduct,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);

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
        message: "Failed to create product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
