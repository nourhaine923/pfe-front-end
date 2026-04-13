export interface PreTransplantAssessment {
  ageAtTransplant: number
  diabetes: boolean
  hypertension: boolean
  hbsAg: boolean
  antiHCV: boolean
  transfusion: boolean
  acc: boolean
  nephropathyType: string
  etiologyIRC: string
  eerModality: string
  eerStartDate: string
  trDelayMonths: number
  serumCreatinine?: number
}

export interface Transplantation {
  _id: string
  id?: string
  transplantNumber: string
  transplantDate: string
  transplantLocation: string
  serviceOrigin: string
  coldIschemiaHours: number
  warmIschemiaMinutes: number
  
  donor_id: string
  recipient_id: string
  
  donor?: {
    _id: string
    firstName: string
    lastName: string
    bloodGroup: string
    medicalRecordNumber: number
    patientRole: string
  }
  
  recipient?: {
    _id: string
    firstName: string
    lastName: string
    bloodGroup: string
    medicalRecordNumber: number
    birthDate?: string
    patientRole: string
  }
  
  preTransplantAssessment?: PreTransplantAssessment
  
  status?: "PENDING" | "APPROVED" | "REJECTED"
  createdAt?: string
  updatedAt?: string
}

export interface Patient {
  _id: string
  medicalRecordNumber: number
  lastName: string
  firstName: string
  sex: string
  bloodGroup: string
  foreignPatient: boolean
  heightCm: number
  weightKg: number
  patientRole: "donor" | "recipient"
  donorType?: string
  ageAtDonation?: number
  birthDate?: string
}