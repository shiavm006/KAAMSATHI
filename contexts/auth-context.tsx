"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface User {
  // Exporting User interface
  id: string
  name: string
  phone: string
  role: "worker" | "employer"
  avatar?: string
  email?: string
  location?: string
  // Worker specific
  skills?: string[]
  bio?: string
  experience?: string // e.g., "2 years", "5+ years"
  // Employer specific
  companyName?: string
  companyWebsite?: string
  companyDescription?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string }>
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; user?: User; error?: string }>
  updateUser: (updatedUserData: Partial<User>) => void // Add updateUser
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MOCK_USERS: User[] = [
  {
    id: "user-worker-1",
    name: "Rajesh Kumar",
    phone: "9876543210",
    role: "worker",
    avatar: "/placeholder-user.jpg",
    email: "rajesh.k@example.com",
    skills: ["Construction", "Plumbing", "Painting"],
    location: "Mumbai, Maharashtra",
    bio: "Hardworking and reliable construction worker with 5 years of experience in residential and commercial projects. Proficient in plumbing and painting.",
    experience: "5 years",
  },
  {
    id: "user-employer-1",
    name: "Priya Sharma",
    phone: "9876543211",
    role: "employer",
    avatar: "/placeholder-user.jpg",
    email: "priya.s@example.com",
    location: "Delhi, NCR",
    companyName: "BuildWell Constructions",
    companyWebsite: "https://buildwell.example.com",
    companyDescription:
      "Leading construction firm specializing in sustainable building practices. We are always looking for skilled workers to join our team.",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  // First useEffect: Mark hydration complete
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Second useEffect: Load user from localStorage only after hydration
  useEffect(() => {
    if (!isHydrated) return

    try {
      const savedUser = localStorage.getItem("kaamsathi-user")
      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error("AuthProvider: Failed to parse user from localStorage", error)
      localStorage.removeItem("kaamsathi-user")
    } finally {
      setLoading(false)
    }
  }, [isHydrated])

  const login = useCallback((userData: User) => {
    setUser(userData)
    if (typeof window !== 'undefined') {
      localStorage.setItem("kaamsathi-user", JSON.stringify(userData))
    }
    console.log("AuthProvider: User logged in", userData)
  }, [])

  const logout = useCallback(() => {
    console.log("AuthProvider: logout() called.")
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem("kaamsathi-user")
      localStorage.removeItem("kaamsathi-user-intent")
    }
    console.log("AuthProvider: User logged out. localStorage cleared.")
  }, [])

  const updateUser = useCallback(
    (updatedUserData: Partial<User>) => {
      if (user) {
        const newUser = { ...user, ...updatedUserData }
        setUser(newUser)
        if (typeof window !== 'undefined') {
          localStorage.setItem("kaamsathi-user", JSON.stringify(newUser))
        }
        console.log("AuthProvider: User data updated", newUser)
      }
    },
    [user],
  )

  const sendOTP = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    console.log(`AuthProvider: Sending OTP to ${phone}...`)
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      return { success: false, error: "Please enter a valid 10-digit phone number." }
    }
    console.log(`AuthProvider: Demo OTP for ${phone} is 123456.`)
    return { success: true }
  }

  const verifyOTP = async (phone: string, otp: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    console.log(`AuthProvider: Verifying OTP ${otp} for phone ${phone}...`)

    if (otp !== "123456") {
      return { success: false, error: "Invalid OTP. Use demo OTP: 123456" }
    }

    const foundUser = MOCK_USERS.find((u) => u.phone === phone)

    if (foundUser) {
      console.log("AuthProvider: Existing user found.")
      login(foundUser)
      return { success: true, user: foundUser }
    } else {
      console.log("AuthProvider: No existing user. Creating new user.")
      const intent = typeof window !== 'undefined' ? localStorage.getItem("kaamsathi-user-intent") || "worker" : "worker"
      const newUserRole = intent as "worker" | "employer"

      // Provide default values for new fields based on role
      const newUser: User = {
        id: `user-new-${Date.now()}`,
        name: `New User ${phone.slice(-4)}`,
        phone,
        role: newUserRole,
        avatar: "/placeholder-user.jpg",
        email: "",
        location: "",
        ...(newUserRole === "worker" && { skills: [], bio: "", experience: "" }),
        ...(newUserRole === "employer" && { companyName: "", companyWebsite: "", companyDescription: "" }),
      }
      login(newUser)
      return { success: true, user: newUser }
    }
  }

  const isAuthenticated = !loading && !!user

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, sendOTP, verifyOTP, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
