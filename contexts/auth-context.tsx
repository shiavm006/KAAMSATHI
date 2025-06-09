"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

interface User {
  id: string
  name: string
  phone: string
  role: "worker" | "employer"
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; user?: User; error?: string }>
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data for demonstration
const MOCK_USERS = [
  {
    id: "user1",
    name: "Rajesh Kumar",
    phone: "9876543210",
    role: "worker",
  },
  {
    id: "user2",
    name: "Priya Sharma",
    phone: "9876543211",
    role: "employer",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem("kaamsathi-user")
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setIsAuthenticated(true)
    }
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem("kaamsathi-user", JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("kaamsathi-user")
    localStorage.removeItem("kaamsathi-user-intent")
  }

  // Mock OTP verification - now handles 6-digit OTP
  const verifyOTP = async (phone: string, otp: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // For demo purposes, accept 123456 or any 6-digit OTP
    if (otp.length !== 6) {
      return { success: false, error: "Invalid OTP. Please enter a 6-digit code." }
    }

    // Demo OTP is 123456, but accept any 6-digit code for testing
    if (otp !== "123456" && !/^\d{6}$/.test(otp)) {
      return { success: false, error: "Invalid OTP. Use demo OTP: 123456" }
    }

    // Find user by phone number
    const foundUser = MOCK_USERS.find((u) => u.phone === phone)

    if (foundUser) {
      // Existing user
      login(foundUser)
      return { success: true, user: foundUser }
    } else {
      // Create a new user with a deterministic role for demo
      const lastDigit = Number.parseInt(phone.slice(-1), 10)
      const newUserRole = lastDigit % 2 === 0 ? "worker" : "employer"
      const newUser = {
        id: `user${Date.now()}`,
        name: `New User ${phone.slice(-4)}`, // Differentiate name for clarity
        phone,
        role: newUserRole as "worker" | "employer",
      }
      login(newUser)
      return { success: true, user: newUser }
    }
  }

  // Mock send OTP - in a real app, this would call an API
  const sendOTP = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Validate phone number (simple validation for demo)
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      return { success: false, error: "Please enter a valid 10-digit phone number" }
    }

    // In a real app, this would send an actual OTP
    console.log(`OTP sent to ${phone}: 123456`)
    return { success: true }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, verifyOTP, sendOTP }}>
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
