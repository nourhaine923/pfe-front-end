// app/followups/page.tsx

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  Search, 
  Plus, 
  Eye, 
  X,
  Calendar,
  Activity,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  Hospital,
  ListTodo
} from "lucide-react"

import { getTransplantationsWithFollowups } from "@/features/followup/services"
import CreateFollowUpModal from "@/components/modals/CreateFollowUpModal"
import Toast from "@/components/ui/Toast"
import { useAuth } from "@/features/auth/context"

interface TransplantationWithFollowUp {
  _id: string
  transplantNumber: string
  transplantDate: string
  recipient?: {
    _id: string
    firstName: string
    lastName: string
    medicalRecordNumber: number
  }
  donor?: {
    _id: string
    firstName: string
    lastName: string
  }
  followUpCount: number
  latestFollowUp?: {
    id: string
    visitDate: string
    clinicalStatus: string
  }
}

export default function FollowUpsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [data, setData] = useState<TransplantationWithFollowUp[]>([])
  const [search, setSearch] = useState("")
  const [activeSearch, setActiveSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalTransplants, setTotalTransplants] = useState(0)
  const itemsPerPage = 10
  
  // Modal states
  const [createOpen, setCreateOpen] = useState(false)

  const fetchTransplantations = async () => {
    try {
      setLoading(true)
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage
      }
      if (activeSearch.trim()) {
        params.search = activeSearch.trim()
      }
      
      const res = await getTransplantationsWithFollowups(params)
      
      if (res.data && Array.isArray(res.data)) {
        setData(res.data)
        setTotalTransplants(res.total || res.data.length)
        setTotalPages(res.totalPages || Math.ceil((res.total || res.data.length) / itemsPerPage))
      } else {
        setData([])
        setTotalTransplants(0)
        setTotalPages(1)
      }
      
    } catch (err) {
      console.error("Error fetching transplantations:", err)
      showToast("Failed to load data", "error")
      setData([])
      setTotalTransplants(0)
      setTotalPages(1)
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
  }, [authLoading, user, router, activeSearch, currentPage,refreshKey])

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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString()
  }

  const getRecipientName = (tx: TransplantationWithFollowUp) => {
    if (tx.recipient) {
      return `${tx.recipient.firstName} ${tx.recipient.lastName}`
    }
    return "Unknown"
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Calculate stats
  const totalFollowUps = data.reduce((acc, tx) => acc + (tx.followUpCount || 0), 0)
  const stableCount = data.filter(tx => tx.latestFollowUp?.clinicalStatus === "Stable").length
  const criticalCount = data.filter(tx => tx.latestFollowUp?.clinicalStatus === "Critical" || tx.latestFollowUp?.clinicalStatus === "Worsening").length

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-teal-800 mb-2">Follow-up Management</h1>
          <p className="text-gray-600">Track and manage post-transplant follow-up visits</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Transplantations</p>
                <p className="text-3xl font-bold text-teal-800">{totalTransplants}</p>
              </div>
              <div className="bg-teal-100 rounded-full p-3">
                <Hospital className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Follow-ups</p>
                <p className="text-3xl font-bold text-teal-800">{totalFollowUps}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <ListTodo className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Stable</p>
                <p className="text-3xl font-bold text-teal-800">{stableCount}</p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <Heart className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Issues</p>
                <p className="text-3xl font-bold text-teal-800">{criticalCount}</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <Activity className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by recipient name or transplant number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
              />
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
            
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </button>
            
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Follow-up
            </button>
          </div>
        </div>

        {/* Transplantations Table */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <Loader2 className="animate-spin h-12 w-12 text-teal-600 mx-auto" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-teal-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Transplant #</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Recipient</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Transplant Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Follow-ups</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Latest Status</th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          {activeSearch ? "No transplantations found matching your search" : "No transplantations with follow-ups available"}
                        </td>
                      </tr>
                    ) : (
                      data.map((tx) => (
                        <tr key={tx._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono font-medium text-gray-900">
                              {tx.transplantNumber || tx._id.slice(-6)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {getRecipientName(tx)}
                            </div>
                            <div className="text-xs text-gray-500">
                              MRN: {tx.recipient?.medicalRecordNumber || "—"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {tx.transplantDate ? formatDate(tx.transplantDate) : "-"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                              <ListTodo className="h-3 w-3" />
                              {tx.followUpCount} follow-up(s)
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tx.latestFollowUp ? (
                              <div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  tx.latestFollowUp.clinicalStatus === "Stable" ? "bg-green-100 text-green-700" :
                                  tx.latestFollowUp.clinicalStatus === "Critical" ? "bg-red-100 text-red-700" :
                                  tx.latestFollowUp.clinicalStatus === "Worsening" ? "bg-yellow-100 text-yellow-700" :
                                  "bg-gray-100 text-gray-700"
                                }`}>
                                  {tx.latestFollowUp.clinicalStatus}
                                </span>
                                <div className="text-xs text-gray-400 mt-1">
                                  {formatDate(tx.latestFollowUp.visitDate)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <button
                              onClick={() => {
                                // Navigate to the follow-up details page for this transplantation
                                if (tx.latestFollowUp) {
                                  router.push(`/followups/${tx.latestFollowUp.id}`)
                                } else {
                                  // If no follow-up exists, open create modal with pre-selected transplantation
                                  router.push(`/followups/create?transplantationId=${tx._id}`)
                                }
                              }}
                              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                              View Follow-ups
                            </button>
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
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalTransplants)} of {totalTransplants} transplantations
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
                              ? "bg-teal-600 text-white"
                              : "border border-gray-300 text-gray-600 hover:bg-gray-50"
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
                    className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Modals */}
        <CreateFollowUpModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCurrentPage(1)
            setRefreshKey(prev => prev + 1) // Force refresh
            showToast("Follow-up created successfully")
          }}
           showToast={showToast}
        />

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}