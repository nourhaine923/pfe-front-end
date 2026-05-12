"use client" // Next.js directive for client-side rendering (enables interactivity)

// React imports for hooks
import { useEffect, useState } from "react"
// Next.js navigation hooks - useParams gets URL parameters, useRouter for navigation
import { useParams, useRouter } from "next/navigation"
import { 
  User,           
  Calendar,       
  Droplet,        
  Ruler,         
  Weight,         
  Heart,          
  Syringe,        
  Dna,            
  AlertCircle,    
  Clock,          
  UserCircle,     
  Activity,       
  ArrowLeft,      
  Edit2,          
  Trash2          
} from "lucide-react"
// API service for backend calls
import api from "@/services/api"
// Toast notification component for user feedback
import Toast from "@/components/ui/Toast"
// Modal components for CRUD operations
import DeletePatientModal from "@/components/modals/DeletePatientModal"
import UpdatePatientModal from "@/components/modals/UpdatePatientModal"
// Modal for adding transfusion records
import CreateTransfusionModal from "@/components/modals/CreateTransfusionModal"

 //InfoRow Component - Displays a labeled information row with an icon
 //Used throughout the page to show patient data in a consistent format

const InfoRow = ({ label, value, icon: Icon, color = "text-gray-600" }: any) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    {/* Icon container with optional color */}
    <div className={`mt-0.5 ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    {/* Text content container */}
    <div className="flex-1">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-gray-900 font-medium mt-1">{value || "—"}</p>
    </div>
  </div>
)

/**
 * SectionTitle Component - Renders a section header with title and icon
 * Used to organize different sections of patient information
 */
const SectionTitle = ({ title, icon: Icon }: any) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
    {Icon && <Icon className="h-5 w-5 text-teal-600" />}
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
)

/**
 * Badge Component - Shows colored status badges
 * Used for blood type, patient role, and other status indicators
 */
const Badge = ({ text, type = "info" }: { text: string; type?: "success" | "warning" | "info" | "danger" }) => {
  // Color mapping based on badge type
  const colors = {
    success: "bg-green-100 text-green-800",  // Green - positive/success status
    warning: "bg-yellow-100 text-yellow-800", // Yellow - warning/caution
    info: "bg-teal-100 text-teal-800",       // Teal - informational
    danger: "bg-red-100 text-red-800"        // Red - negative/danger status
  }
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type]}`}>
      {text}
    </span>
  )
}

/**
 * Patient Interface - Defines the structure of patient data from backend
 * Includes basic info, clinical data, HLA typing, and donor-specific fields
 */
interface Patient {
  _id: string                    
  firstName: string              
  lastName: string                  
  medicalRecordNumber?: number     
  sex: string                     
  bloodGroup: string          
  heightCm: number                 
  weightKg: number               
  patientRole: string              
  foreignPatient: boolean         
  donorType?: string              
  ageAtDonation?: number              
  birthDate?: string                  
  createdAt?: string                  
  clinicalData?: Array<{              
    age_at_transplant?: number      
    primary_nephropathy?: string     
    dialysis_type?: string            
    dialysis_duration?: number        
    comorbidities?: string            
    transplant_rank?: number         
  }>
  hlaTyping?: {                      
    hlaA1?: string         
    hlaA2?: string            
    hlaB1?: string              
    hlaB2?: string       
    hlaDR1?: string         
    hlaDR2?: string              
    hlaDQ1?: string                   
    hlaDQ2?: string                 
  }
}

//TransfusionEvent Interface - Defines blood transfusion record structure
interface TransfusionEvent {
  _id: string                        
  transfusionDate: string             
  units: number                       
  aboType: string                     
  indication: string                  
}

/**
 * Main Component - Patient Details Page
 * Displays comprehensive patient information including medical history,
 * HLA typing, and transfusion records
 */
