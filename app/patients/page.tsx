// "use client" - Next.js directive that marks this component to run on the client side
// (not server-side rendered). This enables interactivity and browser APIs like useState, useEffect.
"use client"

// React hooks for state management and side effects
import { useEffect, useState } from "react"
// Next.js navigation hook for programmatic routing (redirects, navigation between pages)
import { useRouter } from "next/navigation"
// Importing Lucide React icons for UI elements (search icon, plus icon, eye icon, etc.)
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

// Custom modal components for patient CRUD operations
import CreatePatientModal from "@/components/modals/CreatePatientModal"
import DeletePatientModal from "@/components/modals/DeletePatientModal"
import UpdatePatientModal from "@/components/modals/UpdatePatientModal"

// Toast notification component for showing success/error messages
import Toast from "@/components/ui/Toast"

// Custom authentication hook to get current user and loading state
import { useAuth } from "@/features/auth/context"
// Axios instance configured with base URL and JWT token interceptors
import api from "@/services/api"

// TypeScript interface defining the shape of a Patient object
// This ensures type safety when working with patient data
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

// Main component function - exported as default for Next.js page routing
export default function PatientsPage() {

  // AUTHENTICATION HOOKS
  // user: current logged-in user object containing email, role, status
  // authLoading: boolean indicating if authentication check is in progress
  const { user, loading: authLoading } = useAuth()
  const router = useRouter() // For programmatic navigation (redirects, pushing new URLs)

  // STATE MANAGEMENT - Why we need each state
  
  // allPatients: Complete list of patients fetched from backend (unfiltered/unpaginated)
  // WHY: We need the full list to apply filters and pagination without making multiple API calls
  const [allPatients, setAllPatients] = useState<Patient[]>([])
  
  // displayedPatients: Patients currently displayed after filtering and pagination
  // WHY: This is what actually shows in the table - we slice the full list
  const [displayedPatients, setDisplayedPatients] = useState<Patient[]>([])
  
  // search: Current text in search input field
  // WHY: Tracks what the user is typing in real-time
  const [search, setSearch] = useState("")
  
  // selectedFilter: Current filter value: "all", "recipient", or "donor"
  // WHY: Allows user to see only donors or only recipients
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  
  // loading: Boolean indicating if data is being fetched
  // WHY: Shows a spinner while waiting for API response (better UX)
  const [loading, setLoading] = useState(true)
  
  // toast: Notification message and type (null = no notification)
  // WHY: Provides feedback to user after actions (create, update, delete)
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null)

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1)        // Current page number (1-indexed)
  const [totalPages, setTotalPages] = useState(1)          // Total number of pages (calculated)
  const [totalPatients, setTotalPatients] = useState(0)    // Total count after filtering
  const itemsPerPage = 10                                  // Fixed - how many rows per page

  // MODAL CONTROL STATES
  // Each modal has its own open/close state
  const [createOpen, setCreateOpen] = useState(false)      // Create patient modal
  const [deleteOpen, setDeleteOpen] = useState(false)      // Delete confirmation modal
  const [updateOpen, setUpdateOpen] = useState(false)      // Update patient modal

  // SELECTED PATIENT DATA FOR ACTIONS
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null)        // Just the ID (for delete)
  const [selectedPatientData, setSelectedPatientData] = useState<Patient | null>(null) // Full object (for update)

  // DATA FETCHING FUNCTION
  // Fetches all patients from backend (supports search, no pagination at API level)
  const fetchPatients = async () => {
    try {
      setLoading(true) // Show loading spinner BEFORE API call
      
      // Build query parameters for the API
      const params: any = {}
      if (search.trim()) {  // Only send search parameter if user typed something
        params.search = search.trim()
      }
      
      // Make API call to get all patients matching search criteria
      // Note: "/all" endpoint returns ALL patients (no pagination) - we do pagination client-side
      const res = await api.get("/patients/all", { params })
      const patientsData = Array.isArray(res.data) ? res.data : []
      setAllPatients(patientsData) // Store complete list in state
      
      // Apply current filters and pagination to the fetched data
      applyFilterAndPagination(patientsData, selectedFilter, currentPage)
      
    } catch (err) {
      console.error("Error fetching patients:", err)
      showToast("Failed to load patients", "error")
    } finally {
      setLoading(false) // Hide loading spinner AFTER API call completes (success or error)
    }
  }

  // HELPER FUNCTION - Filtering and Pagination
  // WHY separate function? Because we need to re-apply filtering after:
  // 1. Data loads (initial fetch)
  // 2. Filter changes
  // 3. Page changes
  const applyFilterAndPagination = (patients: Patient[], filter: string, page: number) => {
    // STEP 1: Apply role filter (if not "all")
    let filtered = patients
    if (filter !== "all") {
      filtered = patients.filter(p => p.patientRole === filter)
    }
    
    // STEP 2: Update pagination metadata
    setTotalPatients(filtered.length)                      // How many total after filtering
    setTotalPages(Math.ceil(filtered.length / itemsPerPage)) // Calculate total pages (ceil rounds up)
    
    // STEP 3: Slice array for current page (client-side pagination)
    const start = (page - 1) * itemsPerPage                 // First index of current page (0-based)
    const end = start + itemsPerPage                        // Last index + 1
    setDisplayedPatients(filtered.slice(start, end))       // Update displayed patients
  }

  // EVENT HANDLERS - User interactions
  
  // Handles filter change from dropdown
  const handleFilterChange = (filter: string) => {
    setSelectedFilter(filter)  // Update state with new filter
    setCurrentPage(1)          // Reset to first page (important!)
    applyFilterAndPagination(allPatients, filter, 1) // Re-apply filter from page 1
  }

  // Navigates to specific page in pagination
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {  // Validate page number is within range
      setCurrentPage(page)                  // Update current page state
      applyFilterAndPagination(allPatients, selectedFilter, page) // Show correct slice
    }
  }

  // Trigger search operation when user clicks "Search" button
  const handleSearch = () => {
    setCurrentPage(1)  // Reset to first page for search results
    fetchPatients()    // Fetch patients with search term (this triggers API call)
  }

  // Clear search input and refetch all patients
  const clearSearch = () => {
    setSearch("")       // Clear input field
    setCurrentPage(1)   // Reset to first page
    fetchPatients()     // Refetch without search filter (gets ALL patients)
  }

  // EFFECT HOOK - Runs when component mounts or dependencies change
  useEffect(() => {
    // Wait for authentication to complete before checking role
    if (authLoading) return

    // ADMIN role is not allowed to access patient management page
    // This is a security measure (frontend only - backend also checks)
    if (user?.role === "ADMIN") {
      router.replace("/not-authorized") // Redirect to unauthorized page
      return
    }

    // For non-ADMIN users (NEPHROLOGIST), fetch patients
    fetchPatients()
  }, [authLoading, user, router]) // Dependencies: re-run when these change

  // UI HELPER FUNCTIONS
  
  // Shows a temporary toast notification
  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type })  // Set toast data
    setTimeout(() => setToast(null), 1000) // Auto-hide after 1 second
  }

  // Maps blood group to Tailwind CSS color classes
  // WHY: Different blood groups have different visual styles for quick recognition
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
    return colors[bloodGroup] || "bg-gray-100 text-gray-700" // Default fallback
  }

  // Maps patient role to badge color classes
  // WHY: Different visual styles help users quickly distinguish donors from recipients
  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      "recipient": "bg-green-900 text-green-50", 
      "donor": "bg-green-100 text-green-900",    
    }
    return colors[role] || "bg-gray-100 text-gray-700"
  }

  // Calculate counts for stats cards (used in the UI)
  const recipientCount = allPatients.filter(p => p.patientRole === "recipient").length
  const donorCount = allPatients.filter(p => p.patientRole === "donor").length

  // EARLY RETURN - Show loading while authentication is in progress
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

  // MAIN RENDER - JSX UI
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/*  HEADER SECTION  */}
        {/* Page title and description - visible at top of page */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-green-800 mb-2">Patient Management</h1>
          <p className="text-[#235347]">Manage and track all patient records</p>
        </div>

        {/*  STATS CARDS  */}
        {/* Quick overview of patient counts - helps users understand data volume */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Total Patients Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 hover:shadow-md transition-shadow">
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
          
          {/* Recipients Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 hover:shadow-md transition-shadow">
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
          
          {/* Donors Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 hover:shadow-md transition-shadow">
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

        {/* SEARCH AND FILTER SECTION  */}
        {/* Allows users to find specific patients and filter by role */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input Field with icon */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#8EB69B]" />
              <input
                type="text"
                placeholder="Search by name or medical record number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#235347] focus:border-transparent outline-none transition-all bg-gray-50"
              />
              {/* Clear search button (only shows when search has value) */}
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-[#9B2B26]" />
                </button>
              )}
            </div>
            
            {/* Role Filter Dropdown */}
            <select
              value={selectedFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#235347] focus:border-transparent outline-none bg-gray-50 text-[#163832]"
            >
              <option value="all">All Patients</option>
              <option value="recipient">Recipients</option>
              <option value="donor">Donors</option>
            </select>
            
            {/* Search Button - Triggers search with current input */}
            <button
              onClick={handleSearch}
              className="inline-flex items-center px-6 py-2.5 bg-[#235347] text-white rounded-xl hover:bg-[#163832] hover:text-white transition-colors focus:ring-2 focus:ring-[#5A94C1] focus:ring-offset-2"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </button>
            {/* Create Patient Button - Opens modal for new patient */}
            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center px-6 py-2.5 bg-[#235347] text-white rounded-xl hover:bg-[#163832] hover:text-white transition-colors focus:ring-2 focus:ring-[#5A94C1] focus:ring-offset-2"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Patient
            </button>
          </div>
        </div>

        {/*  PATIENTS TABLE SECTION  */}
        {/* Conditional rendering: Show spinner while loading, show table when done */}
        {loading ? (
          // LOADING STATE - Show spinner animation
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Loader2 className="animate-spin h-12 w-12 text-[#235347] mx-auto" />
            <p className="mt-4 text-gray-500">Loading patients...</p>
          </div>
        ) : (
          <>
            {/* Table Container */}
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  {/* Table Header - Dark green background with white text */}
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
                  
                  {/* Table Body - Rows for each patient */}
                  <tbody className="bg-white divide-y divide-gray-100">
                    {displayedPatients.length === 0 ? (
                      // EMPTY STATE - No patients found
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                          {search ? "No patients found matching your search" : "No patients available"}
                        </td>
                      </tr>
                    ) : (
                      // Map through patients and create table rows
                      displayedPatients.map((patient) => (
                        <tr key={patient._id} className="hover:bg-gray-200 transition-colors">
                          {/* MRN Column - Monospace font for numbers */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono text-gray-800">
                              {patient.medicalRecordNumber || "N/A"}
                            </span>
                          </td>
                          
                          {/* Patient Name Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-800">
                              {patient.firstName} {patient.lastName}
                            </div>
                           </td>
                          
                          {/* Gender Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-800">{patient.sex}</span>
                           </td>
                          
                          {/* Blood Group Column with color badge */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getBloodGroupColor(patient.bloodGroup)}`}>
                              {patient.bloodGroup}
                            </span>
                           </td>
                          
                          {/* Role Column with color badge */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(patient.patientRole)}`}>
                              {patient.patientRole === "recipient" ? "Recipient" : "Donor"}
                            </span>
                           </td>
                          
                          {/* Actions Column with icon buttons */}
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end space-x-1">
                              {/* View Details Button - Navigates to patient detail page */}
                              <button
                                onClick={() => router.push(`/patients/${patient._id}`)}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              
                              {/* Update Button - Opens update modal with patient data */}
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
                              
                              {/* Delete Button - Opens delete confirmation modal */}
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

            {/* PAGINATION CONTROLS */}
            {/* Only show if there is more than one page */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                {/* Progress text showing current range */}
                <div className="text-sm text-[#235347]">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalPatients)} of {totalPatients} patients
                </div>
                
                {/* Pagination Buttons Container */}
                <div className="flex gap-2">
                  {/* Previous Page Button - Disabled on first page */}
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-200 rounded-lg text-[#235347] hover:bg-[#235347] disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {/* Page Number Buttons - Shows up to 5 pages with smart rendering */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Smart page number calculation (handles different scenarios)
                      let pageNum
                      if (totalPages <= 5) {
                        // Case 1: 5 or fewer pages - show all page numbers
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        // Case 2: User is near beginning (pages 1-3) - show pages 1-5
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        // Case 3: User is near end (last 3 pages) - show last 5 pages
                        pageNum = totalPages - 4 + i
                      } else {
                        // Case 4: User is in middle - show current page with 2 on each side
                        pageNum = currentPage - 2 + i
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            currentPage === pageNum
                              ? "bg-[#235347] text-white"  // Active page - dark green background
                              : "border border-gray-200 text-[#235347] hover:bg-[#235347]" // Inactive - light border
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>
                  
                  {/* Next Page Button - Disabled on last page */}
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

        {/*  MODALS  */}
        {/* Popup components for CRUD operations - rendered conditionally based on state */}
        
        {/* Create Patient Modal - Opens when user clicks "Create Patient" button */}
        <CreatePatientModal
          isOpen={createOpen}                                    // Controls visibility
          onClose={() => setCreateOpen(false)}                   // Close handler
          onCreated={() => {                                     // Success callback after creation
            fetchPatients()                                      // Refresh the patient list
            showToast("Patient created successfully", "success") // Show success message
          }}
          showToast={showToast}                                  // Pass toast function to modal
        />

        {/* Delete Patient Modal - Opens when user clicks trash icon */}
        <DeletePatientModal
          isOpen={deleteOpen}
          onClose={() => {
            setDeleteOpen(false)                                 // Close modal
            setSelectedPatient(null)                             // Clear selected patient ID
          }}
          patientId={selectedPatient}                            // ID of patient to delete
          onDeleted={() => {                                     // Success callback after deletion
            fetchPatients()                                      // Refresh the patient list
            showToast("Patient deleted successfully", "success") // Show success message
          }}
          showToast={showToast}
        />

        {/* Update Patient Modal - Opens when user clicks edit icon */}
        <UpdatePatientModal
          isOpen={updateOpen}
          onClose={() => {
            setUpdateOpen(false)                                 // Close modal
            setSelectedPatientData(null)                         // Clear selected patient data
          }}
          patient={selectedPatientData}                          // Full patient object to edit
          onUpdated={() => {                                     // Success callback after update
            fetchPatients()                                      // Refresh the patient list
            showToast("Patient updated successfully", "success") // Show success message
          }}
          showToast={showToast}
        />

        {/* Toast Notification - Temporary message that auto-hides */}
        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}