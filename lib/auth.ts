import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "estival_access";
const secret = () => process.env.ACCESS_COOKIE_SECRET ?? "development-only-secret";
export const accessCookieName = COOKIE;

export function verifyPassword(password: string) {
  const expected = process.env.ACCESS_PASSWORD;
  if (!expected) return process.env.NODE_ENV !== "production";
  const left = Buffer.from(password);
  const right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function signAccessCookie() {
  const payload = `authorized:${Math.floor(Date.now() / 86_400_000)}`;
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("hex")}`;
}

export function verifyAccessCookie(value?: string) {
  if (!value) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
