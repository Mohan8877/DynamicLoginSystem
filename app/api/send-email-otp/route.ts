import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json()

    if (!email || !otp) {
      return NextResponse.json({ success: false, message: "Email and OTP required" }, { status: 400 })
    }
    

    // ✅ Create reusable transporter with Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER, // your Gmail address
        pass: process.env.SMTP_PASS, // your App Password
      },
    })

    // ✅ Email options
    const mailOptions = {
      from: `"Secure Login" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is: ${otp}. It will expire in 5 minutes.`,
      html: `<h2>🔐 Secure Login</h2>
             <p>Your OTP is: <b>${otp}</b></p>
             <p>This OTP will expire in <b>5 minutes</b>.</p>`,
    }

    // ✅ Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({ success: true, message: "OTP sent successfully" })
  } catch (error: any) {
    console.error("Error sending email OTP:", error)
    return NextResponse.json({ success: false, message: "Failed to send OTP" }, { status: 500 })
  }
}
