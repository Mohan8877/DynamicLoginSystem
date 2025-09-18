import { NextResponse } from "next/server";

const otpStore: Record<string, string> = {}; // should match send route

export async function POST(req: Request) {
  const { email, otp } = await req.json();
  if (otpStore[email] === otp) {
    return NextResponse.json({ success: true, message: "OTP verified ✅" });
  }
  return NextResponse.json({ success: false, message: "Invalid OTP ❌" });
}
