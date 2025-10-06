import { NextResponse } from "next/server";

const USER = process.env.AUTH_USERNAME || "admin";
const PASS = process.env.AUTH_PASSWORD || "secret";
const COOKIE = process.env.AUTH_COOKIE_NAME || "simple_session";
const COOKIE_VALUE = "simple-ok";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  if (username !== USER || password !== PASS) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, COOKIE_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
