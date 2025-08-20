import { NextResponse } from "next/server";
import { withApiAuth } from "../../../lib/authMiddleware";
import connectionToDataBase from "../../../lib/mongoose";
import Event from "../../../models/eventModel";

export const POST = withApiAuth(getEventsHandler);

async function getEventsHandler(request) {
  try {
    await connectionToDataBase();

    const { currentDate } = await request.json();

    if (!currentDate) {
      return NextResponse.json(
        { status: 400, message: "currentDate is required", success: false },
        { status: 400 }
      );
    }

    const selectedDate = new Date(currentDate);
    if (isNaN(selectedDate.getTime())) {
      return NextResponse.json(
        { status: 400, message: "Invalid date format", success: false },
        { status: 400 }
      );
    }

    // Use UTC year & month to avoid timezone issues
    const year = selectedDate.getUTCFullYear();
    const month = selectedDate.getUTCMonth(); // 0 = Jan, 7 = Aug

    const startOfMonth = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    // Query only events with startDate inside this month
    const events = await Event.find({
      startDate: { $gte: startOfMonth, $lte: endOfMonth },
    })
      .sort({ startDate: 1 })
      .lean();

    const eventsResponse = events.map((event) => ({
      id: event._id,
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      description: event.description,
      eventType: event.eventType,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        message: `Events retrieved for ${startOfMonth.toLocaleDateString(
          "en-US",
          {
            month: "long",
            year: "numeric",
          }
        )}`,
        data: { events: eventsResponse },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Events retrieval error:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        success: false,
        ...(process.env.NODE_ENV === "development" && {
          errorStack: error.stack,
        }),
      },
      { status: 500 }
    );
  }
}
