import axios from "axios"
import Cookies from "js-cookie"

const api = axios.create({
  baseURL: "http://localhost:8000"
})

// Flag to prevent multiple redirects
let isRedirecting = false

// Request interceptor - Add token to every request
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - Handle token expiration
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const originalRequest = error.config
    
    // Check if error is 401 (Unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Prevent multiple redirects
      if (!isRedirecting) {
        isRedirecting = true
        
        // Clear expired token
        Cookies.remove("token")
        delete api.defaults.headers.Authorization
        
        // Redirect to login page with message
        const currentPath = window.location.pathname
        const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}&message=session_expired`
        
        // Dispatch a custom event for toast notification
        window.dispatchEvent(new CustomEvent("auth:session-expired"))
        
        // Redirect to login
        window.location.href = loginUrl
      }
      
      return Promise.reject(new Error("Session expired. Please login again."))
    }
    
    return Promise.reject(error)
  }
)

export default api