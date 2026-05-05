"use client"

import { createContext, useState, useEffect, useContext } from "react"
import Cookies from "js-cookie"
import api from "@/services/api"

// Add proper types
interface User {
  email: string;
  role: 'ADMIN' | 'NEPHROLOGIST';
  isApproved: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, role: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

// Helper function to safely decode token
const decodeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      email: payload.email,
      role: payload.role,
      isApproved: payload.isApproved,
      status: payload.status
    }
  } catch (err) {
    console.error("Failed to decode token:", err)
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from cookies on app start
  useEffect(() => {
    async function loadUserFromCookies() {
      const token = Cookies.get("token")

      if (token) {
        console.log("Token found in cookies")
        api.defaults.headers.Authorization = `Bearer ${token}`

        try {
          const decoded = decodeToken(token)
          if (decoded) {
            setUser({
              email: decoded.email,
              role: decoded.role,
              isApproved: decoded.isApproved,
              status: decoded.status
            })
          } else {
            console.error("Invalid token → removing cookie")
            Cookies.remove("token")
            setUser(null)
          }
        } catch (err) {
          console.error("Invalid token → removing cookie")
          Cookies.remove("token")
          setUser(null)
        }
      }

      setLoading(false)
    }

    loadUserFromCookies()
  }, [])

  // Login
const login = async (email: string, password: string) => {
  try {
    const { data } = await api.post("/auth/login", { email, password })
    const token = data.access_token

    Cookies.set("token", token, { expires: 1 })
    api.defaults.headers.Authorization = `Bearer ${token}`

    const decoded = decodeToken(token)
    if (!decoded) {
      throw new Error("Failed to decode token")
    }

    // Check if account is approved
    if (decoded.status === 'PENDING') {
      // Clear any tokens that might have been set
      Cookies.remove("token")
      delete api.defaults.headers.Authorization
      throw new Error("ACCOUNT_PENDING")
    }
    
    if (decoded.status === 'REJECTED') {
      // Clear any tokens that might have been set
      Cookies.remove("token")
      delete api.defaults.headers.Authorization
      throw new Error("ACCOUNT_REJECTED")
    }

    const userData = {
      email: decoded.email,
      role: decoded.role,
      isApproved: decoded.isApproved,
      status: decoded.status
    }

    setUser(userData)
    return userData
  } catch (error: any) {
    console.error("Login error:", error)
    
    // Handle backend error responses 403
    if (error.response?.status === 403) {
      const detail = error.response?.data?.detail
      if (detail === "ACCOUNT_PENDING" || detail?.toLowerCase().includes("pending")) {
        throw new Error("ACCOUNT_PENDING")
      } else if (detail === "ACCOUNT_REJECTED" || detail?.toLowerCase().includes("rejected")) {
        throw new Error("ACCOUNT_REJECTED")
      }
    }
    
    // Handle 401 errors
    if (error.response?.status === 401) {
      const detail = error.response?.data?.detail
      if (detail === "Email not found") {
        throw new Error("EMAIL_NOT_FOUND")
      } else if (detail === "Invalid password") {
        throw new Error("INVALID_PASSWORD")
      } else {
        throw new Error("Invalid email or password")
      }
    }
    
    // Handle 404 errors
    if (error.response?.status === 404) {
      throw new Error("EMAIL_NOT_FOUND")
    }
    
    // Handle specific error types from the decoded token check
    if (error.message === "ACCOUNT_PENDING") {
      throw new Error("ACCOUNT_PENDING")
    }
    if (error.message === "ACCOUNT_REJECTED") {
      throw new Error("ACCOUNT_REJECTED")
    }
    
    throw error
  }
}

  // Register
  const register = async (
    email: string,
    password: string,
    role: string = "NEPHROLOGIST"
  ) => {
    try {
      const { data } = await api.post("/auth/register", {
        email,
        password,
        role
      })

      // Don't auto-login for pending accounts
      const userData = {
        email: email,
        role: role,
        isApproved: false,
        status: "PENDING"
      }
      
      return userData
    } catch (error: any) {
      console.error("Register error:", error)
      
      // Handle specific error codes from backend
      if (error.response?.status === 409) {
        throw new Error("EMAIL_ALREADY_EXISTS")
      }
      
      if (error.response?.status === 400) {
        const detail = error.response?.data?.detail
        if (detail?.includes("email")) {
          throw new Error("INVALID_EMAIL_FORMAT")
        }
        if (detail?.includes("password")) {
          throw new Error("WEAK_PASSWORD")
        }
      }
      
      throw error
    }
  }

  // Logout
  const logout = () => {
    Cookies.remove("token")
    delete api.defaults.headers.Authorization
    setUser(null)
    window.location.href = "/login"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)