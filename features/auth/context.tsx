"use client"

import { createContext, useState, useEffect, useContext } from "react"
import Cookies from "js-cookie"
import api from "@/services/api"

const AuthContext = createContext<any>({})

// Helper function to safely decode token
const decodeToken = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      email: payload.email,
      role: payload.role
    }
  } catch (err) {
    console.error("Failed to decode token:", err)
    return null
  }
}

export function AuthProvider({ children }: any) {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load user from cookies on app start
  useEffect(() => {
    async function loadUserFromCookies() {
      const token = Cookies.get("token")

      if (token) {
        console.log("Token found in cookies")
        api.defaults.headers.Authorization = `Bearer ${token}`

        // Decode token to get user info
        try {
          const decoded = decodeToken(token)
          if (decoded) {
            setUser({
              email: decoded.email,
              role: decoded.role
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

      const userData = {
        email: decoded.email,
        role: decoded.role
      }

      setUser(userData)
      return userData
    } catch (error) {
      console.error("Login error:", error)
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

      // Auto login after register
      const token = data.access_token

      if (token) {
        Cookies.set("token", token, { expires: 1 })
        api.defaults.headers.Authorization = `Bearer ${token}`

        const decoded = decodeToken(token)
        
        if (!decoded) {
          // If token decode fails but registration was successful, return basic user info
          console.warn("Token decode failed but registration successful")
          const userData = {
            email: email,
            role: role
          }
          setUser(userData)
          return userData
        }

        const userData = {
          email: decoded.email,
          role: decoded.role
        }
        setUser(userData)
        return userData
      } else {
        // If no token returned, registration was still successful
        const userData = {
          email: email,
          role: role
        }
        return userData
      }
    } catch (error) {
      console.error("Register error:", error)
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

// Block access if user not logged in
export const ProtectRoute = ({ children }: any) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <p>Loading...</p>

  if (!isAuthenticated && typeof window !== 'undefined' && window.location.pathname !== "/login") {
    window.location.href = "/login"
    return null
  }

  return children
}