// components/modals/CreateFollowUpModal.tsx

"use client"

import { useEffect, useState, useCallback } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { 
  Calendar, 
  Activity, 
  Heart, 
  FileText, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Droplet,
  Dna,
  Pill,
  Shield,
  AlertTriangle
} from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  showToast?: (message: string, type?: "success" | "error" | "warning") => void
  preSelectedTransplantationId?: string | null
}

interface Transplantation {
  _id: string
  transplantNumber: string
  transplantDate: string
  recipient?: {
    _id: string
    firstName: string
    lastName: string
  }
}

// Form field components
const InputField = ({ label, name, placeholder, required = false, type = "text", value, onChange, error }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all
      ${error ? "border-red-500" : "border-gray-300"}`}
    />
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
)

const SelectField = ({ label, name, options, value, onChange, error, required = false }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white
      ${error ? "border-red-500" : "border-gray-300"}`}
    >
      <option value="">Select {label}</option>
      {options.map((opt: any) => (
        <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
          {typeof opt === 'object' ? opt.label : opt}
        </option>
      ))}
    </select>
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
)

const TextAreaField = ({ label, name, placeholder, value, onChange, error }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      name={name}
      placeholder={placeholder}
      value={value || ""}
      onChange={onChange}
      rows={3}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent
      ${error ? "border-red-500" : "border-gray-300"}`}
    />
    {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
  </div>
)

const CheckboxField = ({ label, name, checked, onChange }: any) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3">
    <label className="text-sm font-medium text-gray-700">{label}</label>
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        name={name}
        checked={checked || false}
        onChange={onChange}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
    </label>
  </div>
)

const SectionTitle = ({ title, icon: Icon }: { title: string; icon?: any }) => (
  <div className="flex items-center gap-2 mt-4 mb-4 pb-2 border-b border-gray-200">
    {Icon && <Icon className="h-5 w-5 text-teal-600" />}
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
)

export default function CreateFollowUpModal({ isOpen, onClose, onCreated, showToast, preSelectedTransplantationId }: Props) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 7

  // Step 1: Basic Follow-up Info
  const [basicForm, setBasicForm] = useState({
    transplantation_id: "",
    visitDate: "",
    postTransplantDay: "",
    postTransplantMonth: "",
    visitType: "",
    clinicalStatus: "",
    comment: "",
    nephropathyRecurrence: ""
  })

  // Step 2: Vital Signs
  const [vitalSignsForm, setVitalSignsForm] = useState({
    dateTime: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    urineOutputMl: "",
    mentalStatus: "",
    bloodPressure: "",
    graftUltraSound: ""
  })

  // Step 3: Biological Measurements
  const [biologicalForm, setBiologicalForm] = useState({
    date: "",
    creatinine: "",
    urea: "",
    gfr: "",
    hemoglobin: "",
    crp: "",
    tsh: "",
    proteinuria: "",
    otherBioMarker1: "",
    otherBioMarker2: ""
  })

  // Step 4: Immunological Markers
  const [immunologicalForm, setImmunologicalForm] = useState({
    markerType: "",
    timePoint: "",
    value: "",
    unit: ""
  })

  // Step 5: Rejection Episode
  const [rejectionForm, setRejectionForm] = useState({
    date: "",
    type: "",
    grade: "",
    biopsyProven: false,
    treatment: "",
    resolved: false
  })

  // Step 6: Immunosuppression Regimen
  const [immunosuppressionForm, setImmunosuppressionForm] = useState({
    startDate: "",
    endDate: "",
    corticosteroids: false,
    mmf: false,
    azathioprine: false,
    tacrolimus: false,
    ciclosporine: false,
    sirolimus: false
  })

  // Step 7: Treatments & Adherence & Adverse Events
  const [treatmentForm, setTreatmentForm] = useState({
    drugName: "",
    dosage: "",
    dosageUnit: "",
    route: "",
    startDate: "",
    endDate: "",
    bloodLevel: "",
    interpretation: ""
  })

  const [adherenceForm, setAdherenceForm] = useState({
    date: "",
    adherencePercent: "",
    method: ""
  })

  const [adverseEventForm, setAdverseEventForm] = useState({
    eventType: "",
    severity: "",
    date: "",
    comment: "",
    infectionSeverity: "",
    infectionType: ""
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [transplantations, setTransplantations] = useState<Transplantation[]>([])
  const [fetchingData, setFetchingData] = useState(true)
  const [selectedTransplant, setSelectedTransplant] = useState<Transplantation | null>(null)
  const [calculatedDay, setCalculatedDay] = useState<number | null>(null)
  const [calculatedMonth, setCalculatedMonth] = useState<number | null>(null)

  const visitTypeOptions = ["Scheduled", "Emergency", "Follow-up"]
  const clinicalStatusOptions = ["Stable", "Improving", "Worsening", "Critical"]
  const nephropathyRecurrenceOptions = ["None", "Mild", "Moderate", "Severe"]
  const mentalStatusOptions = ["Alert", "Confused", "Lethargic", "Unresponsive"]
  const markerTypeOptions = ["Anti-HLA Class I", "Anti-HLA Class II", "DSA - Donor Specific Antibodies", "PRA - Panel Reactive Antibodies"]
  const timePointOptions = ["Pre-transplant", "Day 7", "Month 1", "Month 3", "Month 6", "Month 12"]
  const unitOptions = ["MFI", "%", "copies/mL", "IU/mL", "Ratio", "Titer"]
  const rejectionTypes = ["Cellular", "AntibodyMediated", "Mixed"]
  const banffGrades = ["Borderline", "IA", "IB", "IIA", "IIB", "III", "Antibody-Mediated Rejection (AMR)"]
  const treatmentOptions = ["IV Methylprednisolone", "Thymoglobulin", "Rituximab", "Plasmapheresis", "IVIG", "Bortezomib", "Eculizumab"]
  const drugNameOptions = ["Tacrolimus (Prograf)", "Cyclosporine (Neoral)", "Mycophenolate Mofetil (CellCept)", "Azathioprine (Imuran)", "Sirolimus (Rapamune)", "Prednisone"]
  const dosageUnitOptions = ["mg", "g", "mcg", "mg/kg"]
  const routeOptions = ["Oral", "IV", "IM", "Subcutaneous"]
  const methodOptions = ["Patient Self-Report", "Pill Count", "Pharmacy Refill Records", "Electronic Monitoring"]
  const eventTypeOptions = ["Infection", "Surgical Complication", "Cardiovascular Event", "Metabolic Disorder", "Drug Toxicity"]
  const severityOptions = ["Mild", "Moderate", "Severe", "Life-threatening"]

  useEffect(() => {
    if (isOpen) {
      fetchTransplantations()
      setCurrentStep(1)
    }
  }, [isOpen])

  // Handle pre-selected transplantation
  useEffect(() => {
    if (preSelectedTransplantationId && transplantations.length > 0 && isOpen) {
      const preselectedTx = transplantations.find(t => t._id === preSelectedTransplantationId)
      if (preselectedTx) {
        setBasicForm(prev => ({ ...prev, transplantation_id: preSelectedTransplantationId }))
        setSelectedTransplant(preselectedTx)
      }
    }
  }, [preSelectedTransplantationId, transplantations, isOpen])

  const fetchTransplantations = async () => {
    try {
      setFetchingData(true)
      const txRes = await api.get("/transplantations", { params: { limit: 100 } })
      const allTransplantations = txRes.data.data || txRes.data || []
      setTransplantations(Array.isArray(allTransplantations) ? allTransplantations : [])
    } catch (err) {
      console.error("Error fetching data:", err)
      showToast?.("Failed to load required data", "error")
    } finally {
      setFetchingData(false)
    }
  }

  const calculatePostTransplantDays = useCallback((transplantDate: string, visitDate: string) => {
    if (!transplantDate || !visitDate) return
    const txDate = new Date(transplantDate)
    const visit = new Date(visitDate)
    if (visit < txDate) {
      showToast?.("Visit date cannot be before transplant date", "error")
      return
    }
    const diffTime = Math.abs(visit.getTime() - txDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    const diffMonths = Math.floor(diffDays / 30.44)
    setCalculatedDay(diffDays)
    setCalculatedMonth(diffMonths)
    setBasicForm(prev => ({
      ...prev,
      postTransplantDay: diffDays.toString(),
      postTransplantMonth: diffMonths.toString()
    }))
  }, [showToast])

  const handleTransplantationChange = (txId: string) => {
    setBasicForm(prev => ({ ...prev, transplantation_id: txId }))
    const tx = transplantations.find(t => t._id === txId)
    setSelectedTransplant(tx || null)
    if (tx && basicForm.visitDate) {
      calculatePostTransplantDays(tx.transplantDate, basicForm.visitDate)
    }
  }

  const handleVisitDateChange = (date: string) => {
    setBasicForm(prev => ({ ...prev, visitDate: date }))
    if (selectedTransplant && date) {
      calculatePostTransplantDays(selectedTransplant.transplantDate, date)
    }
    // Auto-fill dates for child forms
    setVitalSignsForm(prev => ({ ...prev, dateTime: `${date}T09:00` }))
    setBiologicalForm(prev => ({ ...prev, date: date }))
    setImmunologicalForm(prev => ({ ...prev, timePoint: "Month 1" }))
    setRejectionForm(prev => ({ ...prev, date: date }))
    setAdherenceForm(prev => ({ ...prev, date: date }))
    setTreatmentForm(prev => ({ ...prev, startDate: date }))
    setAdverseEventForm(prev => ({ ...prev, date: date }))
    setImmunosuppressionForm(prev => ({ ...prev, startDate: date }))
  }

  const validateStep = (step: number): boolean => {
    const newErrors: any = {}
    if (step === 1) {
      if (!basicForm.transplantation_id) newErrors.transplantation_id = "Please select a transplantation"
      if (!basicForm.visitDate) newErrors.visitDate = "Visit date is required"
      if (!basicForm.visitType) newErrors.visitType = "Visit type is required"
      if (!basicForm.clinicalStatus) newErrors.clinicalStatus = "Clinical status is required"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const createFollowUp = async () => {
    try {
      const payload = {
        transplantation_id: basicForm.transplantation_id,
        visitDate: basicForm.visitDate,
        postTransplantDay: calculatedDay || Number(basicForm.postTransplantDay),
        postTransplantMonth: calculatedMonth || Number(basicForm.postTransplantMonth),
        visitType: basicForm.visitType,
        clinicalStatus: basicForm.clinicalStatus,
        comment: basicForm.comment || null,
        nephropathyRecurrence: basicForm.nephropathyRecurrence || "None"
      }
      const response = await api.post("/followups", payload)
      return response.data.id
    } catch (err: any) {
      throw err
    }
  }

  const createChildData = async (followUpId: string) => {
    const promises = []

    // Vital Signs
    if (vitalSignsForm.heartRate && vitalSignsForm.temperature && vitalSignsForm.oxygenSaturation) {
      promises.push(api.post("/vitals", {
        followup_id: followUpId,
        dateTime: vitalSignsForm.dateTime || `${basicForm.visitDate}T09:00`,
        heartRate: Number(vitalSignsForm.heartRate),
        temperature: Number(vitalSignsForm.temperature),
        oxygenSaturation: Number(vitalSignsForm.oxygenSaturation),
        urineOutputMl: Number(vitalSignsForm.urineOutputMl) || 0,
        mentalStatus: vitalSignsForm.mentalStatus || "Alert",
        bloodPressure: Number(vitalSignsForm.bloodPressure) || 120,
        graftUltraSound: vitalSignsForm.graftUltraSound || null
      }).catch(e => console.error("Vital signs error:", e)))
    }

    // Biological
    if (biologicalForm.creatinine || biologicalForm.urea || biologicalForm.gfr) {
      promises.push(api.post("/biological", {
        followup_id: followUpId,
        date: biologicalForm.date || basicForm.visitDate,
        creatinine: biologicalForm.creatinine ? Number(biologicalForm.creatinine) : null,
        urea: biologicalForm.urea ? Number(biologicalForm.urea) : null,
        gfr: biologicalForm.gfr ? Number(biologicalForm.gfr) : null,
        hemoglobin: biologicalForm.hemoglobin ? Number(biologicalForm.hemoglobin) : null,
        crp: biologicalForm.crp ? Number(biologicalForm.crp) : null,
        tsh: biologicalForm.tsh ? Number(biologicalForm.tsh) : null,
        proteinuria: biologicalForm.proteinuria ? Number(biologicalForm.proteinuria) : null,
        otherBioMarker1: biologicalForm.otherBioMarker1 ? Number(biologicalForm.otherBioMarker1) : null,
        otherBioMarker2: biologicalForm.otherBioMarker2 ? Number(biologicalForm.otherBioMarker2) : null
      }).catch(e => console.error("Biological error:", e)))
    }

    // Immunological
    if (immunologicalForm.markerType && immunologicalForm.value) {
      promises.push(api.post("/immunological", {
        followup_id: followUpId,
        markerType: immunologicalForm.markerType,
        timePoint: immunologicalForm.timePoint || "Month 1",
        value: Number(immunologicalForm.value),
        unit: immunologicalForm.unit || "MFI"
      }).catch(e => console.error("Immunological error:", e)))
    }

    // Rejection
    if (rejectionForm.type && rejectionForm.grade) {
      promises.push(api.post("/rejections", {
        followup_id: followUpId,
        date: rejectionForm.date || basicForm.visitDate,
        type: rejectionForm.type,
        grade: rejectionForm.grade,
        biopsyProven: rejectionForm.biopsyProven,
        treatment: rejectionForm.treatment,
        resolved: rejectionForm.resolved
      }).catch(e => console.error("Rejection error:", e)))
    }

    // Immunosuppression
    if (immunosuppressionForm.startDate) {
      promises.push(api.post("/immunosuppressions", {
        followup_id: followUpId,
        startDate: immunosuppressionForm.startDate,
        endDate: immunosuppressionForm.endDate || null,
        corticosteroids: immunosuppressionForm.corticosteroids,
        mmf: immunosuppressionForm.mmf,
        azathioprine: immunosuppressionForm.azathioprine,
        tacrolimus: immunosuppressionForm.tacrolimus,
        ciclosporine: immunosuppressionForm.ciclosporine,
        sirolimus: immunosuppressionForm.sirolimus
      }).catch(e => console.error("Immunosuppression error:", e)))
    }

    // Treatment
    if (treatmentForm.drugName && treatmentForm.dosage) {
      promises.push(api.post("/treatments", {
        followup_id: followUpId,
        drugName: treatmentForm.drugName,
        dosage: Number(treatmentForm.dosage),
        dosageUnit: treatmentForm.dosageUnit || "mg",
        route: treatmentForm.route || "Oral",
        startDate: treatmentForm.startDate || basicForm.visitDate,
        endDate: treatmentForm.endDate || null,
        bloodLevel: treatmentForm.bloodLevel ? Number(treatmentForm.bloodLevel) : null,
        interpretation: treatmentForm.interpretation || null
      }).catch(e => console.error("Treatment error:", e)))
    }

    // Adherence
    if (adherenceForm.adherencePercent) {
      promises.push(api.post("/adherence", {
        followup_id: followUpId,
        date: adherenceForm.date || basicForm.visitDate,
        adherencePercent: Number(adherenceForm.adherencePercent),
        method: adherenceForm.method || "Patient Self-Report"
      }).catch(e => console.error("Adherence error:", e)))
    }

    // Adverse Event (optional)
    if (adverseEventForm.eventType && adverseEventForm.severity) {
      promises.push(api.post("/adverse-events", {
        followup_id: followUpId,
        eventType: adverseEventForm.eventType,
        severity: adverseEventForm.severity,
        date: adverseEventForm.date || basicForm.visitDate,
        comment: adverseEventForm.comment || null,
        infectionSeverity: adverseEventForm.infectionSeverity || null,
        infectionType: adverseEventForm.infectionType || null
      }).catch(e => console.error("Adverse event error:", e)))
    }

    await Promise.all(promises)
  }

  const handleFinish = async () => {
    if (!validateStep(1)) {
      showToast?.("Please complete the basic information", "error")
      setCurrentStep(1)
      return
    }

    try {
      setLoading(true)
      const followUpId = await createFollowUp()
      await createChildData(followUpId)
      showToast?.("Follow-up created successfully with all data!", "success")
      onCreated()
      handleClose()
    } catch (err: any) {
      console.error("Create follow-up error:", err)
      showToast?.(err.response?.data?.detail || "Failed to create follow-up", "error")
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep === 1 && !validateStep(1)) return
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleClose = () => {
    setBasicForm({
      transplantation_id: "",
      visitDate: "",
      postTransplantDay: "",
      postTransplantMonth: "",
      visitType: "",
      clinicalStatus: "",
      comment: "",
      nephropathyRecurrence: ""
    })
    setErrors({})
    setCurrentStep(1)
    setSelectedTransplant(null)
    setCalculatedDay(null)
    setCalculatedMonth(null)
    onClose()
  }

  const getTransplantDisplay = (tx: Transplantation) => {
    const recipientName = tx.recipient ? `${tx.recipient.firstName} ${tx.recipient.lastName}` : "Unknown"
    return `${tx.transplantNumber} - ${recipientName} (${new Date(tx.transplantDate).toLocaleDateString()})`
  }

  const stepTitles = [
    "Basic Information",
    "Vital Signs",
    "Biological Measurements",
    "Immunological Markers",
    "Rejection Episode",
    "Immunosuppression",
    "Treatments & More"
  ]

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[85vh] overflow-y-auto w-full md:w-[700px] lg:w-[900px]">
        <div className="px-6 py-6">
          <div className="sticky top-0 bg-white pb-4 mb-4 border-b z-10">
            <div className="flex items-center gap-3">
              <div className="bg-teal-100 rounded-full p-2">
                <Activity className="h-6 w-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-teal-900">Create Follow-up</h2>
                <p className="text-sm text-gray-500 mt-1">Step {currentStep} of {totalSteps}: {stepTitles[currentStep - 1]}</p>
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-1.5 rounded-full transition-all ${
                    i + 1 === currentStep
                      ? "bg-teal-600"
                      : i + 1 < currentStep
                      ? "bg-teal-400"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {fetchingData && currentStep === 1 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <>
                  <SectionTitle title="Transplantation Information" icon={Heart} />
                  <SelectField
                    label="Transplantation"
                    name="transplantation_id"
                    options={transplantations.map(tx => ({ value: tx._id, label: getTransplantDisplay(tx) }))}
                    required
                    value={basicForm.transplantation_id}
                    onChange={(e: any) => handleTransplantationChange(e.target.value)}
                    error={errors.transplantation_id}
                  />
                  {selectedTransplant && (
                    <div className="bg-teal-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-teal-700">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Transplant Date: {new Date(selectedTransplant.transplantDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}

                  <SectionTitle title="Visit Information" icon={Calendar} />
                  <InputField
                    label="Visit Date"
                    name="visitDate"
                    type="date"
                    required
                    value={basicForm.visitDate}
                    onChange={(e: any) => handleVisitDateChange(e.target.value)}
                    error={errors.visitDate}
                  />
                  
                  {calculatedDay !== null && (
                    <div className="bg-teal-50 rounded-lg p-3 mb-4">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div><p className="text-xs text-teal-600 uppercase">Post-Transplant Day</p><p className="text-2xl font-bold text-teal-700">Day {calculatedDay}</p></div>
                        <div><p className="text-xs text-teal-600 uppercase">Post-Transplant Month</p><p className="text-2xl font-bold text-teal-700">Month {calculatedMonth}</p></div>
                      </div>
                    </div>
                  )}
                  
                  <SelectField label="Visit Type" name="visitType" options={visitTypeOptions} required value={basicForm.visitType} onChange={(e: any) => setBasicForm(prev => ({ ...prev, visitType: e.target.value }))} error={errors.visitType} />
                  <SelectField label="Clinical Status" name="clinicalStatus" options={clinicalStatusOptions} required value={basicForm.clinicalStatus} onChange={(e: any) => setBasicForm(prev => ({ ...prev, clinicalStatus: e.target.value }))} error={errors.clinicalStatus} />
                  <SelectField label="Nephropathy Recurrence" name="nephropathyRecurrence" options={nephropathyRecurrenceOptions} value={basicForm.nephropathyRecurrence} onChange={(e: any) => setBasicForm(prev => ({ ...prev, nephropathyRecurrence: e.target.value }))} />
                  <TextAreaField label="Comment" name="comment" placeholder="Additional notes about the visit..." value={basicForm.comment} onChange={(e: any) => setBasicForm(prev => ({ ...prev, comment: e.target.value }))} />
                </>
              )}

              {/* Step 2: Vital Signs */}
              {currentStep === 2 && (
                <>
                  <SectionTitle title="Vital Signs" icon={Heart} />
                  <InputField label="Date & Time" type="datetime-local" value={vitalSignsForm.dateTime} onChange={(e: any) => setVitalSignsForm(prev => ({ ...prev, dateTime: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Heart Rate (bpm)" type="number" value={vitalSignsForm.heartRate} onChange={(e: any) => setVitalSignsForm(prev => ({ ...prev, heartRate: e.target.value }))} placeholder="60-100" />
                    <InputField label="Temperature (°C)" type="number" step="0.1" value={vitalSignsForm.temperature} onChange={(e: any) => setVitalSignsForm(prev => ({ ...prev, temperature: e.target.value }))} placeholder="36.5-37.5" />
                    <InputField label="O2 Saturation (%)" type="number" value={vitalSignsForm.oxygenSaturation} onChange={(e: any) => setVitalSignsForm(prev => ({ ...prev, oxygenSaturation: e.target.value }))} placeholder="95-100" />
                    <InputField label="Urine Output (ml)" type="number" value={vitalSignsForm.urineOutputMl} onChange={(e: any) => setVitalSignsForm(prev => ({ ...prev, urineOutputMl: e.target.value }))} />
                    <InputField label="Blood Pressure (mmHg)" type="number" value={vitalSignsForm.bloodPressure} onChange={(e: any) => setVitalSignsForm(prev => ({ ...prev, bloodPressure: e.target.value }))} placeholder="120/80" />
                    <SelectField label="Mental Status" options={mentalStatusOptions} value={vitalSignsForm.mentalStatus} onChange={(e: any) => setVitalSignsForm(prev => ({ ...prev, mentalStatus: e.target.value }))} />
                  </div>
                  <TextAreaField label="Graft Ultrasound" placeholder="Findings from graft ultrasound..." value={vitalSignsForm.graftUltraSound} onChange={(e: any) => setVitalSignsForm(prev => ({ ...prev, graftUltraSound: e.target.value }))} />
                </>
              )}

              {/* Step 3: Biological Measurements */}
              {currentStep === 3 && (
                <>
                  <SectionTitle title="Biological Measurements" icon={Droplet} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Creatinine (mg/dL)" type="number" step="0.01" value={biologicalForm.creatinine} onChange={(e: any) => setBiologicalForm(prev => ({ ...prev, creatinine: e.target.value }))} />
                    <InputField label="Urea (mg/dL)" type="number" step="0.1" value={biologicalForm.urea} onChange={(e: any) => setBiologicalForm(prev => ({ ...prev, urea: e.target.value }))} />
                    <InputField label="eGFR (mL/min)" type="number" value={biologicalForm.gfr} onChange={(e: any) => setBiologicalForm(prev => ({ ...prev, gfr: e.target.value }))} />
                    <InputField label="Hemoglobin (g/dL)" type="number" step="0.1" value={biologicalForm.hemoglobin} onChange={(e: any) => setBiologicalForm(prev => ({ ...prev, hemoglobin: e.target.value }))} />
                    <InputField label="CRP (mg/L)" type="number" step="0.1" value={biologicalForm.crp} onChange={(e: any) => setBiologicalForm(prev => ({ ...prev, crp: e.target.value }))} />
                    <InputField label="TSH (mIU/L)" type="number" step="0.01" value={biologicalForm.tsh} onChange={(e: any) => setBiologicalForm(prev => ({ ...prev, tsh: e.target.value }))} />
                    <InputField label="Proteinuria (g/24h)" type="number" step="0.1" value={biologicalForm.proteinuria} onChange={(e: any) => setBiologicalForm(prev => ({ ...prev, proteinuria: e.target.value }))} />
                  </div>
                </>
              )}

              {/* Step 4: Immunological Markers */}
              {currentStep === 4 && (
                <>
                  <SectionTitle title="Immunological Markers" icon={Dna} />
                  <SelectField label="Marker Type" options={markerTypeOptions} value={immunologicalForm.markerType} onChange={(e: any) => setImmunologicalForm(prev => ({ ...prev, markerType: e.target.value }))} />
                  <SelectField label="Time Point" options={timePointOptions} value={immunologicalForm.timePoint} onChange={(e: any) => setImmunologicalForm(prev => ({ ...prev, timePoint: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Value" type="number" step="0.01" value={immunologicalForm.value} onChange={(e: any) => setImmunologicalForm(prev => ({ ...prev, value: e.target.value }))} />
                    <SelectField label="Unit" options={unitOptions} value={immunologicalForm.unit} onChange={(e: any) => setImmunologicalForm(prev => ({ ...prev, unit: e.target.value }))} />
                  </div>
                </>
              )}

              {/* Step 5: Rejection Episode */}
              {currentStep === 5 && (
                <>
                  <SectionTitle title="Rejection Episode (Optional)" icon={AlertTriangle} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Rejection Date" type="date" value={rejectionForm.date} onChange={(e: any) => setRejectionForm(prev => ({ ...prev, date: e.target.value }))} />
                    <SelectField label="Rejection Type" options={rejectionTypes} value={rejectionForm.type} onChange={(e: any) => setRejectionForm(prev => ({ ...prev, type: e.target.value }))} />
                    <SelectField label="Banff Grade" options={banffGrades} value={rejectionForm.grade} onChange={(e: any) => setRejectionForm(prev => ({ ...prev, grade: e.target.value }))} />
                    <SelectField label="Treatment" options={treatmentOptions} value={rejectionForm.treatment} onChange={(e: any) => setRejectionForm(prev => ({ ...prev, treatment: e.target.value }))} />
                  </div>
                  <CheckboxField label="Biopsy Proven" checked={rejectionForm.biopsyProven} onChange={(e: any) => setRejectionForm(prev => ({ ...prev, biopsyProven: e.target.checked }))} />
                  <CheckboxField label="Resolved" checked={rejectionForm.resolved} onChange={(e: any) => setRejectionForm(prev => ({ ...prev, resolved: e.target.checked }))} />
                </>
              )}

              {/* Step 6: Immunosuppression Regimen */}
              {currentStep === 6 && (
                <>
                  <SectionTitle title="Immunosuppression Regimen" icon={Shield} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Start Date" type="date" required value={immunosuppressionForm.startDate} onChange={(e: any) => setImmunosuppressionForm(prev => ({ ...prev, startDate: e.target.value }))} />
                    <InputField label="End Date (Optional)" type="date" value={immunosuppressionForm.endDate} onChange={(e: any) => setImmunosuppressionForm(prev => ({ ...prev, endDate: e.target.value }))} />
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Immunosuppressive Drugs</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <CheckboxField label="Corticosteroids" checked={immunosuppressionForm.corticosteroids} onChange={(e: any) => setImmunosuppressionForm(prev => ({ ...prev, corticosteroids: e.target.checked }))} />
                      <CheckboxField label="Tacrolimus" checked={immunosuppressionForm.tacrolimus} onChange={(e: any) => setImmunosuppressionForm(prev => ({ ...prev, tacrolimus: e.target.checked }))} />
                      <CheckboxField label="Ciclosporine" checked={immunosuppressionForm.ciclosporine} onChange={(e: any) => setImmunosuppressionForm(prev => ({ ...prev, ciclosporine: e.target.checked }))} />
                      <CheckboxField label="MMF" checked={immunosuppressionForm.mmf} onChange={(e: any) => setImmunosuppressionForm(prev => ({ ...prev, mmf: e.target.checked }))} />
                      <CheckboxField label="Azathioprine" checked={immunosuppressionForm.azathioprine} onChange={(e: any) => setImmunosuppressionForm(prev => ({ ...prev, azathioprine: e.target.checked }))} />
                      <CheckboxField label="Sirolimus" checked={immunosuppressionForm.sirolimus} onChange={(e: any) => setImmunosuppressionForm(prev => ({ ...prev, sirolimus: e.target.checked }))} />
                    </div>
                  </div>
                </>
              )}

              {/* Step 7: Treatments, Adherence & Adverse Events */}
              {currentStep === 7 && (
                <>
                  <SectionTitle title="Therapeutic Treatment (Optional)" icon={Pill} />
                  <SelectField label="Drug Name" options={drugNameOptions} value={treatmentForm.drugName} onChange={(e: any) => setTreatmentForm(prev => ({ ...prev, drugName: e.target.value }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Dosage" type="number" step="0.1" value={treatmentForm.dosage} onChange={(e: any) => setTreatmentForm(prev => ({ ...prev, dosage: e.target.value }))} />
                    <SelectField label="Unit" options={dosageUnitOptions} value={treatmentForm.dosageUnit} onChange={(e: any) => setTreatmentForm(prev => ({ ...prev, dosageUnit: e.target.value }))} />
                    <SelectField label="Route" options={routeOptions} value={treatmentForm.route} onChange={(e: any) => setTreatmentForm(prev => ({ ...prev, route: e.target.value }))} />
                    <InputField label="End Date (Optional)" type="date" value={treatmentForm.endDate} onChange={(e: any) => setTreatmentForm(prev => ({ ...prev, endDate: e.target.value }))} />
                  </div>

                  <SectionTitle title="Adherence Assessment (Optional)" icon={CheckCircle} />
                  <InputField label="Adherence Percentage (%)" type="number" min="0" max="100" value={adherenceForm.adherencePercent} onChange={(e: any) => setAdherenceForm(prev => ({ ...prev, adherencePercent: e.target.value }))} />
                  <SelectField label="Assessment Method" options={methodOptions} value={adherenceForm.method} onChange={(e: any) => setAdherenceForm(prev => ({ ...prev, method: e.target.value }))} />

                  <SectionTitle title="Adverse Event (Optional)" icon={AlertCircle} />
                  <div className="grid grid-cols-2 gap-4">
                    <SelectField label="Event Type" options={eventTypeOptions} value={adverseEventForm.eventType} onChange={(e: any) => setAdverseEventForm(prev => ({ ...prev, eventType: e.target.value }))} />
                    <SelectField label="Severity" options={severityOptions} value={adverseEventForm.severity} onChange={(e: any) => setAdverseEventForm(prev => ({ ...prev, severity: e.target.value }))} />
                  </div>
                  <TextAreaField label="Comment" placeholder="Additional details..." value={adverseEventForm.comment} onChange={(e: any) => setAdverseEventForm(prev => ({ ...prev, comment: e.target.value }))} />
                </>
              )}
            </div>
          )}

          <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex justify-between gap-3 z-10">
            <button onClick={prevStep} className={`px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors ${currentStep === 1 ? "invisible" : ""}`}>
              ← Previous
            </button>
            <div className="flex gap-3">
              <button onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              {currentStep < totalSteps ? (
                <button onClick={nextStep} className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Next →</button>
              ) : (
                <button onClick={handleFinish} disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  {loading ? "Creating..." : "Create Follow-up"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}