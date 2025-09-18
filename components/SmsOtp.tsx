"use client";

import { useState } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
// Your firebase.ts file should export 'auth'
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  // your config here
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// other exports if any
export default function PhoneOtp() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Setup reCAPTCHA
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
    return (window as any).recaptchaVerifier;
  };

  // Send OTP
  const sendOTP = async () => {
    try {
      const appVerifier = setupRecaptcha();
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
      alert("OTP sent!");
    } catch (error) {
      console.error("SMS not sent", error);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    try {
      if (!confirmationResult) return;
      await confirmationResult.confirm(otp);
      alert("Phone number verified ✅");
    } catch (error) {
      alert("Invalid OTP ❌");
    }
  };

  return (
    <div className="p-4 border rounded">
      <input
        type="text"
        placeholder="Enter phone number (+91...)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 m-2"
      />
      <button onClick={sendOTP} className="bg-blue-500 text-white p-2">
        Send OTP
      </button>

      <div id="recaptcha-container"></div> {/* required */}

      <div className="mt-4">
        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="border p-2 m-2"
        />
        <button onClick={verifyOTP} className="bg-green-500 text-white p-2">
          Verify OTP
        </button>
      </div>
    </div>
  );
}
