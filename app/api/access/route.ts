import { NextRequest, NextResponse } from "next/server";
import { accessCookieName, signAccessCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  if (!verifyPassword(String(form.get("password") ?? ""))) return NextResponse.redirect(new URL("/acceso?error=1", request.url), 303);
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(accessCookieName, signAccessCookie(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return response;
}
