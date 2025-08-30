import connectionToDataBase from "../../../../lib/mongoose";
import Product from "../../../../models/productModel";
import { NextResponse } from "next/server";
import { withApiAuth } from "../../../../lib/authMiddleware";

// DELETE - Remove a product by ID (Protected - Admin only)
export const DELETE = withApiAuth(deleteProductHandler, {
  roles: ["admin"], // only admin can delete
});
// PUT - Update a product by ID (Protected - Admin/User)
export const PUT = withApiAuth(updateProductHandler, {
  roles: ["admin", "user"],
});

async function deleteProductHandler(request, { params }) {
  try {
    await connectionToDataBase();

    const { id } = params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product deleted successfully",
        data: { product: deletedProduct },
      },
      { status: 200 }
    );
  } catch (error) {
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

async function updateProductHandler(request, { params }) {
  try {
    await connectionToDataBase();

    const { id } = params;
    const body = await request.json();
    const {
      name,
      description,
      purchasePrice,
      sellingPrice,
      category,
      stockQty,
      sName,
    } = body;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(description && { description: description.trim() }),
        ...(purchasePrice !== undefined && { purchasePrice }),
        ...(sellingPrice !== undefined && { sellingPrice }),
        ...(category && { category: category.trim() }),
        ...(stockQty !== undefined && { stockQty }),
        ...(sName && { sName: sName.trim() }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Product updated successfully",
        data: { product: updatedProduct },
      },
      { status: 200 }
    );
  } catch (error) {
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
