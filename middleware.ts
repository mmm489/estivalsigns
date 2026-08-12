import { NextRequest, NextResponse } from "next/server";
import { accessCookieName, verifyAccessCookie } from "@/lib/auth";

export function middleware(request: NextRequest) {
  if (!process.env.ACCESS_PASSWORD || process.env.NODE_ENV !== "production") return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/api/cron/")) return NextResponse.next();
  if (request.nextUrl.pathname === "/acceso" || request.nextUrl.pathname === "/api/access") return NextResponse.next();
  if (!verifyAccessCookie(request.cookies.get(accessCookieName)?.value)) return NextResponse.redirect(new URL("/acceso", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|og.png).*)"] };
