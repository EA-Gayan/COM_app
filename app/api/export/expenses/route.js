import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import connectionToDataBase from "../../../../lib/mongoose";
import Expenses from "../../../../models/expensesModel";

function formatDate(d) {
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function POST(request) {
  try {
    await connectionToDataBase();

    const { filterType, fromDate, toDate } = await request.json();

    let start, end;
    const now = new Date();

    // --- Determine date range ---
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
            { success: false, message: "FROM_TO requires fromDate and toDate" },
            { status: 400 }
          );
        }
        start = new Date(fromDate);
        end = new Date(toDate);
        break;

      default:
        return NextResponse.json(
          { success: false, message: "Invalid filter type" },
          { status: 400 }
        );
    }

    // Convert start/end into YYYY-MM-DD strings
    const startStr = formatDate(start);
    const endStr = formatDate(end);

    // Fetch filtered expenses
    const expenses = await Expenses.find({
      date: { $gte: startStr, $lte: endStr },
    }).lean();

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Expenses");

    // Define headers
    worksheet.columns = [
      { header: "ID", key: "_id", width: 30 },
      { header: "Date", key: "date", width: 20 },
      { header: "Description", key: "description", width: 40 },
      { header: "Amount", key: "amount", width: 15 },
    ];

    // Fill rows
    expenses.forEach((exp) => {
      worksheet.addRow({
        _id: exp.expenseId.toString(),
        date: exp.date || "",
        description: exp.description || "",
        amount: exp.amount,
      });
    });

    // Add total row
    const total = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    worksheet.addRow({});
    worksheet.addRow({ description: "Total", amount: total });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=expenses.xlsx`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to export expenses" },
      { status: 500 }
    );
  }
}
