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
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

import CreatePatientModal from "@/components/modals/CreatePatientModal"
import DeletePatientModal from "@/components/modals/DeletePatientModal"
import UpdatePatientModal from "@/components/modals/UpdatePatientModal"
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

  const [allPatients, setAllPatients] = useState<Patient[]>([])
  const [displayedPatients, setDisplayedPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPatients, setTotalPatients] = useState(0)
  const itemsPerPage = 10

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)

  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null)

  // Fetch all patients from backend (with search, no pagination)
  const fetchPatients = async () => {
    try {
      setLoading(true)
      
      const params: any = {}
      if (search.trim()) {
        params.search = search.trim()
      }
      
      const res = await api.get("/patients/all", { params })
      const patientsData = Array.isArray(res.data) ? res.data : []
      setAllPatients(patientsData)
      
      applyFilterAndPagination(patientsData, selectedFilter, currentPage)
      
    } catch (err) {
      console.error("Error fetching patients:", err)
      showToast("Failed to load patients", "error")
    } finally {
      setLoading(false)
    }
  }

  const applyFilterAndPagination = (patients: Patient[], filter: string, page: number) => {
    let filtered = patients
    if (filter !== "all") {
      filtered = patients.filter(p => p.patientRole === filter)
    }
    
    setTotalPatients(filtered.length)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    
    const start = (page - 1) * itemsPerPage
    const end = start + itemsPerPage
    setDisplayedPatients(filtered.slice(start, end))
  }

  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)
    setCurrentPage(1)
    applyFilterAndPagination(allPatients, filter, 1)
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      applyFilterAndPagination(allPatients, selectedFilter, page)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchPatients()
  }

  const clearSearch = () => {
    setSearch("")
    setCurrentPage(1)
    fetchPatients()
  }

  useEffect(() => {
    if (authLoading) return

    if (user?.role === "ADMIN") {
      router.replace("/not-authorized")
      return
    }

    fetchPatients()
  }, [authLoading, user, router])

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 1000)
  }

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: Record<string, string> = {
      "A+": "bg-amber-50 text-amber-700",
      "A-": "bg-amber-50 text-amber-700",
      "B+": "bg-sky-50 text-sky-700",
      "B-": "bg-sky-50 text-sky-700",
      "O+": "bg-emerald-50 text-emerald-700",
      "O-": "bg-emerald-50 text-emerald-700",
      "AB+": "bg-purple-50 text-purple-700",
      "AB-": "bg-purple-50 text-purple-700",
    }
    return colors[bloodGroup] || "bg-gray-100 text-gray-700"
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      "recipient": "bg-green-900 text-green-50", 
      "donor": "bg-green-100 text-green-900",  
    }
    return colors[role] || "bg-gray-100 text-gray-700"
  }

  const recipientCount = allPatients.filter(p => p.patientRole === "recipient").length
  const donorCount = allPatients.filter(p => p.patientRole === "donor").length

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#235347] mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Patient Management</h1>
          <p className="text-[#235347]">Manage and track all patient records</p>
        </div>

        {/* Stats Cards with Left Border Accent */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4  hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#235347] mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-[#163832]">{allPatients.length}</p>
              </div>
              <div className="bg-green-800 rounded-full p-3">
                <User className="h-6 w-6 text-[#DAF1DE]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4  hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#235347] mb-1">Recipients</p>
                <p className="text-3xl font-bold text-[#163832]">{recipientCount}</p>
              </div>
              <div className="bg-green-800 rounded-full p-3">
                <User className="h-6 w-6 text-[#DAF1DE]" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4  hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#235347] mb-1">Donors</p>
                <p className="text-3xl font-bold text-[#163832]">{donorCount}</p>
              </div>
              <div className="bg-green-800 rounded-full p-3">
                <User className="h-6 w-6 text-[#DAF1DE]" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8EB69B]" />
              <input
                type="text"
                placeholder="Search by name or medical record number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#235347] focus:border-transparent outline-none transition-all bg-gray-50"
              />
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-[#9B2B26]" />
                </button>
              )}
            </div>
            
            <select
              value={selectedFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#235347] focus:border-transparent outline-none bg-gray-50 text-[#163832]"
            >
              <option value="all">All Patients</option>
              <option value="recipient">Recipients</option>
              <option value="donor">Donors</option>
            </select>
            
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-6 py-2.5 bg-[#235347] text-white rounded-xl hover:bg-[#163832] hover:text-white transition-colors focus:ring-2 focus:ring-[#5A94C1] focus:ring-offset-2"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </button>
            
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center px-6 py-2.5 bg-[#235347] text-white rounded-xl hover:bg-[#163832] hover:text-white transition-colors focus:ring-2 focus:ring-[#5A94C1] focus:ring-offset-2"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Patient
            </button>
          </div>
        </div>

        {/* Patients Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Loader2 className="animate-spin h-12 w-12 text-[#235347] mx-auto" />
            <p className="mt-4 text-gray-500">Loading patients...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-[#235347]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">MRN</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Gender</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Blood Group</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Role</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {displayedPatients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          {search ? "No patients found matching your search" : "No patients available"}
                        </td>
                      </tr>
                    ) : (
                      displayedPatients.map((patient) => (
                        <tr key={patient._id} className="hover:bg-gray-200 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono text-gray-800">
                              {patient.medicalRecordNumber || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-800">
                              {patient.firstName} {patient.lastName}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-800">{patient.sex}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getBloodGroupColor(patient.bloodGroup)}`}>
                              {patient.bloodGroup}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(patient.patientRole)}`}>
                              {patient.patientRole === "recipient" ? "Recipient" : "Donor"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={() => router.push(`/patients/${patient._id}`)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPatientData(patient)
                                  setUpdateOpen(true)
                                }}
                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                title="Update"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPatient(patient._id)
                                  setDeleteOpen(true)
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-[#235347]">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalPatients)} of {totalPatients} patients
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-[#235347] hover:bg-[#235347] disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? "bg-[#235347] text-white"
                              : "border border-gray-200 text-[#235347] hover:bg-[#235347]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-[#235347] hover:bg-[#235347] disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <CreatePatientModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            fetchPatients()
            showToast("Patient created successfully", "success")
          }}
          showToast={showToast}
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
            showToast("Patient deleted successfully", "success")
          }}
          showToast={showToast}
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
            showToast("Patient updated successfully", "success")
          }}
          showToast={showToast}
        />

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}