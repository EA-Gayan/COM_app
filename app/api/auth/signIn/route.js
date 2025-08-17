import connectionToDataBase from "../../../../lib/mongoose";
import User from "../../../../models/userModel";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Connect to database
    await connectionToDataBase();

    const { email, password } = await request.json();
    console.log(email, password);
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          status: 400,
          message: "Email and password are required",
          success: false,
        },
        { status: 400 }
      );
    }

    // Find user with email and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        {
          status: 404,
          message: "User not found with this email!",
          success: false,
        },
        { status: 404 }
      );
    }

    // Check password using the model's comparePassword method
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          status: 401,
          message: "Invalid password!",
          success: false,
          errorStack: `UnauthorizedError: Invalid password!\n    at login (signin/route.js:45:7)`,
        },
        { status: 401 }
      );
    }

    // Remove password from response (create clean user object)
    const userResponse = {
      id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({
      success: true,
      message: "User Login successful!",
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    console.error("Sign in error:", error);

    // Handle specific mongoose/validation errors
    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          status: 400,
          message: "Validation error: " + error.message,
          success: false,
          errorStack: error.stack,
        },
        { status: 400 }
      );
    }

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
