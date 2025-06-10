"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface User {
  id: string
  name: string
  phone: string
  role: "worker" | "employer"
  avatar?: string
  email?: string
  skills?: string[]
  location?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string }>
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; user?: User; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// MOCK USER DATA - In a real app, this would come from a database.
const MOCK_USERS: User[] = [
  {
    id: "user-worker-1",
    name: "Rajesh Kumar",
    phone: "9876543210",
    role: "worker",
    avatar: "/placeholder-user.jpg",
    email: "rajesh.k@example.com",
    skills: ["Construction", "Plumbing", "Painting"],
    location: "Mumbai",
  },
  {
    id: "user-employer-1",
    name: "Priya Sharma",
    phone: "9876543211",
    role: "employer",
    avatar: "/placeholder-user.jpg",
    email: "priya.s@example.com",
    location: "Mumbai",
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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
  }, [])

  const login = useCallback((userData: User) => {
    setUser(userData)
    localStorage.setItem("kaamsathi-user", JSON.stringify(userData))
    console.log("AuthProvider: User logged in", userData)
  }, [])

  const logout = useCallback(() => {
    console.log("AuthProvider: logout() called.")
    setUser(null)
    localStorage.removeItem("kaamsathi-user")
    localStorage.removeItem("kaamsathi-user-intent")
    console.log("AuthProvider: User logged out. localStorage cleared.")
  }, [])

  const sendOTP = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    console.log(`AuthProvider: Sending OTP to ${phone}...`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    if (phone.length !== 10 || !/^\d+$/.test(phone)) {
      return { success: false, error: "Please enter a valid 10-digit phone number." }
    }
    console.log(`AuthProvider: Demo OTP for ${phone} is 123456.`)
    return { success: true }
  }

  const verifyOTP = async (phone: string, otp: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    console.log(`AuthProvider: Verifying OTP ${otp} for phone ${phone}...`)
    await new Promise((resolve) => setTimeout(resolve, 1000))

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
      const intent = localStorage.getItem("kaamsathi-user-intent") || "worker"
      const newUser: User = {
        id: `user-new-${Date.now()}`,
        name: `New User ${phone.slice(-4)}`,
        phone,
        role: intent as "worker" | "employer",
        avatar: "/placeholder-user.jpg",
      }
      login(newUser)
      return { success: true, user: newUser }
    }
  }

  const isAuthenticated = !loading && !!user

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, sendOTP, verifyOTP, logout }}>
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
