"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"
import { auth } from "@/lib/firebase"  // ✅ make sure you create this file

const SOUTH_INDIAN_STATES = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"]

interface LocationData {
  state: string
  theme: "light" | "dark"
  otpMethod: "email" | "mobile"
}

export default function DynamicLoginPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [locationData, setLocationData] = useState<LocationData>({
    state: "Unknown",
    theme: "dark",
    otpMethod: "mobile",
  })
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")
  const [otpTarget, setOtpTarget] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null)
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [currentTime, setCurrentTime] = useState("")

  const { toast } = useToast()

  // 🕒 Time updater
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hour = now.getHours()
      setCurrentTime(`${hour}:00 - ${hour + 1}:00`)
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  // 📍 Location fetch
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError)
    } else {
      toast({
        title: "Geolocation Error",
        description: "Geolocation not supported. Using defaults.",
        variant: "destructive",
      })
      applySettings()
    }
  }, [])

  // ⏳ OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (otpCountdown === 0 && generatedOtp) {
      setGeneratedOtp(null)
      toast({
        title: "OTP Expired",
        description: "Previous OTP expired. Please request a new one.",
        variant: "destructive",
      })
    }
  }, [otpCountdown, generatedOtp])

  const handleLocationSuccess = (position: GeolocationPosition) => {
    const { latitude, longitude } = position.coords
    reverseGeocode(latitude, longitude)
  }

  const handleLocationError = (error: GeolocationPositionError) => {
    toast({
      title: "Location Error",
      description: "Could not get location. Using defaults.",
      variant: "destructive",
    })
    applySettings()
  }

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`
      const response = await fetch(apiUrl)
      if (!response.ok) throw new Error("Failed to fetch location data")

      const data = await response.json()
      const state = data.address?.state || "Unknown"
      applySettings(state)
    } catch {
      applySettings()
    }
  }

  const applySettings = (state = "Unknown") => {
    const currentHour = new Date().getHours()
    const isSouthIndia = SOUTH_INDIAN_STATES.includes(state)

    const isMorningWindow = currentHour >= 10 && currentHour < 12
    const theme = isSouthIndia && isMorningWindow ? "light" : "dark"
    const otpMethod = isSouthIndia ? "email" : "mobile"

    setLocationData({ state, theme, otpMethod })
    if (theme === "light") {
      document.documentElement.classList.remove("dark")
    } else {
      document.documentElement.classList.add("dark")
    }
    setIsLoading(false)
  }

  // 📲 Send OTP
  const handleSendOtp = async () => {
    if (locationData.otpMethod === "email") {
      if (!otpTarget.includes("@")) {
        toast({ title: "Invalid Email", description: "Enter valid email.", variant: "destructive" })
        return
      }
      const otp = Math.floor(1000 + Math.random() * 9000).toString()
      setGeneratedOtp(otp)
      setShowOtpInput(true)
      setOtpCountdown(30)
      toast({ title: "OTP Sent", description: `An OTP was sent to email: ${otpTarget}` })
      console.log("Email OTP:", otp)
    } else {
      if (!otpTarget.startsWith("+91")) {
        toast({ title: "Invalid Mobile", description: "Use format: +91XXXXXXXXXX", variant: "destructive" })
        return
      }
      try {
        if (!(window as any).recaptchaVerifier) {
          (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "invisible",
          })
        }
        const appVerifier = (window as any).recaptchaVerifier
        const confirmationResult = await signInWithPhoneNumber(auth, otpTarget, appVerifier)
        ;(window as any).confirmationResult = confirmationResult
        setShowOtpInput(true)
        setOtpCountdown(60)
        toast({ title: "OTP Sent", description: `An OTP was sent to mobile: ${otpTarget}` })
      } catch (error: any) {
        toast({ title: "SMS Error", description: error.message, variant: "destructive" })
      }
    }
  }

  // ✅ Verify OTP
  const handleLogin = async () => {
    if (!username) {
      toast({ title: "Username Required", description: "Enter a username.", variant: "destructive" })
      return
    }

    if (locationData.otpMethod === "email") {
      if (otpCode === generatedOtp) {
        setIsLoggedIn(true)
        toast({ title: "Login Successful", description: "Welcome!" })
      } else {
        toast({ title: "Invalid OTP", description: "Wrong OTP entered.", variant: "destructive" })
      }
    } else {
      try {
        const result = await (window as any).confirmationResult.confirm(otpCode)
        if (result.user) {
          setIsLoggedIn(true)
          toast({ title: "Login Successful", description: "Welcome!" })
        }
      } catch {
        toast({ title: "Invalid OTP", description: "Wrong OTP entered.", variant: "destructive" })
      }
    }
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername("")
    setOtpTarget("")
    setOtpCode("")
    setShowOtpInput(false)
    setGeneratedOtp(null)
    setOtpCountdown(0)
  }

  // ⏳ Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <CardTitle className="text-2xl font-bold text-center">Personalizing Your Experience</CardTitle>
            <p className="text-muted-foreground text-center">
              Please allow location access in your browser to continue...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ✅ Logged-in screen
  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-2xl">
          <CardContent className="text-center p-8 space-y-6">
            <h1 className="text-4xl font-bold text-primary">Welcome!</h1>
            <p className="text-lg text-muted-foreground">You have successfully logged in.</p>
            <Button onClick={handleLogout} size="lg">Logout</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 🔐 Login form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Secure Login</CardTitle>
          <p className="text-muted-foreground text-center">
            Theme & login method set based on your location and time.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="otp-target">
              {locationData.otpMethod === "email" ? "Email for OTP" : "Mobile Number for OTP"}
            </Label>
            <div className="flex">
              <Input
                id="otp-target"
                type={locationData.otpMethod === "email" ? "email" : "tel"}
                placeholder={locationData.otpMethod === "email" ? "you@example.com" : "+91 98765 43210"}
                value={otpTarget}
                onChange={(e) => setOtpTarget(e.target.value)}
                className="rounded-r-none"
                required
              />
              <Button type="button" onClick={handleSendOtp} disabled={otpCountdown > 0} className="rounded-l-none">
                {otpCountdown > 0 ? `${otpCountdown}s` : showOtpInput ? "Resend OTP" : "Send OTP"}
              </Button>
            </div>
          </div>

          {showOtpInput && (
            <div className="space-y-2">
              <Label htmlFor="otp-code">Enter OTP Code</Label>
              <Input
                id="otp-code"
                type="text"
                placeholder="4-digit code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                required
              />
            </div>
          )}

          {/* reCAPTCHA container (only used for mobile OTP) */}
          {locationData.otpMethod === "mobile" && <div id="recaptcha-container"></div>}

          <Button onClick={handleLogin} className="w-full">Login</Button>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Session Details:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Time: <span className="font-medium">{currentTime}</span></li>
                <li>Location: <span className="font-medium">{locationData.state}</span></li>
                <li>Theme: <span className="font-medium">{locationData.theme}</span></li>
                <li>OTP Method: <span className="font-medium">{locationData.otpMethod}</span></li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
