"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Search, 
  Plus, 
  Eye, 
  Edit2, 
  Trash2, 
  X,
  User,
  Droplet,
  Activity,
  Calendar
} from "lucide-react"

import CreatePatientModal from "@/components/modals/CreatePatientModal"
import DeletePatientModal from "@/components/modals/DeletePatientModal"
import UpdatePatientModal from "@/components/modals/UpdatePatientModal"
import ViewPatientModal from "@/components/modals/ViewPatientModal"
import Toast from "@/components/ui/Toast"

import { useAuth } from "@/features/auth/context"
import api from "@/services/api"

interface Patient {
  _id: string
  firstName: string
  lastName: string
  medicalRecordNumber?: number | null
  sex: string
  bloodGroup: string
  patientRole: string
  heightCm?: number
  weightKg?: number
  createdAt?: string
}

export default function PatientsPage() {

  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [viewOpen, setViewOpen] = useState(false)

  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null)
  const [selectedPatientForView, setSelectedPatientForView] = useState<Patient | null>(null)

  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  // Fetch Patients
  const fetchPatients = async () => {
    try {
      setLoading(true)
      const res = await api.get("/patients")
      setPatients(res.data)
    } catch (err) {
      console.error("Error fetching patients:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading) return

    if (user?.role === "ADMIN") {
      router.replace("/not-authorized")
      return
    }

    fetchPatients()
  }, [authLoading, user, router])

  // Enhanced search and filter logic
  const filteredPatients = patients.filter((p) => {
    const searchTerm = search.toLowerCase()
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase()
    
    let mrn = ""
    if (p.medicalRecordNumber !== null && p.medicalRecordNumber !== undefined) {
      mrn = p.medicalRecordNumber.toString().toLowerCase()
    }
    
    const matchesSearch = fullName.includes(searchTerm) || mrn.includes(searchTerm)
    
    // Filter by patient role
    const matchesFilter = selectedFilter === "all" || p.patientRole === selectedFilter
    
    return matchesSearch && matchesFilter
  })

  // Get unique patient roles for filter dropdown
  const patientRoles = ["all", ...new Set(patients.map(p => p.patientRole).filter(Boolean))]

  // Stats
  const totalPatients = patients.length
  const activePatients = patients.filter(p => p.patientRole === "ACTIVE").length
  const transplantPatients = patients.filter(p => p.patientRole === "TRANSPLANT").length

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: Record<string, string> = {
      "A+": "bg-green-100 text-green-800",
      "A-": "bg-green-100 text-green-800",
      "B+": "bg-blue-100 text-blue-800",
      "B-": "bg-blue-100 text-blue-800",
      "O+": "bg-purple-100 text-purple-800",
      "O-": "bg-purple-100 text-purple-800",
      "AB+": "bg-yellow-100 text-yellow-800",
      "AB-": "bg-yellow-100 text-yellow-800",
    }
    return colors[bloodGroup] || "bg-gray-100 text-gray-800"
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      "ACTIVE": "bg-blue-100 text-blue-800",
      "TRANSPLANT": "bg-green-100 text-green-800",
      "DIALYSIS": "bg-orange-100 text-orange-800",
      "FOLLOW_UP": "bg-purple-100 text-purple-800",
    }
    return colors[role] || "bg-gray-100 text-gray-800"
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-center">Patient Management</h1>
          <p className="text-gray-600 text-center">Manage and track all patient records</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">{totalPatients}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Patients</p>
                <p className="text-3xl font-bold text-gray-900">{activePatients}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Transplant Patients</p>
                <p className="text-3xl font-bold text-gray-900">{transplantPatients}</p>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <Droplet className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or medical record number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              {patientRoles.map(role => (
                <option key={role} value={role}>
                  {role === "all" ? "All Patients" : role.replace("_", " ")}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Patient
            </button>
          </div>
        </div>

        {/* Patients Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading patients...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRN</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sex</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Group</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        {search ? "No patients found matching your search" : "No patients available"}
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient) => (
                      <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono font-medium text-gray-900">
                            {patient.medicalRecordNumber || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{patient.sex}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBloodGroupColor(patient.bloodGroup)}`}>
                            {patient.bloodGroup}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(patient.patientRole)}`}>
                            {patient.patientRole.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPatientForView(patient)
                                setViewOpen(true)
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPatientData(patient)
                                setUpdateOpen(true)
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPatient(patient._id)
                                setDeleteOpen(true)
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        <CreatePatientModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            fetchPatients()
            showToast("Patient created successfully")
          }}
        />

        <DeletePatientModal
          isOpen={deleteOpen}
          onClose={() => {
            setDeleteOpen(false)
            setSelectedPatient(null)
          }}
          patientId={selectedPatient}
          onDeleted={() => {
            fetchPatients()
            showToast("Patient deleted successfully")
          }}
        />

        <UpdatePatientModal
          isOpen={updateOpen}
          onClose={() => {
            setUpdateOpen(false)
            setSelectedPatientData(null)
          }}
          patient={selectedPatientData}
          onUpdated={() => {
            fetchPatients()
            showToast("Patient updated successfully")
          }}
        />

        <ViewPatientModal
          isOpen={viewOpen}
          onClose={() => {
            setViewOpen(false)
            setSelectedPatientForView(null)
          }}
          patient={selectedPatientForView}
        />

        {toast && <Toast message={toast} />}
      </div>
    </div>
  )
}