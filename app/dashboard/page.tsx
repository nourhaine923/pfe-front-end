"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/features/auth/context"
import { useRouter } from "next/navigation"
import { 
  Users, 
  UserPlus, 
  Activity, 
  Calendar, 
  Droplet,
  Heart,
  AlertCircle
} from "lucide-react"
import api from "@/services/api"

interface DashboardStats {
  totalPatients: number
  activePatients: number
  transplantPatients: number
  dialysisPatients: number
  recentPatients: Array<{
    _id: string
    firstName: string
    lastName: string
    medicalRecordNumber: number
    createdAt: string
  }>
  patientsByBloodGroup: {
    [key: string]: number
  }
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Redirect if not authorized (only nephrologist and admin can access)
  useEffect(() => {
    if (authLoading) return
    
    if (!user || (user.role !== "NEPHROLOGIST" && user.role !== "ADMIN")) {
      router.push("/not-authorized")
      return
    }
    
    fetchDashboardData()
  }, [user, authLoading, router])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await api.get("/patients")
      const patients = response.data

      const totalPatients = patients.length
      const activePatients = patients.filter((p: any) => p.patientRole === "ACTIVE").length
      const transplantPatients = patients.filter((p: any) => p.patientRole === "TRANSPLANT").length
      const dialysisPatients = patients.filter((p: any) => p.patientRole === "DIALYSIS").length

      const recentPatients = [...patients]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((p: any) => ({
          _id: p._id,
          firstName: p.firstName,
          lastName: p.lastName,
          medicalRecordNumber: p.medicalRecordNumber,
          createdAt: p.createdAt
        }))

      const patientsByBloodGroup: { [key: string]: number } = {}
      patients.forEach((p: any) => {
        const bg = p.bloodGroup
        patientsByBloodGroup[bg] = (patientsByBloodGroup[bg] || 0) + 1
      })

      setStats({
        totalPatients,
        activePatients,
        transplantPatients,
        dialysisPatients,
        recentPatients,
        patientsByBloodGroup
      })
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const handleViewPatients = () => {
    // Only nephrologists can view patients
    if (user?.role === "NEPHROLOGIST") {
      router.push("/patients")
    } else {
      router.push("/not-authorized")
    }
  }

  const handleAddPatient = () => {
    // Only nephrologists can add patients
    if (user?.role === "NEPHROLOGIST") {
      const event = new CustomEvent('openCreatePatientModal')
      window.dispatchEvent(event)
    } else {
      router.push("/not-authorized")
    }
  }

  const handleScheduleFollowUp = () => {
    // Only nephrologists can schedule follow-ups
    if (user?.role === "NEPHROLOGIST") {
      router.push("/not-authorized") // Placeholder until implemented
    } else {
      router.push("/not-authorized")
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, bgColor }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${bgColor} rounded-full p-3`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const isNephrologist = user?.role === "NEPHROLOGIST"
  const isAdmin = user?.role === "ADMIN"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            {getGreeting()}, {user?.firstName || user?.email?.split('@')[0] || 'User'}! Welcome back.
          </p>
          {isAdmin && (
            <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
              Administrator
            </span>
          )}
          {isNephrologist && (
            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Nephrologist
            </span>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Patients" 
            value={stats?.totalPatients || 0}
            icon={Users}
            color="text-blue-600"
            bgColor="bg-blue-100"
          />
          <StatCard 
            title="Active Patients" 
            value={stats?.activePatients || 0}
            icon={Activity}
            color="text-green-600"
            bgColor="bg-green-100"
          />
          <StatCard 
            title="Transplant Patients" 
            value={stats?.transplantPatients || 0}
            icon={Heart}
            color="text-purple-600"
            bgColor="bg-purple-100"
          />
          <StatCard 
            title="Dialysis Patients" 
            value={stats?.dialysisPatients || 0}
            icon={Droplet}
            color="text-orange-600"
            bgColor="bg-orange-100"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Patients */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
                <p className="text-sm text-gray-500 mt-1">Recently added patients</p>
              </div>
              <div className="overflow-x-auto">
                {stats?.recentPatients?.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    No patients added yet
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          MRN
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date Added
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats?.recentPatients.map((patient) => (
                        <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono text-gray-900">
                              {patient.medicalRecordNumber}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-500">
                              {new Date(patient.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Blood Group Distribution */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Blood Group Distribution</h2>
                <p className="text-sm text-gray-500 mt-1">Patient blood type breakdown</p>
              </div>
              <div className="p-6">
                {stats?.patientsByBloodGroup && Object.keys(stats.patientsByBloodGroup).length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No data available</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(stats?.patientsByBloodGroup || {}).map(([bloodGroup, count]) => {
                      const colors: { [key: string]: string } = {
                        "A+": "bg-green-100 text-green-800",
                        "A-": "bg-green-100 text-green-800",
                        "B+": "bg-blue-100 text-blue-800",
                        "B-": "bg-blue-100 text-blue-800",
                        "AB+": "bg-yellow-100 text-yellow-800",
                        "AB-": "bg-yellow-100 text-yellow-800",
                        "O+": "bg-purple-100 text-purple-800",
                        "O-": "bg-purple-100 text-purple-800",
                      }
                      const colorClass = colors[bloodGroup] || "bg-gray-100 text-gray-800"
                      
                      return (
                        <div key={bloodGroup} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorClass}`}>
                              {bloodGroup}
                            </span>
                            <span className="text-sm text-gray-600">Blood Type</span>
                          </div>
                          <span className="text-lg font-semibold text-gray-900">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Only show for Nephrologists */}
        {isNephrologist && (
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                <p className="text-sm text-gray-500 mt-1">Common tasks</p>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={handleViewPatients}
                  className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <div className="bg-blue-600 rounded-full p-2">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">View All Patients</p>
                    <p className="text-sm text-gray-500">Manage patient records</p>
                  </div>
                </button>
                
                <button 
                  onClick={handleAddPatient}
                  className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors group"
                >
                  <div className="bg-green-600 rounded-full p-2">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Add New Patient</p>
                    <p className="text-sm text-gray-500">Register a new patient</p>
                  </div>
                </button>
                
                <button 
                  onClick={handleScheduleFollowUp}
                  className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors group"
                >
                  <div className="bg-purple-600 rounded-full p-2">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Schedule Follow-up</p>
                    <p className="text-sm text-gray-500">Manage appointments</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Admin Info Message */}
        {isAdmin && (
          <div className="mt-8">
            <div className="bg-purple-50 rounded-xl shadow-sm border border-purple-100 p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-purple-900">Administrator View</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    As an administrator, you have read-only access to patient statistics. 
                    Patient management is available for nephrologists only.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}