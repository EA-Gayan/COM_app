import connectionToDataBase from "../../../../lib/mongoose";
import User from "../../../../models/userModel";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Connect to database
    await connectionToDataBase();

    const { userName, email, password, role } = await request.json();

    // Validate input
    if (!userName || !email || !password || !role) {
      return NextResponse.json(
        {
          status: 400,
          message: "All fields are required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        {
          status: 409,
          message: "User with this email already exists!",
          success: false,
          errorStack: `ConflictError: User with this email already exists!\n    at register (register/route.js:30:7)`,
        },
        { status: 409 }
      );
    }

    // Validate role
    const validRoles = ["admin", "user", "helper"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          status: 400,
          message: "Invalid role selected!",
          success: false,
        },
        { status: 400 }
      );
    }

    // Create new user (password will be automatically hashed by the pre-save middleware)
    const newUser = new User({
      userName,
      email,
      password, // This will be hashed by the pre-save hook
      role,
    });

    // Save user to database
    const savedUser = await newUser.save();

    // Create clean user response (without password)
    const userResponse = {
      id: savedUser._id,
      userName: savedUser.userName,
      email: savedUser.email,
      role: savedUser.role,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: "User registration successful! Please sign in.",
        data: {
          user: userResponse,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

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
          errorStack: error.stack,
        },
        { status: 400 }
      );
    }

    // Handle duplicate key error (email already exists)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          status: 409,
          message: "User with this email already exists!",
          success: false,
          errorStack: error.stack,
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
        errorStack: error.stack,
      },
      { status: 500 }
    );
  }
}
