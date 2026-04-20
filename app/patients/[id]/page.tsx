"use client"

import { useEffect, useState } from "react"
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
import api from "@/services/api"
import Toast from "@/components/ui/Toast"
import DeletePatientModal from "@/components/modals/DeletePatientModal"
import UpdatePatientModal from "@/components/modals/UpdatePatientModal"
import CreateTransfusionModal from "@/components/modals/CreateTransfusionModal"

/* -------------------- SHARED COMPONENTS -------------------- */

const InfoRow = ({ label, value, icon: Icon, color = "text-gray-600" }: any) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className={`mt-0.5 ${color}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="flex-1">
      <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-gray-900 font-medium mt-1">{value || "—"}</p>
    </div>
  </div>
)

const SectionTitle = ({ title, icon: Icon }: any) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
    {Icon && <Icon className="h-5 w-5 text-teal-600" />}
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
)

const Badge = ({ text, type = "info" }: { text: string; type?: "success" | "warning" | "info" | "danger" }) => {
  const colors = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-teal-100 text-teal-800",
    danger: "bg-red-100 text-red-800"
  }
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type]}`}>
      {text}
    </span>
  )
}

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
  clinicalData?: {
    age_at_transplant?: number
    blood_group?: string
    primary_nephropathy?: string
    dialysis_type?: string
    dialysis_duration?: number
    comorbidities?: string
    transplant_rank?: number
  }
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

interface TransfusionEvent {
  _id: string
  transfusionDate: string
  units: number
  aboType: string
  indication: string
}

