"use client" 

import { useState } from "react"
import { useAuth } from "@/features/auth/context"
import { useRouter } from "next/navigation"
import 'boxicons/css/boxicons.min.css'
import Toast from "@/components/ui/Toast"
import PendingApprovalModal from "@/components/modals/PendingApprovalModal"
// LoginPage Component - Handles user authentication with sign in and sign up forms
export default function LoginPage() {
  const { login, register } = useAuth()
  const router = useRouter()
// State for form inputs, loading, and toast notifications
  const [toast, setToast] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("NEPHROLOGIST")
  const [isActive, setIsActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Modal state
  const [showPendingModal, setShowPendingModal] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState("")

  // Modal handlers
  const handleModalClose = () => {
    setShowPendingModal(false)
  }

  const handleSignInClick = () => {
    setShowPendingModal(false)
    setIsActive(false)
  }

  // Email validation function
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/
    return emailRegex.test(email)
  }

  // Show toast helper
  const showToast = (message: string, type: "success" | "error" | "warning" = "error") => {
    setToastType(type)
    setToast(message)
    setTimeout(() => setToast(""), 2000) // Increased to 2 seconds for better readability
  }

  // Validate sign in inputs
  const validateSignIn = () => {
    if (!email.trim()) {
      showToast("Email is required", "warning")
      return false
    }
    if (!password.trim()) {
      showToast("Password is required", "warning")
      return false
    }
    if (!isValidEmail(email)) {
      showToast("Please enter a valid email address", "warning")
      return false
    }
    return true
  }

  // Validate sign up inputs
  const validateSignUp = () => {
    if (!email.trim()) {
      showToast("Email is required", "warning")
      return false
    }
    if (!password.trim()) {
      showToast("Password is required", "warning")
      return false
    }
    if (!isValidEmail(email)) {
      showToast("Please enter a valid email address", "warning")
      return false
    }
    if (password.length < 8) {
      showToast("Password must be at least 8 characters", "warning")
      return false
    }
    return true
  }

  const handleLogin = async () => {
    if (!validateSignIn()) return

    setIsLoading(true)
    try {
      const user = await login(email, password)
      showToast("Login successful", "success")
      
      setTimeout(() => {
        if (user.role === "ADMIN") {
          router.push("/admin/users")
        } else {
          router.push("/patients")
        }
      }, 1000)
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || "Login failed"
      
      // Handle specific error types from the updated context
      switch(errorMessage) {
        case "EMAIL_NOT_FOUND":
          showToast(" Email not found. Please sign up first.", "error")
          // Switch to sign up mode after 2 seconds
          setTimeout(() => setIsActive(true), 2000)
          break
          
        case "INVALID_PASSWORD":
          showToast("Incorrect password. Please try again.", "error")
          break
          
        case "ACCOUNT_PENDING":
          showToast(
            "Your account is pending approval. An administrator needs to approve your account before you can log in.",
            "warning"
          )
          break
          
        case "ACCOUNT_REJECTED":
          showToast(
            "Your account has been rejected. Please contact support for more information.",
            "error"
          )
          break
          
        default:
          if (errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("connection")) {
            showToast("Network error. Please check your connection.", "error")
          } else if (errorMessage.toLowerCase().includes("server")) {
            showToast("Server error. Please try again later.", "error")
          } else {
            showToast(errorMessage || "Login failed. Please try again.", "error")
          }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    if (!validateSignUp()) return

    setIsLoading(true)
    try {
      const user = await register(email, password, role)
      
      if (user.status === "PENDING") {
        setRegisteredEmail(email)
        setShowPendingModal(true)
        setEmail("")
        setPassword("")
      } else {
        showToast("Account created successfully!", "success")
        setTimeout(() => {
          if (user.role === "ADMIN") {
            router.push("/admin/users")
          } else {
            router.push("/patients")
          }
        }, 1000)
      }
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || "Signup failed"
      
      // Handle specific error types from the updated context
      switch(errorMessage) {
        case "EMAIL_ALREADY_EXISTS":
          showToast(
            "An account with this email already exists. Please sign in instead.",
            "warning"
          )
          // Clear form and switch to sign in mode
          setTimeout(() => {
            setIsActive(false)
            setEmail("")
            setPassword("")
          }, 2000)
          break
          
        case "INVALID_EMAIL_FORMAT":
          showToast("Invalid email format. Please enter a valid email address.", "warning")
          break
          
        case "WEAK_PASSWORD":
          showToast("Password is too weak. Please use at least 8 characters with letters and numbers.", "warning")
          break
          
        default:
          if (errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("format")) {
            showToast(" Email format is invalid", "warning")
          } else if (errorMessage.toLowerCase().includes("password") && errorMessage.toLowerCase().includes("weak")) {
            showToast("Password is too weak. Use at least 8 characters.", "warning")
          } else if (errorMessage.toLowerCase().includes("network") || errorMessage.toLowerCase().includes("connection")) {
            showToast("Network error. Please check your connection.", "error")
          } else {
            showToast(errorMessage || "Signup failed. Please try again.", "error")
          }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterClick = () => {
    setIsActive(true)
    setToast("")
    setEmail("")
    setPassword("")
  }

  const handleLoginClick = () => {
    setIsActive(false)
    setToast("")
    setEmail("")
    setPassword("")
  }

  return (
    <div className="login-page min-h-screen flex items-center justify-center font-sans p-4 bg-gradient-to-br from-[#DAFIDE] via-[#8EB69B] to-[#235347]">
      {/* Toast Container */}
      {toast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[2000] w-auto min-w-[300px] max-w-[90%]">
          <Toast message={toast} type={toastType} />
        </div>
      )}

      {/* Pending Approval Modal */}
      {showPendingModal && (
        <PendingApprovalModal 
          registeredEmail={registeredEmail}
          onClose={handleModalClose}
          onSignInClick={handleSignInClick}
        />
      )}

      {/* Rest of your JSX remains the same */}
      <div 
        className={`container relative bg-white rounded-[30px] shadow-[0_5px_15px_rgba(35,83,71,0.35)] overflow-hidden w-[768px] max-w-full min-h-[560px] ${
          isActive ? 'active' : ''
        }`} 
        id="container"
      >
        {/* Sign Up Form */}
        <div className={`form-container absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 ${
          isActive ? 'opacity-100 z-[5] translate-x-full' : 'opacity-0 z-[1]'
        }`}>
          <form 
            className="bg-white flex items-center justify-center flex-col px-12 h-full"
            onSubmit={(e) => {
              e.preventDefault()
              handleSignUp()
            }}
          >
            <h1 className="text-2xl font-bold mb-6 text-[#163832]">Create Account</h1><br/>
            
            <div className="social-icons flex gap-3 mb-6">
              <a href="#" className="icons border border-gray-300 rounded-full inline-flex justify-center items-center w-10 h-10 hover:bg-[#DAFIDE] transition-colors">
                <i className='bx bxl-google text-xl text-[#235347]'></i>
              </a>
            </div><br/>
            
            <span className="text-xs text-gray-500 mb-4">Register with E-mail</span>
            
            <div className="w-full max-w-[280px] space-y-4"><br/>
              <input 
                type="email" 
                placeholder="Enter E-mail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-gray-100 border-none px-5 py-3 text-sm rounded-xl outline-none focus:ring-2 focus:ring-[#235347] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              /><div/><br/>
              
              <input 
                type="password" 
                placeholder="Enter Password (min. 8 characters)" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-gray-100 border-none px-5 py-3 text-sm rounded-xl outline-none focus:ring-2 focus:ring-[#235347] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div><br/>
          
            {/* Show role as read-only text */}
            <div className="w-full max-w-[280px] space-y-4 mt-4">
              <div className="w-full bg-gray-100 px-5 py-3 text-sm rounded-xl text-gray-600">
                Role: <span className="font-semibold text-[#235347]">Nephrologist</span>
              </div>
            </div><br/>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="mt-8 bg-[#235347] text-white text-base font-semibold px-10 py-4 rounded-xl tracking-wide uppercase hover:bg-[#163832] hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? "Creating..." : "Sign Up"}
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className={`form-container absolute top-0 h-full transition-all duration-600 ease-in-out left-0 w-1/2 ${
          isActive ? 'translate-x-full' : 'z-[2]'
        }`}>
          <form 
            className="bg-white flex items-center justify-center flex-col px-12 h-full"
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            <h1 className="text-2xl font-bold mb-6 text-[#163832]">Sign In</h1><br/>
            
            <div className="social-icons flex gap-3 mb-6">
              <a href="#" className="icons border border-gray-300 rounded-full inline-flex justify-center items-center w-10 h-10 hover:bg-[#DAFIDE] transition-colors">
                <i className='bx bxl-google text-xl text-[#235347]'></i>
              </a>
            </div><br/>
            
            <span className="text-xs text-gray-500 mb-4">Sign in With Email & Password</span><br/>
            
            <div className="w-full max-w-[280px] space-y-4">
              <input 
                type="email" 
                placeholder="Enter E-mail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full bg-gray-100 border-none px-5 py-3 text-sm rounded-xl outline-none focus:ring-2 focus:ring-[#235347] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div><br/>
            <div className="w-full max-w-[280px] space-y-4 mt-4"> 
              <input 
                type="password" 
                placeholder="Enter Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full bg-gray-100 border-none px-5 py-3 text-sm rounded-xl outline-none focus:ring-2 focus:ring-[#235347] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div><br/>
            
            <button 
              type="submit"
              disabled={isLoading}
              className="mt-6 bg-[#235347] text-white text-base font-semibold px-10 py-4 rounded-xl tracking-wide uppercase hover:bg-[#163832] hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Toggle Container */}
        <div className={`toggle-container absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-600 ease-in-out rounded-[30px] z-[1000] ${
          isActive ? '-translate-x-full' : ''
        }`}>
          <div className={`toggle bg-gradient-to-br from-[#163832] to-[#235347] h-full text-white relative -left-full h-full w-[200%] transition-all duration-600 ease-in-out ${
            isActive ? 'translate-x-1/2' : 'translate-x-0'
          }`}>
            {/* Toggle Left - Shown when in Sign Up mode */}
            <div className={`toggle-panel absolute w-1/2 h-full flex items-center justify-center flex-col px-10 text-center top-0 transition-all duration-600 ease-in-out ${
              isActive ? 'translate-x-0' : '-translate-x-full'
            }`}>
              <h1 className="text-3xl font-bold mb-4">Welcome To <br /> KTOuIP</h1><br/>
              <p className="text-sm leading-relaxed tracking-wide my-4 max-w-[350px]">
                Join the Kidney Transplant Decision Support Platform
              </p><br/>
              <button 
                onClick={handleLoginClick}
                disabled={isLoading}
                className="mt-4 bg-transparent text-white text-base font-semibold px-10 py-4 border-2 border-white rounded-xl tracking-wide uppercase hover:bg-white hover:text-[#235347] transition-all duration-300 min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed"
                id="login"
              >
                Sign In
              </button>
            </div>

            {/* Toggle Right - Shown when in Sign In mode */}
            <div className={`toggle-panel absolute w-1/2 h-full flex items-center justify-center flex-col px-10 text-center top-0 right-0 transition-all duration-600 ease-in-out ${
              isActive ? 'translate-x-0' : 'translate-x-0'
            }`}>
              <h1 className="text-3xl font-bold mb-4">Welcome back</h1><br/>
              <p className="text-sm leading-relaxed tracking-wide my-4 max-w-[350px]">
                Sign up now and access transplant patient data and decision support tools
              </p><br/>
              <button 
                onClick={handleRegisterClick}
                disabled={isLoading}
                className="mt-4 bg-transparent text-white text-base font-semibold px-10 py-4 border-2 border-white rounded-xl tracking-wide uppercase hover:bg-white hover:text-[#235347] transition-all duration-300 min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed"
                id="register"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}