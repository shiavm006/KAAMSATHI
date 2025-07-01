"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

// This interface now correctly matches the backend's User model
export interface User {
  id: string
  name: string
  phone: string
  role: "worker" | "employer"
  avatar?: string
  email?: string
  location?: string
  skills?: string[]
  bio?: string
  experience?: string
  companyName?: string
  companyWebsite?: string
  companyDescription?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  loading: boolean
  sendOTP: (phone: string) => Promise<{ success: boolean; error?: string }>
  verifyOTP: (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>
  updateUser: (updatedUserData: Partial<User>) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// We will no longer need MOCK_USERS
// const MOCK_USERS: User[] = [ ... ]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Load user and token from localStorage after hydration
  useEffect(() => {
    if (!isHydrated) return

    try {
      const savedToken = localStorage.getItem("kaamsathi-token")
      const savedUser = localStorage.getItem("kaamsathi-user")
      
      if (savedToken && savedUser) {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error("AuthProvider: Failed to load auth state from localStorage", error)
      localStorage.clear()
    } finally {
      setLoading(false)
    }
  }, [isHydrated])

  const login = useCallback((userData: User, userToken: string) => {
    setUser(userData)
    setToken(userToken)
    if (typeof window !== 'undefined') {
      localStorage.setItem("kaamsathi-user", JSON.stringify(userData))
      localStorage.setItem("kaamsathi-token", userToken)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem("kaamsathi-user")
      localStorage.removeItem("kaamsathi-token")
      localStorage.removeItem("kaamsathi-user-intent")
    }
  }, [])
  
  const updateUser = useCallback(
    (updatedUserData: Partial<User>) => {
      if (user) {
        const newUser = { ...user, ...updatedUserData }
        setUser(newUser)
        if (typeof window !== 'undefined') {
          localStorage.setItem("kaamsathi-user", JSON.stringify(newUser))
        }
      }
    },
    [user],
  )

  const sendOTP = async (phone: string): Promise<{ success: boolean; error?: string }> => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    try {
      const response = await fetch(`${apiUrl}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!data.success) {
        return { success: false, error: data.error || 'Failed to send OTP' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: "Cannot connect to the server." };
    }
  }

  const verifyOTP = async (phone: string, otp: string): Promise<{ success: boolean; error?: string }> => {
    const role = localStorage.getItem("kaamsathi-user-intent") || "worker";
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    try {
      const response = await fetch(`${apiUrl}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, role }),
      });
      
      const data = await response.json();

      if (!data.success) {
        return { success: false, error: data.error || 'Failed to verify OTP' };
      }
      
      const { token: userToken, user: userData } = data.data;
      if (userData && userToken) {
        login(userData, userToken);
        return { success: true };
      } else {
        return { success: false, error: "Invalid user data from server." }
      }
    } catch (error) {
      return { success: false, error: "Cannot connect to the server." };
    }
  }

  const isAuthenticated = !loading && !!user && !!token

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, sendOTP, verifyOTP, updateUser, logout }}>
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