export default function PatientDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [transfusions, setTransfusions] = useState<TransfusionEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [transfusionOpen, setTransfusionOpen] = useState(false)

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        setLoading(true)
        const res = await api.get(`/patients/${id}`)
        setPatient(res.data)
      } catch (err) {
        console.error("Error fetching patient:", err)
        showToast("Failed to load patient details", "error")
      } finally {
        setLoading(false)
      }
    }

    const fetchTransfusions = async () => {
      try {
        const res = await api.get(`/transfusions/by-patient/${id}`)
        setTransfusions(res.data)
      } catch (err) {
        console.error("Error fetching transfusions:", err)
      }
    }

    if (id) {
      fetchPatient()
      fetchTransfusions()
    }
  }, [id])

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const getRoleColor = (role: string) => {
    const roles: { [key: string]: string } = {
      "recipient": "success",
      "donor": "info",
      "ACTIVE": "success",
      "TRANSPLANT": "info",
      "DIALYSIS": "warning",
      "FOLLOW_UP": "info"
    }
    return roles[role] || "info"
  }

  const getBloodGroupColor = (bloodGroup: string) => {
    const colors: { [key: string]: string } = {
      "A+": "success",
      "A-": "success",
      "B+": "info",
      "B-": "info",
      "AB+": "warning",
      "AB-": "warning",
      "O+": "danger",
      "O-": "danger",
    }
    return colors[bloodGroup] || "info"
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "—"
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return `${age} years`
  }

  const handleDelete = () => setDeleteOpen(true)
  const handleUpdate = () => setUpdateOpen(true)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header with navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/patients")}
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Patients
            </button>
            <div className="flex gap-2">
              {patient.patientRole === "recipient" && (
                <button
                  onClick={() => setTransfusionOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                >
                  <Droplet className="h-4 w-4" />
                  Record Transfusion
                </button>
              )}
              <button
                onClick={handleUpdate}
                className="inline-flex items-center gap-2 px-4 py-2 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Edit2 className="h-4 w-4" />
                Update
              </button>
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-6">
            {/* Header */}
            <div className="pb-4 mb-4 border-b">
              <div className="flex items-start justify-between">
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
                <div className="text-right text-sm text-gray-500">
                  <p>Patient since</p>
                  <p className="font-medium">{formatDate(patient.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column */}
              <div className="space-y-6">
                
                {/* Basic Information */}
                <div>
                  <SectionTitle title="Basic Information" icon={User} />
                  <div className="grid grid-cols-1 gap-3">
                    <InfoRow 
                      label="Full Name" 
                      value={`${patient.firstName} ${patient.lastName}`} 
                      icon={User}
                    />
                    <InfoRow 
                      label="Sex" 
                      value={patient.sex} 
                      icon={UserCircle}
                    />
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

                {/* Morphology */}
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
                      {patient.heightCm && patient.weightKg && (
                        <InfoRow 
                          label="BMI" 
                          value={`${(patient.weightKg / ((patient.heightCm / 100) ** 2)).toFixed(1)} kg/m²`} 
                          icon={Activity}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Blood Group */}
                <div>
                  <SectionTitle title="Blood Group" icon={Droplet} />
                  <div className="grid grid-cols-1 gap-3">
                    <InfoRow 
                      label="Blood Type" 
                      value={patient.bloodGroup} 
                      icon={Droplet}
                      color="text-red-600"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">

                {/* Donor Information */}
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

                {/* Recipient Clinical Data */}
                {patient.patientRole === "recipient" && patient.clinicalData && (
                  <div>
                    <SectionTitle title="Clinical Data" icon={Activity} />
                    <div className="grid grid-cols-1 gap-3">
                      {patient.clinicalData.age_at_transplant && (
                        <InfoRow 
                          label="Age at Transplant" 
                          value={`${patient.clinicalData.age_at_transplant} years`} 
                          icon={Calendar}
                        />
                      )}
                      {patient.clinicalData.primary_nephropathy && (
                        <InfoRow 
                          label="Primary Nephropathy" 
                          value={patient.clinicalData.primary_nephropathy} 
                          icon={AlertCircle}
                        />
                      )}
                      {patient.clinicalData.dialysis_type && (
                        <InfoRow 
                          label="Dialysis Type" 
                          value={patient.clinicalData.dialysis_type} 
                          icon={Syringe}
                        />
                      )}
                      {patient.clinicalData.dialysis_duration && (
                        <InfoRow 
                          label="Dialysis Duration" 
                          value={`${patient.clinicalData.dialysis_duration} months`} 
                          icon={Clock}
                        />
                      )}
                      {patient.clinicalData.comorbidities && (
                        <InfoRow 
                          label="Comorbidities" 
                          value={patient.clinicalData.comorbidities} 
                          icon={AlertCircle}
                        />
                      )}
                      {patient.clinicalData.transplant_rank && (
                        <InfoRow 
                          label="Transplant Rank" 
                          value={patient.clinicalData.transplant_rank} 
                          icon={Activity}
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* HLA Typing */}
                {patient.hlaTyping && Object.values(patient.hlaTyping).some(v => v) && (
                  <div>
                    <SectionTitle title="HLA Typing" icon={Dna} />
                    <div className="grid grid-cols-2 gap-3">
                      {patient.hlaTyping.hlaA1 && (
                        <InfoRow label="HLA A1" value={patient.hlaTyping.hlaA1} icon={Dna} />
                      )}
                      {patient.hlaTyping.hlaA2 && (
                        <InfoRow label="HLA A2" value={patient.hlaTyping.hlaA2} icon={Dna} />
                      )}
                      {patient.hlaTyping.hlaB1 && (
                        <InfoRow label="HLA B1" value={patient.hlaTyping.hlaB1} icon={Dna} />
                      )}
                      {patient.hlaTyping.hlaB2 && (
                        <InfoRow label="HLA B2" value={patient.hlaTyping.hlaB2} icon={Dna} />
                      )}
                      {patient.hlaTyping.hlaDR1 && (
                        <InfoRow label="HLA DR1" value={patient.hlaTyping.hlaDR1} icon={Dna} />
                      )}
                      {patient.hlaTyping.hlaDR2 && (
                        <InfoRow label="HLA DR2" value={patient.hlaTyping.hlaDR2} icon={Dna} />
                      )}
                      {patient.hlaTyping.hlaDQ1 && (
                        <InfoRow label="HLA DQ1" value={patient.hlaTyping.hlaDQ1} icon={Dna} />
                      )}
                      {patient.hlaTyping.hlaDQ2 && (
                        <InfoRow label="HLA DQ2" value={patient.hlaTyping.hlaDQ2} icon={Dna} />
                      )}
                    </div>
                  </div>
                )}

                {/* Transfusion Events */}
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

        {/* Modals */}
        <DeletePatientModal
          isOpen={deleteOpen}
          onClose={() => setDeleteOpen(false)}
          patientId={patient._id}
          onDeleted={() => {
            showToast("Patient deleted successfully")
            setTimeout(() => router.push("/patients"), 1000)
          }}
          showToast={showToast}
        />

        <UpdatePatientModal
          isOpen={updateOpen}
          onClose={() => setUpdateOpen(false)}
          patient={patient}
          onUpdated={() => {
            const fetchUpdatedPatient = async () => {
              try {
                const res = await api.get(`/patients/${id}`)
                setPatient(res.data)
                showToast("Patient updated successfully", "success")
              } catch (err) {
                console.error("Error refreshing patient:", err)
              }
            }
            fetchUpdatedPatient()
          }}
          showToast={showToast}
        />

        <CreateTransfusionModal
          isOpen={transfusionOpen}
          onClose={() => setTransfusionOpen(false)}
          onCreated={() => {
            const fetchTransfusions = async () => {
              try {
                const res = await api.get(`/transfusions/by-patient/${id}`)
                setTransfusions(res.data)
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

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}