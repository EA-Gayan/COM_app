import connectionToDataBase from "../../../lib/mongoose";
import Product from "../../../models/productModel";
import { NextResponse } from "next/server";
import { withApiAuth } from "../../../lib/authMiddleware";

// GET - Retrieve all products with optional filtering (Protected)
async function getProductsHandler(request) {
  try {
    await connectionToDataBase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 9;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const minSellingPrice = searchParams.get("minSellingPrice");
    const maxSellingPrice = searchParams.get("maxSellingPrice");

    // Build filter object
    const filter = {};

    if (category) {
      filter.category = { $regex: category, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (minSellingPrice || maxSellingPrice) {
      filter.sellingPrice = {};
      if (minSellingPrice)
        filter.sellingPrice.$gte = parseFloat(minSellingPrice);
      if (maxSellingPrice)
        filter.sellingPrice.$lte = parseFloat(maxSellingPrice);
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get products with pagination
    const products = await Product.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      success: true,
      message: "Products retrieved successfully",
      data: {
        products,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Export protected route handlers
export const GET = withApiAuth(getProductsHandler);
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
      availableQty,
    } = body;

    // Validate required fields
    if (!name || !perchasePrice || !sellingPrice || !category) {
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
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "A product with the same name and category already exists",
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

    // Validate availableQty if provided
    if (
      availableQty !== undefined &&
      (isNaN(availableQty) || availableQty < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Available quantity must be a valid non-negative number",
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
      availableQty: availableQty || 0,
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
