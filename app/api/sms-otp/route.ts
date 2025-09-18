import { NextResponse } from "next/server";
// @ts-ignore
const twilio = require("twilio");

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    console.log("Received SMS request:", { phone, otp }); // 👈 add this

    if (!phone || !otp) {
      return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });
    }


    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );

    await client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER!, // ✅ e.g., "+1234567890"
      to: phone, // must be in format +91XXXXXXXXXX
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Twilio Error:", error);
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 });
  }
}
