import connectionToDataBase from "../../../lib/mongoose";
import { NextResponse } from "next/server";
import { withApiAuth } from "../../../lib/authMiddleware";
import Order from "../../../models/orderModel";
import Product from "../../../models/productModel";

export const POST = withApiAuth(getOrdersStatsHandler);

async function getOrdersStatsHandler(request) {
  try {
    await connectionToDataBase();

    const { filterType, fromDate, toDate } = await request.json();

    let start, end;
    const now = new Date();

    // --- Determine current period ---
    switch (filterType) {
      case "TODAY":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;

      case "THIS_WEEK":
        const day = now.getDay();
        const diffToMonday = (day + 6) % 7;
        start = new Date(now);
        start.setDate(now.getDate() - diffToMonday);
        start.setHours(0, 0, 0, 0);
        end = new Date(start);
        end.setDate(start.getDate() + 7);
        break;

      case "THIS_MONTH":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;

      case "THIS_YEAR":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear() + 1, 0, 1);
        break;

      case "FROM_TO":
        if (!fromDate || !toDate) {
          return NextResponse.json(
            { success: false, message: "FROM/TO requires fromDate and toDate" },
            { status: 400 }
          );
        }
        start = new Date(fromDate);
        end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid filter type" },
          { status: 400 }
        );
    }

    // --- Orders within current period ---
    const orders = await Order.find({
      orderDate: { $gte: start, $lt: end },
    });

    const totalOrders = orders.length;
    const totalIncome = orders.reduce(
      (sum, order) => sum + (order.bills?.total || 0),
      0
    );
    const avgOrderValue = totalOrders > 0 ? totalIncome / totalOrders : 0;

    // --- Determine previous period for percentage calculation ---
    let prevStart, prevEnd;
    switch (filterType) {
      case "TODAY":
        prevStart = new Date(start);
        prevStart.setDate(start.getDate() - 1);
        prevEnd = new Date(start);
        break;

      case "THIS_WEEK":
        prevStart = new Date(start);
        prevStart.setDate(start.getDate() - 7);
        prevEnd = new Date(start);
        break;

      case "THIS_MONTH":
        prevStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
        prevEnd = new Date(start);
        break;

      case "THIS_YEAR":
        prevStart = new Date(start.getFullYear() - 1, 0, 1);
        prevEnd = new Date(start);
        break;

      case "FROM_TO":
        const diffDays = Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
        );
        prevStart = new Date(start);
        prevStart.setDate(start.getDate() - diffDays);
        prevEnd = new Date(start);
        break;
    }

    // --- Previous period orders ---
    const prevOrders = await Order.find({
      orderDate: { $gte: prevStart, $lt: prevEnd },
    });

    const prevTotalOrders = prevOrders.length;
    const prevTotalIncome = prevOrders.reduce(
      (sum, order) => sum + (order.bills?.total || 0),
      0
    );

    // --- Fixed Percentages ---
    let ordersPercentage;
    let incomePercentage;

    if (prevTotalOrders === 0) {
      // If previous period had 0 orders
      ordersPercentage = totalOrders > 0 ? 100 : 0;
    } else {
      // Normal percentage calculation
      ordersPercentage =
        ((totalOrders - prevTotalOrders) / prevTotalOrders) * 100;
    }

    if (prevTotalIncome === 0) {
      // If previous period had 0 income
      incomePercentage = totalIncome > 0 ? 100 : 0;
    } else {
      // Normal percentage calculation
      incomePercentage =
        ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100;
    }

    // --- Date-wise income aggregation ---
    const dateWiseIncomeAgg = await Order.aggregate([
      { $match: { orderDate: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: {
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" },
            day: { $dayOfMonth: "$orderDate" },
            hour: { $hour: "$orderDate" },
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
              hour: "$_id.hour",
            },
          },
          income: 1,
        },
      },
      { $sort: { date: 1 } },
    ]);

    // --- Helper: Generate bar chart data ---
    function getChartData(filterType, dateWiseIncomeAgg, start, end) {
      const chartData = [];

      switch (filterType) {
        case "TODAY":
          // 4-hour clusters: 0-3, 4-7, 8-11, 12-15, 16-19, 20-23
          for (let cluster = 0; cluster < 24; cluster += 4) {
            const clusterStart = new Date(start);
            clusterStart.setHours(cluster, 0, 0, 0);

            const clusterEnd = new Date(start);
            clusterEnd.setHours(cluster + 4, 0, 0, 0);

            const clusterIncome = dateWiseIncomeAgg
              .filter(
                (d) =>
                  new Date(d.date) >= clusterStart &&
                  new Date(d.date) < clusterEnd
              )
              .reduce((sum, d) => sum + d.income, 0);

            chartData.push({
              label: `${cluster}:00-${cluster + 3}:59`,
              value: clusterIncome,
            });
          }
          break;

        case "THIS_WEEK":
          for (let d = 0; d < 7; d++) {
            const dayStart = new Date(start);
            dayStart.setDate(start.getDate() + d);
            dayStart.setHours(0, 0, 0, 0);

            const dayEnd = new Date(dayStart);
            dayEnd.setDate(dayStart.getDate() + 1);

            const dayIncome = dateWiseIncomeAgg
              .filter(
                (d) => new Date(d.date) >= dayStart && new Date(d.date) < dayEnd
              )
              .reduce((sum, d) => sum + d.income, 0);

            chartData.push({
              label: dayStart.toLocaleDateString("en-US", { weekday: "short" }),
              value: dayIncome,
            });
          }
          break;

        case "THIS_MONTH":
          const daysInMonth = new Date(
            start.getFullYear(),
            start.getMonth() + 1,
            0
          ).getDate();
          for (let d = 1; d <= daysInMonth; d++) {
            const dayStart = new Date(start.getFullYear(), start.getMonth(), d);
            const dayEnd = new Date(
              start.getFullYear(),
              start.getMonth(),
              d + 1
            );

            const dayIncome = dateWiseIncomeAgg
              .filter(
                (d) => new Date(d.date) >= dayStart && new Date(d.date) < dayEnd
              )
              .reduce((sum, d) => sum + d.income, 0);

            chartData.push({ label: `${d}`, value: dayIncome });
          }
          break;

        case "THIS_YEAR":
          for (let m = 0; m < 12; m++) {
            const monthStart = new Date(start.getFullYear(), m, 1);
            const monthEnd = new Date(start.getFullYear(), m + 1, 1);

            const monthIncome = dateWiseIncomeAgg
              .filter(
                (d) =>
                  new Date(d.date) >= monthStart && new Date(d.date) < monthEnd
              )
              .reduce((sum, d) => sum + d.income, 0);

            chartData.push({
              label: monthStart.toLocaleString("en-US", { month: "short" }),
              value: monthIncome,
            });
          }
          break;

        case "FROM_TO":
          let current = new Date(start);
          while (current <= end) {
            const dayStart = new Date(current);
            const dayEnd = new Date(current);
            dayEnd.setDate(current.getDate() + 1);

            const dayIncome = dateWiseIncomeAgg
              .filter(
                (d) => new Date(d.date) >= dayStart && new Date(d.date) < dayEnd
              )
              .reduce((sum, d) => sum + d.income, 0);

            chartData.push({
              label: dayStart.toLocaleDateString("en-US"),
              value: dayIncome,
            });

            current.setDate(current.getDate() + 1);
          }
          break;
      }

      return chartData;
    }

    const barChartData = getChartData(
      filterType,
      dateWiseIncomeAgg,
      start,
      end
    );

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
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
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

    // --- Best and least selling products ---
    const bestSellingAgg = await Order.aggregate([
      { $match: { orderDate: { $gte: start, $lt: end } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          totalSoldQty: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
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
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
    ]);

    const leastSellingAgg = await Order.aggregate([
      { $match: { orderDate: { $gte: start, $lt: end } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          totalSoldQty: { $sum: "$items.quantity" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
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
        },
      },
      { $sort: { totalRevenue: 1 } },
      { $limit: 10 },
    ]);

    // --- PIE CHART DATA ---

    // Product Category Revenue Distribution
    const categoryRevenuePieChart = await Order.aggregate([
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
          _id: "$productInfo.category",
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      {
        $project: {
          _id: 0,
          label: "$_id",
          value: "$totalRevenue",
          quantity: "$totalQuantity",
          percentage: {
            $round: [
              { $multiply: [{ $divide: ["$totalRevenue", totalIncome] }, 100] },
              2,
            ],
          },
        },
      },
      { $sort: { value: -1 } },
    ]);

    // Top Products Revenue Distribution (Top 8 products + Others)
    const topProductsRevenue = await Order.aggregate([
      { $match: { orderDate: { $gte: start, $lt: end } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          productName: { $first: "$items.name" },
          totalRevenue: {
            $sum: { $multiply: ["$items.quantity", "$items.price"] },
          },
          totalQuantity: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalRevenue: -1 } },
    ]);

    // Take top 8 products and group the rest as "Others"
    const top8Products = topProductsRevenue.slice(0, 8);
    const otherProductsRevenue = topProductsRevenue
      .slice(8)
      .reduce((sum, product) => sum + product.totalRevenue, 0);

    const productRevenuePieChart = top8Products.map((product) => ({
      label: product.productName,
      value: product.totalRevenue,
      quantity: product.totalQuantity,
      percentage:
        Math.round((product.totalRevenue / totalIncome) * 100 * 100) / 100,
    }));

    if (otherProductsRevenue > 0) {
      productRevenuePieChart.push({
        label: "Others",
        value: otherProductsRevenue,
        quantity: topProductsRevenue
          .slice(8)
          .reduce((sum, product) => sum + product.totalQuantity, 0),
        percentage:
          Math.round((otherProductsRevenue / totalIncome) * 100 * 100) / 100,
      });
    }

    // Order Value Range Distribution
    const orderValueRanges = [
      { min: 0, max: 50, label: "Rs 0 - Rs 50" },
      { min: 51, max: 100, label: "Rs 51 - Rs 100" },
      { min: 101, max: 200, label: "Rs 101 - Rs 200" },
      { min: 201, max: 500, label: "Rs 201 - Rs 500" },
      { min: 501, max: Infinity, label: "Rs 500+" },
    ];

    const orderValuePieChart = orderValueRanges
      .map((range) => {
        const ordersInRange = orders.filter((order) => {
          const total = order.bills?.total || 0;
          return total >= range.min && total <= range.max;
        });

        return {
          label: range.label,
          value: ordersInRange.length,
          totalValue: ordersInRange.reduce(
            (sum, order) => sum + (order.bills?.total || 0),
            0
          ),
          percentage:
            totalOrders > 0
              ? Math.round((ordersInRange.length / totalOrders) * 100 * 100) /
                100
              : 0,
        };
      })
      .filter((range) => range.value > 0); // Only include ranges with orders

    const allProducts = await Product.find().sort({ name: 1 });

    return NextResponse.json({
      success: true,
      message: "Orders and products stats retrieved successfully",
      data: {
        totalOrders,
        totalIncome,
        avgOrderValue,
        ordersPercentage: Math.round(ordersPercentage * 100) / 100, // Round to 2 decimal places
        incomePercentage: Math.round(incomePercentage * 100) / 100, // Round to 2 decimal places
        orderList: orders,
        dateWiseIncome: dateWiseIncomeAgg,
        barChartData,
        productWiseProfit: productProfitAgg,
        bestSellingProducts: bestSellingAgg,
        leastSellingProducts: leastSellingAgg,
        allProducts,
        pieChartData: {
          categoryRevenue: categoryRevenuePieChart,
          productRevenue: productRevenuePieChart,
          orderValueRanges: orderValuePieChart,
        },
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
