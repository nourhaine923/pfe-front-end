"use client"

import { useEffect, useState } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { 
  User, 
  Calendar, 
  Droplet, 
  Ruler, 
  Weight, 
  Heart, 
  Syringe, 
  Dna,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserCircle,
  Activity,
  Clock
} from "lucide-react"

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
    {Icon && <Icon className="h-5 w-5 text-purple-600" />}
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
)

const Badge = ({ text, type = "info" }: { text: string; type?: "success" | "warning" | "info" | "danger" }) => {
  const colors = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    info: "bg-blue-100 text-blue-800",
    danger: "bg-red-100 text-red-800"
  }
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type]}`}>
      {text}
    </span>
  )
}

/* -------------------- MAIN COMPONENT -------------------- */

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

interface Props {
  isOpen: boolean
  onClose: () => void
  patient: Patient | null
}

export default function ViewPatientModal({ isOpen, onClose, patient }: Props) {

  const [loading, setLoading] = useState(false)
  const [patientData, setPatientData] = useState<Patient | null>(null)

  useEffect(() => {
    if (patient) {
      setPatientData(patient)
    }
  }, [patient])

  const getRoleColor = (role: string) => {
    const roles: { [key: string]: string } = {
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

  if (!patientData) return null

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-h-[85vh] overflow-y-auto">
        <div className="px-6 py-6">
          {/* Header */}
          <div className="sticky top-0 bg-white pb-4 mb-4 border-b z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <UserCircle className="h-10 w-10 text-purple-600" />
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {patientData.firstName} {patientData.lastName}
                    </h2>
                    <p className="text-sm text-gray-500">MRN: {patientData.medicalRecordNumber || "—"}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Badge 
                    text={patientData.patientRole.replace("_", " ")} 
                    type={getRoleColor(patientData.patientRole)}
                  />
                  <Badge 
                    text={patientData.bloodGroup} 
                    type={getBloodGroupColor(patientData.bloodGroup)}
                  />
                  {patientData.foreignPatient && (
                    <Badge text="Foreign Patient" type="warning" />
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Patient since</p>
                <p className="font-medium">{formatDate(patientData.createdAt)}</p>
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
                    value={`${patientData.firstName} ${patientData.lastName}`} 
                    icon={User}
                  />
                  <InfoRow 
                    label="Sex" 
                    value={patientData.sex} 
                    icon={UserCircle}
                  />
                  {patientData.birthDate && (
                    <>
                      <InfoRow 
                        label="Birth Date" 
                        value={formatDate(patientData.birthDate)} 
                        icon={Calendar}
                      />
                      <InfoRow 
                        label="Age" 
                        value={calculateAge(patientData.birthDate)} 
                        icon={Clock}
                      />
                    </>
                  )}
                </div>
              </div>

              {/* Morphology */}
              {(patientData.heightCm || patientData.weightKg) && (
                <div>
                  <SectionTitle title="Morphology" icon={Ruler} />
                  <div className="grid grid-cols-1 gap-3">
                    {patientData.heightCm && (
                      <InfoRow 
                        label="Height" 
                        value={`${patientData.heightCm} cm`} 
                        icon={Ruler}
                      />
                    )}
                    {patientData.weightKg && (
                      <InfoRow 
                        label="Weight" 
                        value={`${patientData.weightKg} kg`} 
                        icon={Weight}
                      />
                    )}
                    {patientData.heightCm && patientData.weightKg && (
                      <InfoRow 
                        label="BMI" 
                        value={`${(patientData.weightKg / ((patientData.heightCm / 100) ** 2)).toFixed(1)} kg/m²`} 
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
                    value={patientData.bloodGroup} 
                    icon={Droplet}
                    color="text-red-600"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">

              {/* Donor Information */}
              {patientData.patientRole === "donor" && (
                <div>
                  <SectionTitle title="Donor Information" icon={Heart} />
                  <div className="grid grid-cols-1 gap-3">
                    <InfoRow 
                      label="Donor Type" 
                      value={patientData.donorType || "—"} 
                      icon={Heart}
                    />
                    {patientData.ageAtDonation && (
                      <InfoRow 
                        label="Age at Donation" 
                        value={`${patientData.ageAtDonation} years`} 
                        icon={Calendar}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Recipient Clinical Data */}
              {patientData.patientRole === "recipient" && patientData.clinicalData && (
                <div>
                  <SectionTitle title="Clinical Data" icon={Activity} />
                  <div className="grid grid-cols-1 gap-3">
                    {patientData.clinicalData.age_at_transplant && (
                      <InfoRow 
                        label="Age at Transplant" 
                        value={`${patientData.clinicalData.age_at_transplant} years`} 
                        icon={Calendar}
                      />
                    )}
                    {patientData.clinicalData.blood_group && (
                      <InfoRow 
                        label="Clinical Blood Group" 
                        value={patientData.clinicalData.blood_group} 
                        icon={Droplet}
                      />
                    )}
                    {patientData.clinicalData.primary_nephropathy && (
                      <InfoRow 
                        label="Primary Nephropathy" 
                        value={patientData.clinicalData.primary_nephropathy} 
                        icon={AlertCircle}
                      />
                    )}
                    {patientData.clinicalData.dialysis_type && (
                      <InfoRow 
                        label="Dialysis Type" 
                        value={patientData.clinicalData.dialysis_type} 
                        icon={Syringe}
                      />
                    )}
                    {patientData.clinicalData.dialysis_duration && (
                      <InfoRow 
                        label="Dialysis Duration" 
                        value={`${patientData.clinicalData.dialysis_duration} months`} 
                        icon={Clock}
                      />
                    )}
                    {patientData.clinicalData.comorbidities && (
                      <InfoRow 
                        label="Comorbidities" 
                        value={patientData.clinicalData.comorbidities} 
                        icon={AlertCircle}
                      />
                    )}
                    {patientData.clinicalData.transplant_rank && (
                      <InfoRow 
                        label="Transplant Rank" 
                        value={patientData.clinicalData.transplant_rank} 
                        icon={Activity}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* HLA Typing */}
              {patientData.hlaTyping && Object.values(patientData.hlaTyping).some(v => v) && (
                <div>
                  <SectionTitle title="HLA Typing" icon={Dna} />
                  <div className="grid grid-cols-2 gap-3">
                    {patientData.hlaTyping.hlaA1 && (
                      <InfoRow label="HLA A1" value={patientData.hlaTyping.hlaA1} icon={Dna} />
                    )}
                    {patientData.hlaTyping.hlaA2 && (
                      <InfoRow label="HLA A2" value={patientData.hlaTyping.hlaA2} icon={Dna} />
                    )}
                    {patientData.hlaTyping.hlaB1 && (
                      <InfoRow label="HLA B1" value={patientData.hlaTyping.hlaB1} icon={Dna} />
                    )}
                    {patientData.hlaTyping.hlaB2 && (
                      <InfoRow label="HLA B2" value={patientData.hlaTyping.hlaB2} icon={Dna} />
                    )}
                    {patientData.hlaTyping.hlaDR1 && (
                      <InfoRow label="HLA DR1" value={patientData.hlaTyping.hlaDR1} icon={Dna} />
                    )}
                    {patientData.hlaTyping.hlaDR2 && (
                      <InfoRow label="HLA DR2" value={patientData.hlaTyping.hlaDR2} icon={Dna} />
                    )}
                    {patientData.hlaTyping.hlaDQ1 && (
                      <InfoRow label="HLA DQ1" value={patientData.hlaTyping.hlaDQ1} icon={Dna} />
                    )}
                    {patientData.hlaTyping.hlaDQ2 && (
                      <InfoRow label="HLA DQ2" value={patientData.hlaTyping.hlaDQ2} icon={Dna} />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex justify-end">

          </div>
        </div>
      </div>
    </Modal>
  )
}