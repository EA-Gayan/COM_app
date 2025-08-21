import connectionToDataBase from "../../../lib/mongoose";
import { NextResponse } from "next/server";
import { withApiAuth } from "../../../lib/authMiddleware";
import Order from "../../../models/orderModel";
import Product from "../../../models/productModel";

export const POST = withApiAuth(getOrdersStatsHandler);

async function getOrdersStatsHandler(request) {
  try {
    await connectionToDataBase();

    const { startDate, endDate, today, week, month } = await request.json();

    let start, end;
    const now = new Date();

    if (today) {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    } else if (week) {
      // Start of week (Monday)
      const day = now.getDay(); // Sunday = 0, Monday = 1
      const diffToMonday = (day + 6) % 7;
      start = new Date(now);
      start.setDate(now.getDate() - diffToMonday);
      start.setHours(0, 0, 0, 0);

      end = new Date(start);
      end.setDate(start.getDate() + 7); // next Monday
    } else if (month) {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    } else if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      return NextResponse.json(
        { success: false, message: "Invalid date filter" },
        { status: 400 }
      );
    }

    // --- Orders within date range ---
    const orders = await Order.find({
      orderDate: { $gte: start, $lt: end },
    });

    const totalOrders = orders.length;
    const totalIncome = orders.reduce(
      (sum, order) => sum + (order.bills?.total || 0),
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalIncome / totalOrders : 0;

    // --- Date-wise income ---
    const dateWiseIncomeAgg = await Order.aggregate([
      { $match: { orderDate: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
            day: { $dayOfMonth: "$orderDate" },
          },
          income: { $sum: "$bills.total" },
        },
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day",
            },
          },
          income: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // --- Product-wise profit ---
    const productProfitAgg = await Order.aggregate([
      { $match: { orderDate: { $gte: start, $lt: end } } },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "productId",
          as: "productInfo",
        },
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          totalSoldQty: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.price" },
          purchaseCost: {
            $sum: {
              $multiply: ["$items.quantity", "$productInfo.perchasePrice"],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$_id",
          productName: 1,
          totalSoldQty: 1,
          totalRevenue: 1,
          profit: { $subtract: ["$totalRevenue", "$purchaseCost"] },
        },
      },
      { $sort: { profit: -1 } },
    ]);

    // --- All products (ignore date filter) ---
    const allProducts = await Product.find().sort({ name: 1 });

    return NextResponse.json({
      success: true,
      message: "Orders and products stats retrieved successfully",
      data: {
        totalOrders,
        totalIncome,
        avgOrderValue,
        orderList: orders,
        dateWiseIncome: dateWiseIncomeAgg,
        productWiseProfit: productProfitAgg,
        allProducts,
      },
    });
  } catch (error) {
    console.error("Get orders stats error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve orders stats",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
