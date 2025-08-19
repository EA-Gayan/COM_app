import connectionToDataBase from "../../../lib/mongoose";
import Product from "../../../models/productModel";
import { NextResponse } from "next/server";
import { withApiAuth } from "../../../lib/authMiddleware";

// Export protected route handlers
export const POST = withApiAuth(getProductsHandler);

// POST - Retrieve products with optional filtering (Protected)
async function getProductsHandler(request) {
  try {
    await connectionToDataBase();

    const {
      page = 1,
      limit = 9,
      category,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      minSellingPrice,
      maxSellingPrice,
    } = await request.json();

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
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
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
