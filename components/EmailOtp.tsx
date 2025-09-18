"use client";
import { useState } from "react";

export default function EmailOtp() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);

  const sendOtp = async () => {
    await fetch("/api/email-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setStep(2);
    alert("OTP sent to " + email);
  };

  const verifyOtp = async () => {
    const res = await fetch("/api/email-otp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    alert(data.message);
  };

  return (
    <div className="p-4">
      <h2>📧 Email OTP</h2>
      {step === 1 && (
        <>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2"
          />
          <button onClick={sendOtp} className="bg-blue-500 text-white p-2 m-2">
            Send OTP
          </button>
        </>
      )}
      {step === 2 && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border p-2"
          />
          <button onClick={verifyOtp} className="bg-green-500 text-white p-2 m-2">
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
}
