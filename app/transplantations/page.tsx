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
  Calendar,
  Activity,
  Heart,
  Droplet,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react"

import { getTransplantations, deleteTransplantation } from "@/features/transplantation/services"
import { Transplantation } from "@/features/transplantation/types"
import CreateTransplantationModal from "@/components/modals/CreateTransplantationModal"
import UpdateTransplantationModal from "@/components/modals/UpdateTransplantationModal"
import DeleteTransplantationModal from "@/components/modals/DeleteTransplantationModal"
import Toast from "@/components/ui/Toast"
import { useAuth } from "@/features/auth/context"

export default function TransplantationsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [data, setData] = useState<Transplantation[]>([])
  const [search, setSearch] = useState("")
  const [activeSearch, setActiveSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTransplantsCount, setTotalTransplantsCount] = useState(0)
  const itemsPerPage = 10
  
  // Modal states
  const [createOpen, setCreateOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  
  const [selectedTransplantation, setSelectedTransplantation] = useState<Transplantation | null>(null)
  const [selectedTransplantationId, setSelectedTransplantationId] = useState<string | null>(null)

  // Fetch transplantations with search and pagination from backend
  const fetchTransplantations = async () => {
    try {
      setLoading(true)
      
      // Build query parameters for backend
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      }
      if (activeSearch.trim()) {
        params.search = activeSearch.trim()
      }
      
      console.log("Fetching with params:", params)
      
      const res = await getTransplantations(params)
      console.log("Response:", res)
      
      // Handle paginated response
      if (res.data && Array.isArray(res.data)) {
        setData(res.data)
        setTotalTransplantsCount(res.total || res.data.length)
        setTotalPages(res.totalPages || Math.ceil((res.total || res.data.length) / itemsPerPage))
      } else if (Array.isArray(res)) {
        setData(res)
        setTotalTransplantsCount(res.length)
        setTotalPages(Math.ceil(res.length / itemsPerPage))
      } else {
        setData([])
        setTotalTransplantsCount(0)
        setTotalPages(1)
      }
      
    } catch (err) {
      console.error("Error fetching transplantations:", err)
      showToast("Failed to load transplantations", "error")
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
    
    fetchTransplantations()
  }, [authLoading, user, router, activeSearch, currentPage])

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleSearch = () => {
    setActiveSearch(search)
    setCurrentPage(1)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const clearSearch = () => {
    setSearch("")
    setActiveSearch("")
    setCurrentPage(1)
  }

  const getStatusColor = (status?: string) => {
    switch(status) {
      case "APPROVED": return "bg-green-50 text-green-700"
      case "REJECTED": return "bg-red-100 text-red-700"
      default: return "bg-amber-100 text-amber-700"
    }
  }

  const getStatusText = (status?: string) => {
    switch(status) {
      case "APPROVED": return "Approved"
      case "REJECTED": return "Rejected"
      default: return "Pending"
    }
  }

  // Stats from current page data
  const approvedTransplants = data.filter(t => t.status === "APPROVED").length
  const pendingTransplants = data.filter(t => !t.status || t.status === "PENDING").length

  // Pagination controls
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

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
          <h1 className="text-4xl font-bold text-green-800 mb-2">Transplant Management</h1>
          <p className="text-gray-600">Track and manage all kidney transplantations</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#235347] mb-1">Total Transplants</p>
                <p className="text-3xl font-bold text-[#163832]">{totalTransplantsCount}</p>
              </div>
              <div className="bg-blue-50 rounded-full p-3">
                <Heart className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-green-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#235347] mb-1">Approved Transplants</p>
                <p className="text-3xl font-bold text-[#163832]">{approvedTransplants}</p>
              </div>
              <div className="bg-green-50 rounded-full p-3">
                <Activity className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-yellow-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#235347] mb-1">Pending Transplants</p>
                <p className="text-3xl font-bold text-[#163832]">{pendingTransplants}</p>
              </div>
              <div className="bg-yellow-50 rounded-full p-3">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8EB69B]" />
              <input
                type="text"
                placeholder="Search by transplant number, donor name, or recipient name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
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
            
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-6 py-2.5 bg-[#235347] text-white rounded-xl hover:bg-[#163832] hover:text-white transition-colors focus:ring-2 focus:ring-[#235347] focus:ring-offset-2"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </button>
            
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center px-6 py-2.5 bg-[#235347] text-white rounded-xl hover:bg-[#163832] hover:text-white transition-colors focus:ring-2 focus:ring-[#235347] focus:ring-offset-2"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Transplant
            </button>
          </div>
        </div>

        {/* Transplantations Table */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Loader2 className="animate-spin h-12 w-12 text-[#235347] mx-auto" />
            <p className="mt-4 text-gray-500">Loading transplantations...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-[#235347]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Transplant </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Donor</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Recipient</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          {activeSearch ? "No transplantations found matching your search" : "No transplantations available"}
                        </td>
                      </tr>
                    ) : (
                      data.map((t) => (
                        <tr key={t._id} className="hover:bg-gray-200 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono font-medium text-gray-600">
                              {t.transplantNumber || t._id.slice(-6)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-600">
                              {t.donor?.firstName} {t.donor?.lastName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {t.donor?.bloodGroup}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-600">
                              {t.recipient?.firstName} {t.recipient?.lastName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {t.recipient?.bloodGroup}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-600" />
                              <span className="text-sm text-gray-600">
                                {t.transplantDate ? new Date(t.transplantDate).toLocaleDateString() : "-"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(t.status)}`}>
                              {getStatusText(t.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={() => router.push(`/transplantations/${t._id}`)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTransplantation(t)
                                  setUpdateOpen(true)
                                }}
                                className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTransplantationId(t._id)
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
                  Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalTransplantsCount)} of {totalTransplantsCount} transplantations
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-[#235347] hover:bg-[#DAF1DE] disabled:opacity-50 transition-colors"
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
                              : "border border-gray-200 text-[#235347] hover:bg-[#DAF1DE]"
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
                    className="px-3 py-2 border border-gray-200 rounded-lg text-[#235347] hover:bg-[#DAF1DE] disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <CreateTransplantationModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCurrentPage(1)
            fetchTransplantations()
            showToast("Transplantation created successfully")
          }}
          showToast={showToast}
        />

        <UpdateTransplantationModal
          isOpen={updateOpen}
          onClose={() => {
            setUpdateOpen(false)
            setSelectedTransplantation(null)
          }}
          transplantation={selectedTransplantation}
          onUpdated={() => {
            fetchTransplantations()
            showToast("Transplantation updated successfully")
          }}
          showToast={showToast}
        />

        <DeleteTransplantationModal
          isOpen={deleteOpen}
          onClose={() => {
            setDeleteOpen(false)
            setSelectedTransplantationId(null)
          }}
          transplantationId={selectedTransplantationId}
          onDeleted={() => {
            fetchTransplantations()
            showToast("Transplantation deleted successfully")
          }}
          showToast={showToast}
        />

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}