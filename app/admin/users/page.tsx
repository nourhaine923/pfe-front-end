"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/features/auth/context"
import { useRouter } from "next/navigation"
import api from "@/services/api"
import Toast from "@/components/ui/Toast"
import {Check, X, Clock, User} from "lucide-react"

interface UserAccount {
  _id: string  // MongoDB uses _id
  email: string
  role: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  isApproved?: boolean
}

export default function UserManagement() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState("")
  const [toastType, setToastType] = useState<"success" | "error" | "warning">("success")
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is admin
    if (!loading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.push('/login')
      return
    }
    
    if (isAuthenticated && user?.role === 'ADMIN') {
      fetchUsers()
    }
  }, [isAuthenticated, user, loading])

  const fetchUsers = async () => {
    try {
      console.log("Fetching users...")
      const response = await api.get('/admin/users')
      console.log("Users fetched:", response.data)
      setUsers(response.data)
    } catch (error: any) {
      console.error("Failed to load users:", error)
      console.error("Error details:", error.response?.data)
      showToast(error.response?.data?.detail || "Failed to load users", "error")
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToastType(type)
    setToast(message)
    setTimeout(() => setToast(""), 3000)
  }

  const handleApprove = async (userId: string, email: string) => {
    console.log("Approving user:", { userId, email })
    
    if (!userId) {
      console.error("No userId provided!")
      showToast("Error: User ID is missing", "error")
      return
    }
    
    setActionLoading(userId)
    
    try {
      const response = await api.patch(`/admin/users/${userId}/approve`)
      console.log("Approve response:", response.data)
      showToast(`Account ${email} approved successfully`, "success")
      await fetchUsers() // Refresh list
    } catch (error: any) {
      console.error("Approve error:", error)
      console.error("Error response:", error.response?.data)
      
      const errorMessage = error.response?.data?.detail || error.message || "Failed to approve account"
      showToast(`Failed to approve ${email}: ${errorMessage}`, "error")
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to reject ${email}'s account?`)) return
    
    if (!userId) {
      console.error("No userId provided!")
      showToast("Error: User ID is missing", "error")
      return
    }
    
    setActionLoading(userId)
    
    try {
      const response = await api.patch(`/admin/users/${userId}/reject`)
      console.log("Reject response:", response.data)
      showToast(`Account ${email} rejected`, "warning")
      await fetchUsers()
    } catch (error: any) {
      console.error("Reject error:", error)
      const errorMessage = error.response?.data?.detail || error.message || "Failed to reject account"
      showToast(`Failed to reject ${email}: ${errorMessage}`, "error")
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete ${email}'s account? This action cannot be undone.`)) return
    
    if (!userId) {
      console.error("No userId provided!")
      showToast("Error: User ID is missing", "error")
      return
    }
    
    setActionLoading(userId)
    
    try {
      const response = await api.delete(`/admin/users/${userId}`)
      console.log("Delete response:", response.data)
      showToast(`Account ${email} deleted`, "success")
      await fetchUsers()
    } catch (error: any) {
      console.error("Delete error:", error)
      const errorMessage = error.response?.data?.detail || error.message || "Failed to delete account"
      showToast(`Failed to delete ${email}: ${errorMessage}`, "error")
    } finally {
      setActionLoading(null)
    }
  }

  const filteredUsers = users.filter(user => 
    filter === 'ALL' ? true : user.status === filter
  )

  const pendingCount = users.filter(u => u.status === 'PENDING').length

  if (loading) {
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
    <div className="min-h-screen bg-gray-50 p-8">
      {toast && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50">
          <Toast message={toast} type={toastType} />
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#235347] text-center">User Management</h1>
          <p className="text-gray-600 mt-2 text-center">Manage user accounts and approvals</p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-7">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-blue-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              
              {/* User on the LEFT */}
              <div className="bg-blue-50 rounded-full p-2 w-max">
                <User className="h-6 w-6 text-blue-500" />
              </div>

              {/* Text on the RIGHT */}
              <div>
                <p className="text-2xl font-bold text-blue-600">{users.length}</p>
                <p className="text-gray-600">Total Users</p>
              </div>

            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-yellow-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-50 rounded-full p-2 w-max">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                <p className="text-gray-600">Pending Approval</p>
              </div>
          </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-green-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
              <div className="bg-green-50 rounded-full p-2 w-max">
                <Check className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{users.filter(u => u.status === 'APPROVED').length}</p>
                <p className="text-gray-600">Approved Users</p>
              </div>
              </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 border-l-red-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
              <div className="bg-red-50 rounded-full p-2 w-max">
                <X className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{users.filter(u => u.status === 'REJECTED').length}</p>
                <p className="text-gray-600">Rejected Users</p>
              </div>
              </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${filter === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab === 'ALL' ? 'All Users' : 
                   tab === 'PENDING' ? 'Pending' :
                   tab === 'APPROVED' ? 'Approved' : 'Rejected'}
                  {tab !== 'ALL' && (
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100">
                      {users.filter(u => u.status === tab).length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-[#163832]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((userAccount) => (
                  <tr key={userAccount._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {userAccount.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${userAccount.role === 'ADMIN' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                        }
                      `}>
                        {userAccount.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${userAccount.status === 'APPROVED' && 'bg-green-100 text-green-800'}
                        ${userAccount.status === 'PENDING' && 'bg-yellow-100 text-yellow-800'}
                        ${userAccount.status === 'REJECTED' && 'bg-red-100 text-red-800'}
                      `}>
                        {userAccount.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(userAccount.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      {actionLoading === userAccount._id ? (
                        <span className="text-gray-400">Processing...</span>
                      ) : (
                        <>
                          {userAccount.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(userAccount._id, userAccount.email)}
                                className="text-green-600 hover:text-green-900 font-medium mr-3"
                                disabled={actionLoading !== null}
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(userAccount._id, userAccount.email)}
                                className="text-red-600 hover:text-red-900 font-medium"
                                disabled={actionLoading !== null}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {(userAccount.status === 'APPROVED' || userAccount.status === 'REJECTED') && (
                            <button
                              onClick={() => handleDelete(userAccount._id, userAccount.email)}
                              className="text-gray-600 hover:text-red-600 font-medium"
                              disabled={actionLoading !== null}
                            >
                              Delete
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}