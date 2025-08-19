import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "supersecret"
);

export async function middleware(req) {
  const token = req.cookies.get("authToken")?.value;
  const { pathname } = req.nextUrl;

  // Handle API routes differently from page routes
  if (pathname.startsWith("/api/")) {
    // For API routes, we handle auth in the individual route handlers
    // This middleware just passes through
    return NextResponse.next();
  }

  // For page routes (web pages), redirect if no token
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    await jwtVerify(token, SECRET_KEY);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  // Include both page routes and API routes
  matcher: [
    "/home/:path*",
    "/orders/:path*",
    "/products/:path*",
    "/api/products/:path*", // Add this to include product API routes
    "/api/orders/:path*", // Add this to include product API routes
  ],
};
