import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const otpStore: Record<string, string> = {}; // temp in-memory

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  const { email } = await req.json();
  const otp = generateOtp();

  otpStore[email] = otp; // store temporarily

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It expires in 5 minutes.`,
  });

  return NextResponse.json({ success: true, message: "OTP sent" });
}