export default function PatientDetailsPage() {
  // Get patient ID from URL parameter (e.g., /patients/123 → id = "123")
  const { id } = useParams()
  const router = useRouter()           // For programmatic navigation
  
  // STATE MANAGEMENT
  const [patient, setPatient] = useState<Patient | null>(null)        // Current patient data
  const [transfusions, setTransfusions] = useState<TransfusionEvent[]>([])  // Transfusion history
  const [loading, setLoading] = useState(true)                       // Loading indicator
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null)  // Toast notifications
  const [deleteOpen, setDeleteOpen] = useState(false)                // Delete modal visibility
  const [updateOpen, setUpdateOpen] = useState(false)                // Update modal visibility
  const [transfusionOpen, setTransfusionOpen] = useState(false)       // Add transfusion modal visibility

  /**
   * EFFECT HOOK - Fetches data when component mounts or ID changes
   * Fetches both patient details and transfusion history in parallel
   */
  useEffect(() => {
    /**
     * Fetch patient details from API
     */
    const fetchPatient = async () => {
      try {
        setLoading(true)  // Show loading spinner
        const res = await api.get(`/patients/${id}`)  // GET request for patient data
        setPatient(res.data)  // Store patient data in state
      } catch (err) {
        console.error("Error fetching patient:", err)
        showToast("Failed to load patient details", "error")  // Show error message
      } finally {
        setLoading(false)  // Hide loading spinner
      }
    }

    /**
     * Fetch transfusion history for this patient
     */
    const fetchTransfusions = async () => {
      try {
        const res = await api.get(`/transfusions/by-patient/${id}`)
        setTransfusions(res.data)  // Store transfusion records
      } catch (err) {
        console.error("Error fetching transfusions:", err)
        // Don't show toast for this - it's secondary data
      }
    }

    // Only fetch if we have a patient ID
    if (id) {
      fetchPatient()
      fetchTransfusions()
    }
  }, [id])  // Re-run effect when ID changes

  /**
   * Helper function to show toast notifications
   * @param message - Text to display
   * @param type - Notification style (success/error/warning)
   */
  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)  // Auto-hide after 3 seconds
  }

  /**
   * Maps patient role to badge color type
   * @param role - Patient role (recipient/donor/ACTIVE/etc.)
   * @returns Badge type string for styling
   */
  const getRoleColor = (role: string) => {
    const roles: { [key: string]: string } = {
      "recipient": "success",    // Green for recipients
      "donor": "info",          // Teal for donors
      "ACTIVE": "success",      // Green for active status
      "TRANSPLANT": "info",     // Teal for transplant status
      "DIALYSIS": "warning",    // Yellow for dialysis
      "FOLLOW_UP": "info"       // Teal for follow-up
    }
    return roles[role] || "info"  // Default to info color
  }

  /**
   * Maps blood group to badge color
   * Different blood types get different colors for visual distinction
   * @param bloodGroup - Blood type string
   * @returns Badge type string
   */
  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: { [key: string]: string } = {
      "A+": "success",   // Green for A+
      "A-": "success",   // Green for A-
      "B+": "info",      // Teal for B+
      "B-": "info",      // Teal for B-
      "AB+": "warning",  // Yellow for AB+
      "AB-": "warning",  // Yellow for AB-
      "O+": "danger",    // Red for O+
      "O-": "danger",    // Red for O- (universal donor)
    }
    return colors[bloodGroup] || "info"
  }

  /**
   * Formats a date string into readable format (e.g., "January 15, 2024")
   * @param dateString - ISO date string or undefined
   * @returns Formatted date string or "—" for missing data
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    } catch (error) {
      return "—"  // Fallback for invalid dates
    }
  }

  /**
   * Extracts timestamp from MongoDB ObjectId
   * MongoDB ObjectIds contain a timestamp in the first 4 bytes
   * @param id - MongoDB ObjectId string
   * @returns Date object extracted from ID
   */
  const getDateFromObjectId = (id: string): Date => {
    // First 8 characters (4 bytes) represent seconds since Unix epoch in hex
    return new Date(parseInt(id.substring(0, 8), 16) * 1000)
  }

  /**
   * Gets patient registration date from either createdAt field or ObjectId
   * @param patient - Patient object
   * @returns Formatted registration date
   */
  const getRegistrationDate = (patient: Patient): string => {
    if (patient.createdAt) {
      return formatDate(patient.createdAt)  // Use explicit timestamp if available
    }
    // Fallback: extract from MongoDB ObjectId
    try {
      return formatDate(getDateFromObjectId(patient._id).toISOString())
    } catch (error) {
      return "—"
    }
  }

  /**
   * Calculates age from birth date
   * Handles edge cases like future dates and leap years
   * @param birthDate - Date of birth string
   * @returns Age in years or "—" if no birth date
   */
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "—"
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    // Adjust if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return `${age} years`
  }

  // Event handlers for modal operations
  const handleDelete = () => setDeleteOpen(true)   // Open delete confirmation modal
  const handleUpdate = () => setUpdateOpen(true)   // Open update modal

  // LOADING STATE - Show spinner while fetching data
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient details...</p>
        </div>
      </div>
    )
  }

  // NOT FOUND STATE - Show error when patient doesn't exist
  if (!patient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Patient Not Found</h2>
          <p className="text-gray-600 mb-4">The requested patient could not be found.</p>
          <button
            onClick={() => router.push("/patients")}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Back to Patients
          </button>
        </div>
      </div>
    )
  }

  // MAIN RENDER - Display patient details
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER SECTION with navigation and action buttons */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {/* Back button - returns to patient list */}
            <button
              onClick={() => router.push("/patients")}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Patients
            </button>
            
            {/* Action buttons container */}
            <div className="flex gap-2">
              {/* Add Transfusion button - Only shows for recipients */}
              {patient.patientRole === "recipient" && (
                <button
                  onClick={() => setTransfusionOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <Droplet className="h-4 w-4" />
                  Add Transfusion
                </button>
              )}
              
              {/* Update button - Opens edit modal */}
              <button
                onClick={handleUpdate}
                className="inline-flex items-center gap-2 px-4 py-2 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Update
              </button>
              
              {/* Delete button - Opens delete confirmation */}
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* MAIN CARD - Container for all patient information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-6">
            
            {/* PATIENT HEADER - Name, MRN, badges, and registration date */}
            <div className="pb-4 mb-4 border-b">
              <div className="flex items-start justify-between">
                {/* Left side - Patient identity */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <UserCircle className="h-10 w-10 text-teal-600" />
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </h1>
                      <p className="text-sm text-gray-500">MRN: {patient.medicalRecordNumber || "—"}</p>
                    </div>
                  </div>
                  {/* Status badges */}
                  <div className="flex gap-2 mt-2">
                    <Badge 
                      text={patient.patientRole === "recipient" ? "Recipient" : 
                            patient.patientRole === "donor" ? "Donor" : 
                            patient.patientRole.replace("_", " ")} 
                      type={getRoleColor(patient.patientRole)}
                    />
                    <Badge 
                      text={patient.bloodGroup} 
                      type={getBloodGroupColor(patient.bloodGroup)}
                    />
                    {patient.foreignPatient && (
                      <Badge text="Foreign Patient" type="warning" />
                    )}
                  </div>
                </div>
                
                {/* Right side - Registration date */}
                <div className="text-right text-sm text-gray-500">
                  <p>Patient since</p>
                  <p className="font-medium">{getRegistrationDate(patient)}</p>
                </div>
              </div>
            </div>

            {/* TWO-COLUMN LAYOUT for detailed information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* LEFT COLUMN - Basic info, morphology, blood group */}
              <div className="space-y-6">
                
                {/* Basic Information Section */}
                <div>
                  <SectionTitle title="Basic Information" icon={User} />
                  <div className="grid grid-cols-1 gap-3">
                    <InfoRow 
                      label="Full Name" 
                      value={`${patient.firstName} ${patient.lastName}`} 
                      icon={User}
                    />
                    <InfoRow 
                      label="Gender" 
                      value={patient.sex} 
                      icon={UserCircle}
                    />
                    {/* Conditional rendering - only show if birth date exists */}
                    {patient.birthDate && (
                      <>
                        <InfoRow 
                          label="Birth Date" 
                          value={formatDate(patient.birthDate)} 
                          icon={Calendar}
                        />
                        <InfoRow 
                          label="Age" 
                          value={calculateAge(patient.birthDate)} 
                          icon={Clock}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Morphology Section - Physical measurements */}
                {(patient.heightCm || patient.weightKg) && (
                  <div>
                    <SectionTitle title="Morphology" icon={Ruler} />
                    <div className="grid grid-cols-1 gap-3">
                      {patient.heightCm && (
                        <InfoRow 
                          label="Height" 
                          value={`${patient.heightCm} cm`} 
                          icon={Ruler}
                        />
                      )}
                      {patient.weightKg && (
                        <InfoRow 
                          label="Weight" 
                          value={`${patient.weightKg} kg`} 
                          icon={Weight}
                        />
                      )}
                      {/* BMI Calculation - Only if both height and weight exist */}
                      {patient.heightCm && patient.weightKg && (
                        <InfoRow 
                          label="BMI" 
                          // BMI formula: weight(kg) / height(m)²
                          value={`${(patient.weightKg / ((patient.heightCm / 100) ** 2)).toFixed(1)} kg/m²`} 
                          icon={Activity}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Blood Group Section */}
                <div>
                  <SectionTitle title="Blood Group" icon={Droplet} />
                  <div className="grid grid-cols-1 gap-3">
                    <InfoRow 
                      label="Blood Type" 
                      value={patient.bloodGroup} 
                      icon={Droplet}
                      color="text-red-600"  // Red color for blood-related info
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN - Donor info, clinical data, HLA typing, transfusions */}
              <div className="space-y-6">

                {/* Donor Information Section - Only for donors */}
                {patient.patientRole === "donor" && (
                  <div>
                    <SectionTitle title="Donor Information" icon={Heart} />
                    <div className="grid grid-cols-1 gap-3">
                      <InfoRow 
                        label="Donor Type" 
                        value={patient.donorType || "—"} 
                        icon={Heart}
                      />
                      {patient.ageAtDonation && (
                        <InfoRow 
                          label="Age at Donation" 
                          value={`${patient.ageAtDonation} years`} 
                          icon={Calendar}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Recipient Clinical Data Section - Shows medical history for transplant patients */}
                {patient.patientRole === "recipient" && patient.clinicalData && patient.clinicalData.length > 0 && (
                  <div>
                    <SectionTitle title="Clinical Data" icon={Activity} />
                    <div className="grid grid-cols-1 gap-3">
                      {/* Immediately Invoked Function Expression (IIFE) to safely access clinical data */}
                      {(() => {
                        const clinical = patient.clinicalData?.[0] || {}  // Get first entry
                        return (
                          <>
                            {clinical.age_at_transplant && (
                              <InfoRow 
                                label="Age at Transplant" 
                                value={`${clinical.age_at_transplant} years`} 
                                icon={Calendar}
                              />
                            )}
                            {clinical.primary_nephropathy && (
                              <InfoRow 
                                label="Primary Nephropathy" 
                                value={clinical.primary_nephropathy} 
                                icon={AlertCircle}
                              />
                            )}
                            {clinical.dialysis_type && (
                              <InfoRow 
                                label="Dialysis Type" 
                                value={clinical.dialysis_type} 
                                icon={Syringe}
                              />
                            )}
                            {clinical.dialysis_duration && (
                              <InfoRow 
                                label="Dialysis Duration" 
                                value={`${clinical.dialysis_duration} months`} 
                                icon={Clock}
                              />
                            )}
                            {clinical.comorbidities && (
                              <InfoRow 
                                label="Comorbidities" 
                                value={clinical.comorbidities} 
                                icon={AlertCircle}
                              />
                            )}
                            {clinical.transplant_rank && (
                              <InfoRow 
                                label="Transplant Rank" 
                                value={clinical.transplant_rank} 
                                icon={Activity}
                              />
                            )}
                          </>
                        )
                      })()}
                    </div>
                  </div>
                )}

                {/* HLA Typing Section - Crucial for transplant matching */}
                {patient.hlaTyping && Object.values(patient.hlaTyping).some(v => v) && (
                  <div>
                    <SectionTitle title="HLA Typing" icon={Dna} />
                    <div className="grid grid-cols-2 gap-3">
                      {/* HLA-A locus (2 alleles) */}
                      {patient.hlaTyping.hlaA1 && (
                        <InfoRow label="HLA A1" value={patient.hlaTyping.hlaA1} icon={Dna} />
                      )}
                      {patient.hlaTyping.hlaA2 && (
                        <InfoRow label="HLA A2" value={patient.hlaTyping.hlaA2} icon={Dna} />
                      )}
                      {/* HLA-B locus (2 alleles) */}
                      {patient.hlaTyping.hlaB1 && (
                        <InfoRow label="HLA B1" value={patient.hlaTyping.hlaB1} icon={Dna} />
                      )}
                      {patient.hlaTyping.hlaB2 && (
                        <InfoRow label="HLA B2" value={patient.hlaTyping.hlaB2} icon={Dna} />
                      )}
                      {/* HLA-DR locus (2 alleles) */}
                      {patient.hlaTyping.hlaDR1 && (
                        <InfoRow label="HLA DR1" value={patient.hlaTyping.hlaDR1} icon={Dna} />
                      )}
                      {patient.hlaTyping.hlaDR2 && (
                        <InfoRow label="HLA DR2" value={patient.hlaTyping.hlaDR2} icon={Dna} />
                      )}
                      {/* HLA-DQ locus (2 alleles) */}
                      {patient.hlaTyping.hlaDQ1 && (
                        <InfoRow label="HLA DQ1" value={patient.hlaTyping.hlaDQ1} icon={Dna} />
                      )}
                      {patient.hlaTyping.hlaDQ2 && (
                        <InfoRow label="HLA DQ2" value={patient.hlaTyping.hlaDQ2} icon={Dna} />
                      )}
                    </div>
                  </div>
                )}

                {/* Transfusion Events Section - History of blood transfusions */}
                {transfusions.length > 0 && (
                  <div>
                    <SectionTitle title="Transfusion Events" icon={Droplet} />
                    <div className="space-y-3">
                      {transfusions.map((t) => (
                        <div key={t._id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(t.transfusionDate)} - {t.aboType}
                            </p>
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-teal-100 text-teal-800">
                              {t.units} unit(s)
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">Indication: {t.indication}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MODALS - Popup components for user actions */}
        
        {/* Delete Confirmation Modal */}
        <DeletePatientModal
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          patientId={patient._id}
          onDeleted={() => {
            showToast("Patient deleted successfully")
            setTimeout(() => router.push("/patients"), 1000)  // Navigate after deletion
          }}
          showToast={showToast}
        />

        {/* Update Patient Modal */}
        <UpdatePatientModal
          isOpen={updateOpen}
          onClose={() => setUpdateOpen(false)}
          patient={patient}
          onUpdated={() => {
            // Refresh patient data after update
            const fetchUpdatedPatient = async () => {
              try {
                const res = await api.get(`/patients/${id}`)
                setPatient(res.data)  // Update state with fresh data
                showToast("Patient updated successfully", "success")
              } catch (err) {
                console.error("Error refreshing patient:", err)
              }
            }
            fetchUpdatedPatient()
          }}
          showToast={showToast}
        />

        {/* Create Transfusion Modal */}
        <CreateTransfusionModal
          isOpen={transfusionOpen}
          onClose={() => setTransfusionOpen(false)}
          onCreated={() => {
            // Refresh transfusion list after adding new record
            const fetchTransfusions = async () => {
              try {
                const res = await api.get(`/transfusions/by-patient/${id}`)
                setTransfusions(res.data)  // Update transfusion state
              } catch (err) {
                console.error("Error fetching transfusions:", err)
              }
            }
            fetchTransfusions()
            showToast("Transfusion event recorded successfully", "success")
          }}
          patientId={patient._id}
          patientName={`${patient.firstName} ${patient.lastName}`}
          showToast={showToast}
        />

        {/* Toast Notification - Temporary message popup */}
        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}