"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/context"
import { 
  Users, 
  Activity, 
  Calendar, 
  Heart, 
  TrendingUp, 
  AlertCircle,
  Loader2,
  Hospital,
  Droplet,
  Stethoscope
} from "lucide-react"
import api from "@/services/api"

interface DashboardStats {
  totalPatients: number
  recipients: number
  donors: number
  totalTransplantations: number
  totalFollowUps: number
  stablePatients: number
  criticalPatients: number
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    recipients: 0,
    donors: 0,
    totalTransplantations: 0,
    totalFollowUps: 0,
    stablePatients: 0,
    criticalPatients: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push("/login")
      return
    }
    
    fetchDashboardData()
  }, [authLoading, user, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch patients
      let patients: any[] = []
      try {
        const patientsRes = await api.get("/patients/all")
        patients = patientsRes.data || []
        console.log("Patients data:", patients)
      } catch (err) {
        console.error("Error fetching patients:", err)
        patients = []
      }
      
      // Fetch transplantations
      let transplantations: any[] = []
      try {
        const txRes = await api.get("/transplantations", { params: { limit: 100 } })
        transplantations = txRes.data?.data || txRes.data || []
        console.log("Transplantations data:", transplantations)
      } catch (err) {
        console.error("Error fetching transplantations:", err)
        transplantations = []
      }
      
      // Fetch follow-ups
      let followUps: any[] = []
      try {
        const followUpRes = await api.get("/followups", { params: { limit: 100 } })
        followUps = followUpRes.data?.data || followUpRes.data || []
        console.log("Follow-ups data:", followUps)
      } catch (err) {
        console.error("Error fetching follow-ups:", err)
        followUps = []
      }
      
      // Ensure patients is an array
      const patientsArray = Array.isArray(patients) ? patients : []
      
      // Calculate stats
      const recipients = patientsArray.filter((p: any) => p.patientRole === "recipient").length
      const donors = patientsArray.filter((p: any) => p.patientRole === "donor").length
      
      // Get stable and critical patients from follow-ups
      const stablePatients = followUps.filter((f: any) => f.clinicalStatus === "Stable").length
      const criticalPatients = followUps.filter((f: any) => f.clinicalStatus === "Critical" || f.clinicalStatus === "Worsening").length
      
      setStats({
        totalPatients: patientsArray.length,
        recipients,
        donors,
        totalTransplantations: Array.isArray(transplantations) ? transplantations.length : 0,
        totalFollowUps: Array.isArray(followUps) ? followUps.length : 0,
        stablePatients,
        criticalPatients
      })
      
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => fetchDashboardData()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: Users,
      color: "bg-blue-500",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600"
    },
    {
      title: "Recipients",
      value: stats.recipients,
      icon: Heart,
      color: "bg-green-500",
      bgColor: "bg-green-100",
      textColor: "text-green-600"
    },
    {
      title: "Donors",
      value: stats.donors,
      icon: Droplet,
      color: "bg-purple-500",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600"
    },
    {
      title: "Transplantations",
      value: stats.totalTransplantations,
      icon: Hospital,
      color: "bg-indigo-500",
      bgColor: "bg-indigo-100",
      textColor: "text-indigo-600"
    },
    {
      title: "Follow-ups",
      value: stats.totalFollowUps,
      icon: Calendar,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600"
    },
    {
      title: "Stable Patients",
      value: stats.stablePatients,
      icon: Activity,
      color: "bg-green-500",
      bgColor: "bg-green-100",
      textColor: "text-green-600"
    },
    {
      title: "Critical Cases",
      value: stats.criticalPatients,
      icon: AlertCircle,
      color: "bg-red-500",
      bgColor: "bg-red-100",
      textColor: "text-red-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.bgColor} rounded-full p-3`}>
                  <card.icon className={`h-6 w-6 ${card.textColor}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => router.push("/patients")}
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Manage Patients</span>
            </button>
            <button
              onClick={() => router.push("/transplantations")}
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Hospital className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Manage Transplantations</span>
            </button>
            <button
              onClick={() => router.push("/followups")}
              className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <Calendar className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-700">Manage Follow-ups</span>
            </button>
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('openCreatePatientModal'))
              }}
              className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <Users className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Create New Patient</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}