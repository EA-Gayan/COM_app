import { withApiAuth } from "../../../../lib/authMiddleware";
import connectionToDataBase from "../../../../lib/mongoose";
import { NextResponse } from "next/server";
import Event from "../../../../models/eventModel";

export const POST = withApiAuth(createEventHandler);

async function createEventHandler(request) {
  try {
    // Connect to database
    await connectionToDataBase();

    const { title, startDate, endDate, description, eventType } =
      await request.json();

    // Validate required fields (end is also required based on your model)
    if (!title || !startDate || !endDate || !description || !eventType) {
      return NextResponse.json(
        {
          status: 400,
          message:
            "All fields (title, startDate, endDate, description, type) are required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Additional validation for dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        {
          status: 400,
          message: "Invalid date format for start or end date",
          success: false,
        },
        { status: 400 }
      );
    }
    // Create new event
    const newEvent = new Event({
      title,
      startDate: start,
      endDate: end,
      description,
      eventType,
    });

    // Save event to database
    const savedEvent = await newEvent.save();

    // Create response with all relevant data including MongoDB _id
    const eventResponse = {
      id: savedEvent._id,
      title: savedEvent.title,
      start: savedEvent.startDate,
      end: savedEvent.endDate,
      description: savedEvent.description,
      eventType: savedEvent.eventType,
      createdAt: savedEvent.createdAt,
      updatedAt: savedEvent.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Event created successfully",
        data: {
          event: eventResponse,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Event creation error:", error);

    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return NextResponse.json(
        {
          status: 400,
          message: validationErrors.join(", "),
          success: false,
          // Remove errorStack in production
          ...(process.env.NODE_ENV === "development" && {
            errorStack: error.stack,
          }),
        },
        { status: 400 }
      );
    }

    // Handle duplicate key errors (if you add unique constraints later)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          status: 409,
          message: "Event with this data already exists",
          success: false,
        },
        { status: 409 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        status: 500,
        message: "Internal server error",
        success: false,
        // Only show error stack in development
        ...(process.env.NODE_ENV === "development" && {
          errorStack: error.stack,
        }),
      },
      { status: 500 }
    );
  }
}
