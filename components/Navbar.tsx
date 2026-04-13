"use client"

import { useAuth } from "@/features/auth/context"
import { useRouter, usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Users, 
  LogOut, 
  Activity,
  Hospital,
  Stethoscope,
  UserCog,
  CalendarCheck,
} from "lucide-react"

export default function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => {
    return pathname === path
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Navigation items based on role
  const navigationItems = []

  // Dashboard - visible to both Admin and Nephrologist
  if (user?.role === "ADMIN" || user?.role === "NEPHROLOGIST") {
    navigationItems.push({
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "NEPHROLOGIST"]
    })
  }

  // Patients - visible to Nephrologist only
  if (user?.role === "NEPHROLOGIST") {
    navigationItems.push({
      name: "Patients",
      path: "/patients",
      icon: Users,
      roles: ["NEPHROLOGIST"]
    })
  }

  // Transplantations - visible to Nephrologist only
  if (user?.role === "NEPHROLOGIST") {
    navigationItems.push({
      name: "Transplantations",
      path: "/transplantations",
      icon: Hospital,
      roles: ["NEPHROLOGIST"]
    })
  }

  // User Management - visible to Admin only
  if (user?.role === "ADMIN") {
    navigationItems.push({
      name: "Manage Users",
      path: "/admin/users",
      icon: UserCog,
      roles: ["ADMIN"]
    })
  }

  // Statistics - visible to Admin only
  if (user?.role === "ADMIN") {
    navigationItems.push({
      name: "Statistics",
      path: "/statistics",
      icon: Activity,
      roles: ["ADMIN"]
    })
  }
  
  // Follow-ups - visible to Nephrologist only
  if (user?.role === "NEPHROLOGIST") {
    navigationItems.push({
      name: "Follow-ups",
      path: "/followups",
      icon: CalendarCheck,
      roles: ["NEPHROLOGIST"]
    })
  }

  return (
    <div className="fixed top-0 left-0 h-screen w-64 bg-gradient-to-br from-[#163832] to-[#235347] text-white flex flex-col justify-between shadow-2xl z-50">
      {/* Logo Section */}
      <div className="pt-10 pb-8 px-4">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="bg-white/10 rounded-full p-3 mb-2">
            <Stethoscope className="h-8 w-8 text-white" />
          </div>
          <h1 
            onClick={() => router.push("/")}
            className="text-2xl font-bold cursor-pointer hover:text-[#DAFIDE] transition-colors"
          >
            KTOuIP
          </h1>
          <p className="text-center text-xs text-[#8EB69B] mt-1">
            Kidney Transplant Management
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-4">
        <nav className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`
                  w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-all duration-200 group
                  ${active 
                    ? "bg-white/20 text-white shadow-lg backdrop-blur-sm" 
                    : "text-[#DAFIDE] hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon className={`h-5 w-5 ${active ? "text-white" : "text-[#8EB69B] group-hover:text-white"}`} />
                <span className="font-medium text-sm">{item.name}</span>
                {active && (
                  <div className="ml-auto w-1 h-5 bg-[#DAFIDE] rounded-full" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div className="border-t border-white/20 p-4">
        <div className="mb-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-white/20 rounded-full p-1">
              <Users className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs font-medium text-[#DAFIDE]">Logged in as</span>
          </div>
          <p className="text-sm font-semibold text-white truncate">
            {user?.email || "User"}
          </p>
          <p className="text-xs text-[#8EB69B] mt-1">
            {user?.role === "ADMIN" ? "Administrator" : "Nephrologist"}
          </p>
        </div>
        
        <button
          onClick={handleLogout}
          className="
            w-full flex items-center justify-center gap-2 
            hover:bg-[#E3EED4] text-[#235347] bg-[#6B9071] 
            text-white font-medium py-2 px-4 
            rounded-lg transition-all duration-200
            shadow-md hover:shadow-lg
          "
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm tracking-wide uppercase">Logout</span>
        </button>
      </div>
    </div>
  )
}