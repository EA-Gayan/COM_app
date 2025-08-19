import connectionToDataBase from "../../../lib/mongoose";
import Product from "../../../models/productModel";
import { NextResponse } from "next/server";
import { withApiAuth } from "../../../lib/authMiddleware";

// Export protected route handler
export const POST = withApiAuth(getProductsHandler);

// POST - Retrieve products with optional name search and optional pagination
async function getProductsHandler(request) {
  try {
    await connectionToDataBase();

    // Parse request body
    const body = await request.json();

    // Optional values
    const search = body.searchText?.trim();
    const page = body.page ? Number(body.page) : undefined;
    const limit = body.limit ? Number(body.limit) : undefined;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } }, // search in name
        { sName: { $regex: search, $options: "i" } }, // search in short name field
      ];
    }

    let query = Product.find(filter).lean();

    let pagination = {};
    if (page && limit) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);

      // Count total documents for pagination
      const totalProducts = await Product.countDocuments(filter);
      const totalPages = Math.ceil(totalProducts / limit);

      pagination = {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    }

    const products = await query;

    return NextResponse.json({
      success: true,
      message: "Products retrieved successfully",
      data: {
        products,
        pagination,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve products",
        error: error.message || "Unknown error",
        data: { products: [], pagination: {} },
      },
      { status: 500 }
    );
  }
}
