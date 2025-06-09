"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Loader2, Shield, Mail, MapPinIcon } from "lucide-react"
import UserIntentModal from "@/components/user-intent-modal"
import { toast } from "@/components/ui/use-toast"
import contentConfig from "@/config/contentConfig" // This import should now work

export default function Home() {
  const { isAuthenticated, user, sendOTP, verifyOTP } = useAuth()
  const router = useRouter()
  const [showIntentModal, setShowIntentModal] = useState(false)
  const [userIntent, setUserIntent] = useState<"hire" | "job" | null>(null)

  // Authentication states
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Contact form states
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  })
  const [contactFormErrors, setContactFormErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
  })

  const validateContactForm = () => {
    const errors = { firstName: "", lastName: "", email: "", phone: "", message: "" }
    let isValid = true

    if (!contactForm.firstName.trim()) {
      errors.firstName = "First name is required."
      isValid = false
    }
    if (!contactForm.lastName.trim()) {
      errors.lastName = "Last name is required."
      isValid = false
    }
    if (!contactForm.email.trim()) {
      errors.email = "Email is required."
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(contactForm.email)) {
      errors.email = "Email is invalid."
      isValid = false
    }
    if (!contactForm.phone.trim()) {
      errors.phone = "Phone number is required."
      isValid = false
    } else if (!/^\d{10}$/.test(contactForm.phone.replace(/\D/g, ""))) {
      errors.phone = "Phone number must be 10 digits."
      isValid = false
    }
    if (!contactForm.message.trim()) {
      errors.message = "Message is required."
      isValid = false
    }
    setContactFormErrors(errors)
    return isValid
  }

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateContactForm()) {
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon!",
      })
      setContactForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      })
      setContactFormErrors({ firstName: "", lastName: "", email: "", phone: "", message: "" })
    } else {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form.",
        variant: "destructive",
      })
    }
  }

  // Always show intent modal for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      const savedIntent = localStorage.getItem("kaamsathi-user-intent")
      if (savedIntent) {
        setUserIntent(savedIntent as "hire" | "job")
      } else {
        const timer = setTimeout(() => {
          setShowIntentModal(true)
        }, 500)
        return () => clearTimeout(timer)
      }
    }
  }, [isAuthenticated])

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/dashboard")
    }
  }, [isAuthenticated, user, router])

  const handleIntentSelection = (intent: "hire" | "job") => {
    localStorage.setItem("kaamsathi-user-intent", intent)
    setUserIntent(intent)
    setShowIntentModal(false)
  }

  const handleCloseModal = () => {
    return
  }

  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive",
      })
      return
    }

    setIsSendingOtp(true)
    try {
      const result = await sendOTP(phoneNumber)
      if (result.success) {
        setIsOtpSent(true)
        toast({
          title: "OTP Sent",
          description: "A 6-digit verification code has been sent to your phone number.",
        })
      } else {
        toast({
          title: "Failed to send OTP",
          description: result.error || "Please try again later",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSendingOtp(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const otpString = otp.join("")
    if (otpString.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive",
      })
      return
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms & Conditions",
        description: "Please agree to the terms and conditions to continue",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      const result = await verifyOTP(phoneNumber, otpString)
      if (result.success) {
        toast({
          title: "Login Successful",
          description: `Welcome ${result.user?.name || "to KaamSathi"}!`,
        })
      } else {
        toast({
          title: "Verification Failed",
          description: result.error || "Invalid OTP. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const handleChangeIntent = () => {
    localStorage.removeItem("kaamsathi-user-intent")
    setUserIntent(null)
    setShowIntentModal(true)
  }

  // Don't render the landing page if user is authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  // Show loading state until intent is determined
  if (!userIntent && !showIntentModal) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading KaamSathi...</p>
        </div>
      </div>
    )
  }

  const config = contentConfig[userIntent || "hire"]

  return (
    <div className="min-h-screen bg-white">
      {/* User Intent Modal */}
      <UserIntentModal isOpen={showIntentModal} onClose={handleCloseModal} onSelect={handleIntentSelection} />

      {/* Header - Restored with proper navigation */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <span className="font-bold text-xl text-gray-900">KaamSathi</span>
            </Link>

            {/* Right side buttons - Restored the missing text */}
            <div className="flex items-center space-x-4">
              <a href={config.headerLink} className="text-blue-600 hover:text-blue-700 font-medium hidden sm:block">
                {config.headerText} →
              </a>
              <Button
                onClick={handleChangeIntent}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6"
              >
                {userIntent === "hire" ? "Worker Login" : "Employer Login"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Improved responsive design */}
      <section className="relative min-h-[600px] sm:min-h-[700px] lg:min-h-[800px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={config.backgroundImage || "/placeholder.svg?width=1920&height=1080&text=Hero+Background"}
            fill
            alt="Hero background"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[500px] sm:min-h-[600px]">
            {/* Left side - Hero content */}
            <div className="text-white order-2 lg:order-1">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                {config.heroTitle}
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-200">{config.heroSubtitle}</p>
            </div>

            {/* Right side - Responsive Login/Signup Card */}
            <div className="order-1 lg:order-2 lg:ml-auto w-full">
              <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 xl:p-12 shadow-2xl max-w-lg w-full mx-auto">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                  {config.loginTitle}
                </h2>

                {!isOtpSent ? (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Mobile Number Input */}
                    <div className="space-y-2">
                      <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                        Mobile Number
                      </label>
                      <div className="flex">
                        <div className="flex items-center px-3 sm:px-4 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg">
                          <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1 sm:mr-2" />
                          <span className="text-sm sm:text-base text-gray-600">+91</span>
                        </div>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="Your Mobile Number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="rounded-l-none border-l-0 focus:border-l text-base sm:text-lg py-3 sm:py-4 lg:py-6"
                          disabled={isSendingOtp}
                          maxLength={10}
                          aria-label="Mobile Number"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleSendOTP}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-4 text-base sm:text-lg font-medium rounded-xl"
                      disabled={phoneNumber.length !== 10 || isSendingOtp}
                      aria-live="polite"
                    >
                      {isSendingOtp ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        "Get OTP"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Shield Icon */}
                    <div className="flex justify-center mb-4 sm:mb-6">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-2xl flex items-center justify-center">
                        <Shield className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500" />
                      </div>
                    </div>

                    {/* Verify Your Number */}
                    <div className="text-center space-y-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Verify Your Number</h3>
                      <p className="text-sm sm:text-base text-gray-600">Enter the 6-digit code sent to</p>
                      <p className="text-orange-500 font-semibold text-sm sm:text-base">+91 {phoneNumber}</p>
                    </div>

                    {/* OTP Input Boxes - Responsive */}
                    <div className="flex justify-center space-x-2 sm:space-x-3">
                      {otp.map((digit, index) => (
                        <Input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ""))}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-center text-lg sm:text-xl font-semibold border-2 rounded-xl"
                          maxLength={1}
                          aria-label={`OTP digit ${index + 1}`}
                        />
                      ))}
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                        className="mt-1"
                        aria-label="Agree to terms and conditions"
                      />
                      <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                        I agree to the{" "}
                        <a href="#terms" className="text-blue-600 hover:underline">
                          Terms & Conditions
                        </a>{" "}
                        and{" "}
                        <a href="#privacy" className="text-blue-600 hover:underline">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    {/* Verify Button */}
                    <Button
                      onClick={handleVerifyOTP}
                      disabled={otp.join("").length !== 6 || !agreedToTerms || isVerifying}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-4 text-base sm:text-lg font-medium rounded-xl"
                      aria-live="polite"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Continue"
                      )}
                    </Button>

                    {/* Change Mobile Number */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsOtpSent(false)
                        setOtp(["", "", "", "", "", ""])
                      }}
                      className="w-full py-3 sm:py-4 text-base sm:text-lg rounded-xl"
                    >
                      Change Mobile Number
                    </Button>

                    {/* Demo OTP */}
                    <div className="text-center">
                      <span className="inline-flex items-center bg-green-100 text-green-800 text-xs sm:text-sm px-3 py-1 rounded-full">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Demo: Use OTP 123456
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Overlapping Statistics Cards - Responsive */}
        <div className="absolute bottom-0 left-0 right-0 z-20 transform translate-y-1/2">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {config.stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4`}
                  >
                    <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${stat.iconColor}`} aria-hidden="true" />
                  </div>
                  <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for overlapping cards - Responsive */}
      <div className="h-12 sm:h-16 lg:h-20 bg-gray-50"></div>

      {/* How It Works Section - Responsive */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">How KaamSathi Works</h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              {userIntent === "hire"
                ? "Find and hire local workers in just 3 simple steps"
                : "Get hired for daily wage work in just 3 simple steps"}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            {userIntent === "hire" ? (
              <>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl sm:text-2xl font-bold text-orange-500">1</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Post Your Job</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Describe your work requirements and daily wage budget
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl sm:text-2xl font-bold text-blue-500">2</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Review Local Workers</h3>
                  <p className="text-sm sm:text-base text-gray-600">Browse profiles of workers in your area</p>
                </div>
                <div className="text-center sm:col-span-2 md:col-span-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl sm:text-2xl font-bold text-green-500">3</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Hire & Pay</h3>
                  <p className="text-sm sm:text-base text-gray-600">Connect with workers and pay for completed work</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl sm:text-2xl font-bold text-orange-500">1</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Create Profile</h3>
                  <p className="text-sm sm:text-base text-gray-600">Showcase your skills and work experience</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl sm:text-2xl font-bold text-blue-500">2</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Find Local Jobs</h3>
                  <p className="text-sm sm:text-base text-gray-600">Browse daily wage jobs in your area</p>
                </div>
                <div className="text-center sm:col-span-2 md:col-span-1">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-xl sm:text-2xl font-bold text-green-500">3</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Work & Earn</h3>
                  <p className="text-sm sm:text-base text-gray-600">Complete work and receive daily payments</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Contact Section - Responsive */}
      <section className="py-12 sm:py-16 bg-slate-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Left side - Contact Info */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Get in Touch</h2>
              <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8">
                Have questions? We're here to help you succeed.
              </p>

              <div className="space-y-4 sm:space-y-6">
                {/* Email */}
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">Email</h3>
                    <p className="text-sm sm:text-base text-gray-300">support@kaamsathi.com</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">Phone</h3>
                    <p className="text-sm sm:text-base text-gray-300">+91 98765 43210</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">Address</h3>
                    <p className="text-sm sm:text-base text-gray-300">Mumbai, Maharashtra, India</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Contact Form */}
            <div className="bg-slate-700 rounded-2xl p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Send us a Message</h3>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-firstName" className="sr-only">
                      First Name
                    </label>
                    <Input
                      id="contact-firstName"
                      placeholder="First Name"
                      value={contactForm.firstName}
                      onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                      className={`bg-slate-600 border-slate-500 text-white placeholder-gray-400 ${contactFormErrors.firstName ? "border-red-500" : ""}`}
                      required
                      aria-invalid={!!contactFormErrors.firstName}
                      aria-describedby={contactFormErrors.firstName ? "firstName-error" : undefined}
                    />
                    {contactFormErrors.firstName && (
                      <p id="firstName-error" className="text-red-400 text-xs mt-1">
                        {contactFormErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="contact-lastName" className="sr-only">
                      Last Name
                    </label>
                    <Input
                      id="contact-lastName"
                      placeholder="Last Name"
                      value={contactForm.lastName}
                      onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                      className={`bg-slate-600 border-slate-500 text-white placeholder-gray-400 ${contactFormErrors.lastName ? "border-red-500" : ""}`}
                      required
                      aria-invalid={!!contactFormErrors.lastName}
                      aria-describedby={contactFormErrors.lastName ? "lastName-error" : undefined}
                    />
                    {contactFormErrors.lastName && (
                      <p id="lastName-error" className="text-red-400 text-xs mt-1">
                        {contactFormErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-email" className="sr-only">
                    Email
                  </label>
                  <Input
                    id="contact-email"
                    type="email"
                    placeholder="Email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className={`bg-slate-600 border-slate-500 text-white placeholder-gray-400 ${contactFormErrors.email ? "border-red-500" : ""}`}
                    required
                    aria-invalid={!!contactFormErrors.email}
                    aria-describedby={contactFormErrors.email ? "email-error" : undefined}
                  />
                  {contactFormErrors.email && (
                    <p id="email-error" className="text-red-400 text-xs mt-1">
                      {contactFormErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-phone" className="sr-only">
                    Phone Number
                  </label>
                  <Input
                    id="contact-phone"
                    type="tel"
                    placeholder="Phone Number (10 digits)"
                    value={contactForm.phone}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                    }
                    className={`bg-slate-600 border-slate-500 text-white placeholder-gray-400 ${contactFormErrors.phone ? "border-red-500" : ""}`}
                    required
                    maxLength={10}
                    aria-invalid={!!contactFormErrors.phone}
                    aria-describedby={contactFormErrors.phone ? "phone-error" : undefined}
                  />
                  {contactFormErrors.phone && (
                    <p id="phone-error" className="text-red-400 text-xs mt-1">
                      {contactFormErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="contact-message" className="sr-only">
                    Your Message
                  </label>
                  <Textarea
                    id="contact-message"
                    placeholder="Your Message"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className={`bg-slate-600 border-slate-500 text-white placeholder-gray-400 ${contactFormErrors.message ? "border-red-500" : ""}`}
                    required
                    aria-invalid={!!contactFormErrors.message}
                    aria-describedby={contactFormErrors.message ? "message-error" : undefined}
                  />
                  {contactFormErrors.message && (
                    <p id="message-error" className="text-red-400 text-xs mt-1">
                      {contactFormErrors.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-lg"
                >
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Responsive */}
      <footer className="bg-slate-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <span className="font-bold text-xl">Kaamsathi</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting skilled workers with employers across India. Find work or hire talent with ease.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white">
                    How it Works
                  </a>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
                <li>
                  <a href="#support" className="hover:text-white">
                    Support
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#privacy" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#safety" className="hover:text-white">
                    Safety Guidelines
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">For Workers</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/find-jobs" className="hover:text-white">
                    Find Daily Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-white">
                    Create Profile
                  </Link>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-white">
                    How It Works
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center text-gray-400 text-sm pt-6 sm:pt-8 border-t border-gray-800">
            © {new Date().getFullYear()} KaamSathi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
