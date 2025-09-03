import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import connectionToDataBase from "../../../../lib/mongoose";
import Order from "../../../../models/orderModel";

export async function POST(request) {
  try {
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

    await connectionToDataBase();

    // --- Fetch orders within range ---
    const orders = await Order.find({
      orderDate: { $gte: start, $lt: end },
    }).lean();

    if (!orders.length) {
      return NextResponse.json({ success: false, message: "No data found" });
    }

    // --- Create Excel workbook ---
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Income");

    // Header row
    worksheet.columns = [
      { header: "Order ID", key: "orderId", width: 20 },
      { header: "Customer Name", key: "customerName", width: 25 },
      { header: "Order Date", key: "orderDate", width: 20 },
      { header: "Total", key: "total", width: 15 },
      { header: "Tax", key: "tax", width: 15 },
      { header: "Discount", key: "discount", width: 15 },
      { header: "Net Income", key: "netIncome", width: 15 },
    ];

    // Add rows
    orders.forEach((o) => {
      worksheet.addRow({
        orderId: o.orderId,
        customerName: o.customerDetails?.name || "",
        orderDate: new Date(o.orderDate).toLocaleString(),
        total: o.bills.total,
        tax: o.bills.tax,
        discount: o.bills.discount,
        netIncome: o.bills.total + o.bills.tax - o.bills.discount,
      });
    });

    // Format header
    worksheet.getRow(1).font = { bold: true };

    // --- Return as file ---
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="income_${filterType}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("Error generating Excel:", err);
    return NextResponse.json(
      { success: false, message: "Failed to generate Excel" },
      { status: 500 }
    );
  }
}
