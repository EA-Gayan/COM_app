import connectionToDataBase from "../../../../lib/mongoose";
import User from "../../../../models/userModel";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectionToDataBase();

    const body = await request.json();
    const { userName, email, password, role } = body;

    if (!userName || !email || !password || !role) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = new User({ userName, email, password, role });
    await newUser.save();

    return NextResponse.json(
      {
        message: "Account created successfully!",
        user: {
          _id: newUser._id,
          userName: newUser.userName,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in registration:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
