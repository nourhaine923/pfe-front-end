// features/followup/types.ts

export interface VitalSigns {
  _id?: string
  dateTime: string
  heartRate: number
  temperature: number
  oxygenSaturation: number
  urineOutputMl: number
  bloodPressure: number
  followup_id: string
}

export interface BiologicalMeasurement {
  _id?: string
  date: string
  creatinine?: number
  urea?: number
  gfr?: number
  hemoglobin?: number
  crp?: number
  tsh?: number
  proteinuria?: number
  otherBioMarker1?: number
  otherBioMarker2?: number
  followup_id: string
}

export interface ImmunologicalMarker {
  _id?: string
  markerType: string
  timePoint: string
  value: number
  unit: string
  followup_id: string
}

export interface RejectionEpisode {
  _id?: string
  date: string
  type: string
  biopsyProven: boolean
  treatment: string
  resolved: boolean
  grade?: string
  followup_id: string
}

export interface AdverseEvent {
  _id?: string
  eventType: string
  severity: string
  date: string
  comment?: string
  infectionSeverity?: string
  infectionType?: string
  treatment_id: string  
}

export interface TherapeuticTreatment {
  _id?: string
  drugName: string
  dosage: number
  dosageUnit: string
  route: string
  startDate: string
  endDate?: string
  bloodLevel?: number
  interpretation?: string
  followup_id: string
}

export interface ImmunosuppressionRegimen {
  _id?: string
  startDate: string
  endDate?: string | null
  corticosteroids: boolean
  mmf: boolean
  azathioprine: boolean
  tacrolimus: boolean
  ciclosporine: boolean
  sirolimus: boolean
  followup_id: string
}
export interface FollowUp {
  _id: string
  visitDate: string
  postTransplantDay: number
  postTransplantMonth: number
  visitType: string
  clinicalStatus: string
  nephropathyRecurrence: string
  comment?: string
  transplantation_id: string
  transplantation?: {
    _id: string
    transplantNumber: string
    transplantDate: string
    recipient?: {
      _id: string
      firstName: string
      lastName: string
      bloodGroup: string
      medicalRecordNumber: number
    }
    donor?: {
      _id: string
      firstName: string
      lastName: string
      bloodGroup: string
    }
  }
  vitalSigns?: VitalSigns
  immunosuppressionRegimen?: ImmunosuppressionRegimen
  rejectionEpisode?: RejectionEpisode
  biologicalMeasurements?: BiologicalMeasurement[]
  immunologicalMarkers?: ImmunologicalMarker[]
  adverseEvents?: AdverseEvent[]
  therapeuticTreatments?: TherapeuticTreatment[]
}

export interface FullFollowUpData extends FollowUp {
  vitalSigns: VitalSigns | null
  biologicalMeasurements: BiologicalMeasurement[]
  immunologicalMarkers: ImmunologicalMarker[]
  rejectionEpisode: RejectionEpisode | null
  adverseEvents: AdverseEvent[]
  therapeuticTreatments: TherapeuticTreatment[]
  immunosuppressionRegimen: ImmunosuppressionRegimen | null
    score2?: {
    _id: string
    score_type: string
    value: number
    calculated_at: string
    details?: Array<{
      attribute: string
      value: any
      impact: number
    }>
  }
}