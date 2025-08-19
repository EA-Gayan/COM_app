import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectionToDataBase from "./mongoose";
import User from "../models/userModel";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecret"
);

// API Authentication helper (for API routes)
export async function verifyApiAuth(request) {
  try {
    // Get token from cookies or Authorization header
    let token = request.cookies.get("authToken")?.value;

    if (!token) {
      // Check Authorization header as fallback (for Postman/API testing)
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            message: "Access denied. No token provided.",
          },
          { status: 401 }
        ),
      };
    }

    // Verify JWT token using jose (same as your middleware)
    const { payload } = await jwtVerify(token, SECRET_KEY);

    // Connect to database and get user details
    await connectionToDataBase();
    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return {
        success: false,
        error: NextResponse.json(
          {
            success: false,
            message: "User not found. Invalid token.",
          },
          { status: 401 }
        ),
      };
    }

    return {
      success: true,
      user: {
        id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("API Auth verification error:", error);

    return {
      success: false,
      error: NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token. Please login again.",
        },
        { status: 401 }
      ),
    };
  }
}

// Role-based access control
export function checkRole(userRole, allowedRoles) {
  return allowedRoles.includes(userRole);
}

// API Route wrapper for authentication
export function withApiAuth(handler, options = {}) {
  return async function (request, context) {
    const authResult = await verifyApiAuth(request);

    if (!authResult.success) {
      return authResult.error;
    }

    // Check role permissions if specified
    if (options.roles && !checkRole(authResult.user.role, options.roles)) {
      return NextResponse.json(
        {
          success: false,
          message: "Access denied. Insufficient permissions.",
        },
        { status: 403 }
      );
    }

    // Add user info to request context
    request.user = authResult.user;

    return handler(request, context);
  };
}
