import connectionToDataBase from "../../../../lib/mongoose";
import Product from "../../../../models/productModel";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { withApiAuth } from "../../../../lib/authMiddleware";

// GET - Retrieve a single product by ID (Protected)
async function getProductHandler(request, { params }) {
  try {
    await connectionToDataBase();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product retrieved successfully",
      data: {
        product,
      },
    });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// Export protected route handlers
export const GET = withApiAuth(getProductHandler);
export const PUT = withApiAuth(updateProductHandler, {
  roles: ["admin", "user"],
});
export const DELETE = withApiAuth(deleteProductHandler, { roles: ["admin"] });

// PUT - Update a product by ID (Protected - Admin/User only)
async function updateProductHandler(request, { params }) {
  try {
    await connectionToDataBase();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updateData = { ...body };

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    // Validate purchase price if provided
    if (updateData.perchasePrice !== undefined) {
      if (isNaN(updateData.perchasePrice) || updateData.perchasePrice < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Purchase price must be a valid positive number",
          },
          { status: 400 }
        );
      }
      updateData.perchasePrice = parseFloat(updateData.perchasePrice);
    }

    // Validate selling price if provided
    if (updateData.sellingPrice !== undefined) {
      if (isNaN(updateData.sellingPrice) || updateData.sellingPrice < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Selling price must be a valid positive number",
          },
          { status: 400 }
        );
      }
      updateData.sellingPrice = parseFloat(updateData.sellingPrice);
    }

    // Validate stockQty if provided
    if (updateData.stockQty !== undefined) {
      if (isNaN(updateData.stockQty) || updateData.stockQty < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Stock quantity must be a valid non-negative number",
          },
          { status: 400 }
        );
      }
      updateData.stockQty = parseInt(updateData.stockQty);
    }

    // Validate availableQty if provided
    if (updateData.availableQty !== undefined) {
      if (isNaN(updateData.availableQty) || updateData.availableQty < 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Available quantity must be a valid non-negative number",
          },
          { status: 400 }
        );
      }
      updateData.availableQty = parseInt(updateData.availableQty);
    }

    // Trim string fields
    if (updateData.name) updateData.name = updateData.name.trim();
    if (updateData.description)
      updateData.description = updateData.description.trim();
    if (updateData.category) updateData.category = updateData.category.trim();

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: {
        product: updatedProduct,
      },
    });
  } catch (error) {
    console.error("Update product error:", error);

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
        message: "Failed to update product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product by ID (Protected - Admin only)
async function deleteProductHandler(request, { params }) {
  try {
    await connectionToDataBase();

    const { id } = params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID",
        },
        { status: 400 }
      );
    }

    // Hard delete - permanently remove the product
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted permanently",
      data: {
        deletedProduct: {
          id: deletedProduct._id,
          name: deletedProduct.name,
          deletedAt: new Date().toISOString(),
        },
      },
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete product",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
