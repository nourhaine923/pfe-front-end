"use client"

import { useEffect, useState, useCallback } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Heart, Droplet, Clock, Stethoscope, Loader2, User, CheckCircle, XCircle } from "lucide-react"

/* -------------------- SHARED COMPONENTS -------------------- */

const InputField = ({
  label,
  name,
  placeholder,
  required = false,
  numeric = false,
  value,
  onChange,
  onBlur,
  error,
  ...props
}: any) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target

    if (numeric) {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        onChange?.(value)
      }
    } else {
      onChange?.(value)
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={props.type || "text"}
        name={name}
        placeholder={placeholder}
        value={value || ""}
        onChange={handleInputChange}
        onBlur={onBlur}
        inputMode={numeric ? "numeric" : "text"}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all
        ${error ? "border-red-500" : "border-gray-300"}`}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

const SelectField = ({ 
  label, 
  name, 
  options, 
  value,
  onChange,
  error,
  required = false 
}: any) => {

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <select
        name={name}
        value={value || ""}
        onChange={handleChange}
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

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  )
}

const CheckboxField = ({ label, name, checked, onChange }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.checked)
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked || false}
          onChange={handleChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
      </label>
    </div>
  )
}

const SectionTitle = ({ title, icon: Icon }: { title: string; icon?: any }) => (
  <div className="flex items-center gap-2 mt-6 mb-4 pb-2 border-b border-gray-200">
    {Icon && <Icon className="h-5 w-5 text-teal-600" />}
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
)

/* -------------------- MAIN COMPONENT -------------------- */

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  showToast?: (message: string, type?: "success" | "error") => void
}

interface Patient {
  _id: string
  firstName: string
  lastName: string
  bloodGroup: string
  medicalRecordNumber: number
  patientRole: string
}

export default function CreateTransplantationModal({ isOpen, onClose, onCreated, showToast }: Props) {

  const [step, setStep] = useState(1)
  const totalSteps = 3

  const initialState = {
    donor_id: "",
    recipient_id: "",
    transplantNumber: "",
    transplantDate: "",
    transplantLocation: "",
    serviceOrigin: "",
    coldIschemiaHours: "",
    warmIschemiaMinutes: "",
    preTransplantAssessment: {
      ageAtTransplant: "",
      diabetes: false,
      hypertension: false,
      hbsAg: false,
      antiHCV: false,
      transfusion: false,
      acc: false,
      nephropathyType: "",
      etiologyIRC: "",
      eerModality: "",
      eerStartDate: "",
      trDelayMonths: "",
      numberOfPreviousTransplants: "",
      serumCreatinine: ""
    }
  }

  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [fetchingPatients, setFetchingPatients] = useState(true)
  const [errors, setErrors] = useState<any>({})
  
  // Transplant number validation
  const [transplantNumberValid, setTransplantNumberValid] = useState<boolean | null>(null)
  const [checkingTransplantNumber, setCheckingTransplantNumber] = useState(false)

  // Fetch patients when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchPatients()
      setStep(1)
      setTransplantNumberValid(null)
    }
  }, [isOpen])

  const fetchPatients = async () => {
    try {
      setFetchingPatients(true)
      
      let allPatients: Patient[] = []
      let currentPage = 1
      let totalPages = 1
      
      // First, get the first page to know total pages
      const firstRes = await api.get("/patients", {
        params: { page: 1, limit: 100 }
      })
      
      // Parse the first response
      if (firstRes.data.data && Array.isArray(firstRes.data.data)) {
        allPatients = [...firstRes.data.data]
        totalPages = firstRes.data.totalPages || 1
        console.log(`Total pages: ${totalPages}, Total patients: ${firstRes.data.total}`)
      }
      
      // Fetch remaining pages if any
      if (totalPages > 1) {
        const remainingPages = []
        for (let page = 2; page <= totalPages; page++) {
          remainingPages.push(
            api.get("/patients", { params: { page, limit: 100 } })
          )
        }
        
        const remainingResponses = await Promise.all(remainingPages)
        
        for (const res of remainingResponses) {
          if (res.data.data && Array.isArray(res.data.data)) {
            allPatients = [...allPatients, ...res.data.data]
          }
        }
      }
      
      console.log("Total patients fetched across all pages:", allPatients.length)
      console.log("Donors:", allPatients.filter(p => p.patientRole === "donor").length)
      console.log("Recipients:", allPatients.filter(p => p.patientRole === "recipient").length)
      
      setPatients(allPatients)
      
    } catch (err) {
      console.error("Error fetching patients:", err)
      showToast?.("Failed to load patients", "error")
    } finally {
      setFetchingPatients(false)
    }
  }

  // Check if transplant number exists
  const checkTransplantNumber = useCallback(async (transplantNumber: string) => {
    if (!transplantNumber || transplantNumber === "") {
      setTransplantNumberValid(null)
      return
    }

    setCheckingTransplantNumber(true)
    try {
      const res = await api.get(`/transplantations/check-transplant-number/${transplantNumber}`)
      const exists = res.data.exists
      setTransplantNumberValid(!exists)
      if (exists) {
        setErrors(prev => ({ ...prev, transplantNumber: "❌ This transplant number already exists" }))
      } else {
        setErrors(prev => ({ ...prev, transplantNumber: undefined }))
      }
    } catch (err) {
      console.error("Error checking transplant number:", err)
    } finally {
      setCheckingTransplantNumber(false)
    }
  }, [])

  const handleTransplantNumberChange = (value: string) => {
    setForm(prev => ({ ...prev, transplantNumber: value }))
    
    if (value === "") {
      setTransplantNumberValid(null)
      setErrors(prev => ({ ...prev, transplantNumber: undefined }))
    } else {
      const timeoutId = setTimeout(() => {
        checkTransplantNumber(value)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }

  const donors = patients.filter(p => p.patientRole === "donor")
  const recipients = patients.filter(p => p.patientRole === "recipient")

  const donorOptions = donors.map(d => ({
    value: d._id,
    label: `${d.firstName} ${d.lastName} - ${d.bloodGroup} (MRN: ${d.medicalRecordNumber})`
  }))

  const recipientOptions = recipients.map(r => ({
    value: r._id,
    label: `${r.firstName} ${r.lastName} - ${r.bloodGroup} (MRN: ${r.medicalRecordNumber})`
  }))

  const locationOptions = ["HCN", "RABTA", "HMPIT", "MONASTIR", "SOUSSE", "SFAX"]
  const serviceOptions = ["Nephrology_HCN", "Pediatrics_HCN", "RABTA", "MONASTIR", "SOUSSE"]
  const nephropathyTypeOptions = ["Diabetic", "Glomerular", "Vascular", "NTIC", "Hereditary", "NI"]
  const eerModalityOptions = [
    { value: "HD", label: "Hemodialysis" },
    { value: "DP", label: "Peritoneal Dialysis" },
    { value: "DP_HD", label: "Both DP and HD" },
    { value: "Preemptive", label: "Preemptive" }
  ]

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleAssessmentChange = (field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      preTransplantAssessment: {
        ...prev.preTransplantAssessment,
        [field]: value
      }
    }))
  }

  // Validate current step and return errors
  const validateCurrentStep = (): { isValid: boolean; errorMessages: string[] } => {
    const newErrors: any = {}
    const errorMessages: string[] = []
    
    if (step === 1) {
      if (!form.preTransplantAssessment.ageAtTransplant) {
        newErrors.ageAtTransplant = "Age at transplant is required"
        errorMessages.push("Age at transplant is required")
      } else {
        const ageNum = Number(form.preTransplantAssessment.ageAtTransplant)
        if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
          newErrors.ageAtTransplant = "Age must be between 0 and 120"
          errorMessages.push("Age must be between 0 and 120")
        }
      }
      
      if (!form.preTransplantAssessment.nephropathyType) {
        newErrors.nephropathyType = "Nephropathy type is required"
        errorMessages.push("Nephropathy type is required")
      }
      if (!form.preTransplantAssessment.etiologyIRC) {
        newErrors.etiologyIRC = "Etiology IRC is required"
        errorMessages.push("Etiology IRC is required")
      }
      if (!form.preTransplantAssessment.eerModality) {
        newErrors.eerModality = "EER Modality is required"
        errorMessages.push("EER Modality is required")
      }
      if (!form.preTransplantAssessment.eerStartDate) {
        newErrors.eerStartDate = "EER start date is required"
        errorMessages.push("EER start date is required")
      }
      if (!form.preTransplantAssessment.trDelayMonths) {
        newErrors.trDelayMonths = "Transplant delay is required"
        errorMessages.push("Transplant delay is required")
      } else {
        const delayNum = Number(form.preTransplantAssessment.trDelayMonths)
        if (isNaN(delayNum) || delayNum < 0) {
          newErrors.trDelayMonths = "Delay must be a positive number"
          errorMessages.push("Delay must be a positive number")
        }
      }
      if (!form.preTransplantAssessment.numberOfPreviousTransplants && form.preTransplantAssessment.numberOfPreviousTransplants !== "0") {
        newErrors.numberOfPreviousTransplants = "Number of previous transplants is required"
        errorMessages.push("Number of previous transplants is required")
      }
    }
    
    if (step === 2) {
      if (!form.donor_id) {
        newErrors.donor_id = "Donor is required"
        errorMessages.push("Donor is required")
      }
      if (!form.recipient_id) {
        newErrors.recipient_id = "Recipient is required"
        errorMessages.push("Recipient is required")
      }
      if (form.donor_id && form.recipient_id && form.donor_id === form.recipient_id) {
        newErrors.recipient_id = "Donor and recipient cannot be the same"
        errorMessages.push("Donor and recipient cannot be the same")
      }
    }
    
    if (step === 3) {
      if (!form.transplantNumber) {
        newErrors.transplantNumber = "Transplant number is required"
        errorMessages.push("Transplant number is required")
      } else if (transplantNumberValid === false) {
        newErrors.transplantNumber = "This transplant number already exists"
        errorMessages.push("This transplant number already exists")
      }
      if (!form.transplantDate) {
        newErrors.transplantDate = "Transplant date is required"
        errorMessages.push("Transplant date is required")
      }
    }
    
    setErrors(newErrors)
    return { isValid: Object.keys(newErrors).length === 0, errorMessages }
  }

  const nextStep = () => {
    const { isValid, errorMessages } = validateCurrentStep()
    if (isValid) {
      setStep(step + 1)
    } else if (errorMessages.length > 0) {
      showToast?.(errorMessages[0], "error")
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handleCreate = async () => {
    const { isValid, errorMessages } = validateCurrentStep()
    if (!isValid) {
      if (errorMessages.length > 0) {
        showToast?.(errorMessages[0], "error")
      }
      return
    }

    try {
      setLoading(true)

      const payload = {
        donor_id: form.donor_id,
        recipient_id: form.recipient_id,
        transplantNumber: form.transplantNumber,
        transplantDate: form.transplantDate,
        transplantLocation: form.transplantLocation,
        serviceOrigin: form.serviceOrigin,
        coldIschemiaHours: Number(form.coldIschemiaHours) || 0,
        warmIschemiaMinutes: Number(form.warmIschemiaMinutes) || 0,
        status: "PENDING",
        preTransplantAssessment: {
          ageAtTransplant: Number(form.preTransplantAssessment.ageAtTransplant) || 0,
          diabetes: form.preTransplantAssessment.diabetes || false,
          hypertension: form.preTransplantAssessment.hypertension || false,
          hbsAg: form.preTransplantAssessment.hbsAg || false,
          antiHCV: form.preTransplantAssessment.antiHCV || false,
          transfusion: form.preTransplantAssessment.transfusion || false,
          acc: form.preTransplantAssessment.acc || false,
          nephropathyType: form.preTransplantAssessment.nephropathyType,
          etiologyIRC: form.preTransplantAssessment.etiologyIRC,
          eerModality: form.preTransplantAssessment.eerModality,
          eerStartDate: form.preTransplantAssessment.eerStartDate,
          trDelayMonths: Number(form.preTransplantAssessment.trDelayMonths) || 0,
          numberOfPreviousTransplants: Number(form.preTransplantAssessment.numberOfPreviousTransplants) || 0,
          serumCreatinine: Number(form.preTransplantAssessment.serumCreatinine) || 0
        }
      }

      await api.post("/transplantations", payload)
      
      showToast?.("Transplantation created successfully!", "success")
      onCreated()
      handleClose()
    } catch (err: any) {
      console.error("Create transplantation error:", err)
      showToast?.(err.response?.data?.detail || "Failed to create transplantation", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm(initialState)
    setErrors({})
    setStep(1)
    setTransplantNumberValid(null)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="px-4 py-4">
          {/* Sticky header */}
          <div className="sticky top-0 bg-white pb-4 mb-4 border-b z-10">
            <h2 className="text-2xl font-bold text-teal-900">Create New Transplantation</h2>
            <p className="text-sm text-gray-500 mt-1">Record a new kidney transplant procedure</p>
            
            {/* Step Indicator */}
            <div className="mt-4 flex items-center justify-between gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    s === step
                      ? "bg-teal-600"
                      : s < step
                      ? "bg-teal-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Step {step} of {totalSteps}:{" "}
              {step === 1 && "Pre-Transplant Assessment"}
              {step === 2 && "Patient Selection"}
              {step === 3 && "Transplant Details"}
            </p>
          </div>

          {fetchingPatients ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Step 1: Pre-Transplant Assessment */}
              {step === 1 && (
                <>
                  <SectionTitle title="Pre-Transplant Assessment" icon={Stethoscope} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Age at Transplant (years)"
                      name="ageAtTransplant"
                      placeholder="Age at transplant"
                      required
                      numeric
                      value={form.preTransplantAssessment.ageAtTransplant}
                      onChange={(val: string) => handleAssessmentChange("ageAtTransplant", val)}
                      error={errors.ageAtTransplant}
                    />
                    <InputField
                      label="Serum Creatinine (mg/dL)"
                      name="serumCreatinine"
                      placeholder="Serum creatinine"
                      numeric
                      value={form.preTransplantAssessment.serumCreatinine}
                      onChange={(val: string) => handleAssessmentChange("serumCreatinine", val)}
                      error={errors.serumCreatinine}
                    />
                    <InputField
                      label="Number of Previous Transplants"
                      name="numberOfPreviousTransplants"
                      placeholder="0"
                      required
                      numeric
                      value={form.preTransplantAssessment.numberOfPreviousTransplants}
                      onChange={(val: string) => handleAssessmentChange("numberOfPreviousTransplants", val)}
                      error={errors.numberOfPreviousTransplants}
                    />
                  </div>

                  {/* Medical Conditions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <CheckboxField
                      label="Diabetes"
                      name="diabetes"
                      checked={form.preTransplantAssessment.diabetes}
                      onChange={(val: boolean) => handleAssessmentChange("diabetes", val)}
                    />
                    <CheckboxField
                      label="Hypertension"
                      name="hypertension"
                      checked={form.preTransplantAssessment.hypertension}
                      onChange={(val: boolean) => handleAssessmentChange("hypertension", val)}
                    />
                    <CheckboxField
                      label="HBsAg Positive"
                      name="hbsAg"
                      checked={form.preTransplantAssessment.hbsAg}
                      onChange={(val: boolean) => handleAssessmentChange("hbsAg", val)}
                    />
                    <CheckboxField
                      label="Anti-HCV Positive"
                      name="antiHCV"
                      checked={form.preTransplantAssessment.antiHCV}
                      onChange={(val: boolean) => handleAssessmentChange("antiHCV", val)}
                    />
                    <CheckboxField
                      label="Transfusion"
                      name="transfusion"
                      checked={form.preTransplantAssessment.transfusion}
                      onChange={(val: boolean) => handleAssessmentChange("transfusion", val)}
                    />
                    <CheckboxField
                      label="ACC"
                      name="acc"
                      checked={form.preTransplantAssessment.acc}
                      onChange={(val: boolean) => handleAssessmentChange("acc", val)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="Nephropathy Type"
                      name="nephropathyType"
                      options={nephropathyTypeOptions}
                      required
                      value={form.preTransplantAssessment.nephropathyType}
                      onChange={(val: string) => handleAssessmentChange("nephropathyType", val)}
                      error={errors.nephropathyType}
                    />
                    <InputField
                      label="Etiology IRC"
                      name="etiologyIRC"
                      placeholder="Etiology of IRC"
                      required
                      value={form.preTransplantAssessment.etiologyIRC}
                      onChange={(val: string) => handleAssessmentChange("etiologyIRC", val)}
                      error={errors.etiologyIRC}
                    />
                    <SelectField
                      label="EER Modality"
                      name="eerModality"
                      options={eerModalityOptions}
                      required
                      value={form.preTransplantAssessment.eerModality}
                      onChange={(val: string) => handleAssessmentChange("eerModality", val)}
                      error={errors.eerModality}
                    />
                    <InputField
                      label="EER Start Date"
                      name="eerStartDate"
                      type="date"
                      required
                      value={form.preTransplantAssessment.eerStartDate}
                      onChange={(val: string) => handleAssessmentChange("eerStartDate", val)}
                      error={errors.eerStartDate}
                    />
                    <InputField
                      label="Transplant Delay (months)"
                      name="trDelayMonths"
                      placeholder="Months on waiting list"
                      required
                      numeric
                      value={form.preTransplantAssessment.trDelayMonths}
                      onChange={(val: string) => handleAssessmentChange("trDelayMonths", val)}
                      error={errors.trDelayMonths}
                    />
                  </div>
                </>
              )}

              {/* Step 2: Patient Selection */}
              {step === 2 && (
                <>
                  <SectionTitle title="Patient Selection" icon={User} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                      label="Donor"
                      name="donor_id"
                      options={donorOptions}
                      required
                      value={form.donor_id}
                      onChange={(val: string) => handleChange("donor_id", val)}
                      error={errors.donor_id}
                    />
                    <SelectField
                      label="Recipient"
                      name="recipient_id"
                      options={recipientOptions}
                      required
                      value={form.recipient_id}
                      onChange={(val: string) => handleChange("recipient_id", val)}
                      error={errors.recipient_id}
                    />
                  </div>
                  {donors.length === 0 && (
                    <p className="text-sm text-yellow-600 mt-2">No donors available. Please create a donor first.</p>
                  )}
                  {recipients.length === 0 && (
                    <p className="text-sm text-yellow-600 mt-2">No recipients available. Please create a recipient first.</p>
                  )}
                </>
              )}

              {/* Step 3: Transplant Details */}
              {step === 3 && (
                <>
                  <SectionTitle title="Basic Information" icon={Droplet} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <InputField
                        label="Transplant Number"
                        name="transplantNumber"
                        placeholder="e.g., TX-2024-001"
                        required
                        value={form.transplantNumber}
                        onChange={handleTransplantNumberChange}
                        error={errors.transplantNumber}
                      />
                      {transplantNumberValid === true && form.transplantNumber && (
                        <p className="text-xs text-teal-500 mt-1 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Available
                        </p>
                      )}
                      {transplantNumberValid === false && form.transplantNumber && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                          <XCircle className="h-3 w-3" />
                          This transplant number already exists
                        </p>
                      )}
                      {checkingTransplantNumber && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Checking...
                        </p>
                      )}
                    </div>
                    <InputField
                      label="Transplant Date"
                      name="transplantDate"
                      type="date"
                      required
                      value={form.transplantDate}
                      onChange={(val: string) => handleChange("transplantDate", val)}
                      error={errors.transplantDate}
                    />
                    <SelectField
                      label="Location"
                      name="transplantLocation"
                      options={locationOptions}
                      value={form.transplantLocation}
                      onChange={(val: string) => handleChange("transplantLocation", val)}
                      error={errors.transplantLocation}
                    />
                    <SelectField
                      label="Service Origin"
                      name="serviceOrigin"
                      options={serviceOptions}
                      value={form.serviceOrigin}
                      onChange={(val: string) => handleChange("serviceOrigin", val)}
                      error={errors.serviceOrigin}
                    />
                  </div>

                  <SectionTitle title="Ischemia Times" icon={Clock} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Cold Ischemia (hours)"
                      name="coldIschemiaHours"
                      placeholder="0.0"
                      numeric
                      value={form.coldIschemiaHours}
                      onChange={(val: string) => handleChange("coldIschemiaHours", val)}
                      error={errors.coldIschemiaHours}
                    />
                    <InputField
                      label="Warm Ischemia (minutes)"
                      name="warmIschemiaMinutes"
                      placeholder="0"
                      numeric
                      value={form.warmIschemiaMinutes}
                      onChange={(val: string) => handleChange("warmIschemiaMinutes", val)}
                      error={errors.warmIschemiaMinutes}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Sticky footer with navigation buttons */}
          <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex justify-between gap-3 z-10">
            <div>
              {step > 1 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  ← Previous
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              {step < totalSteps ? (
                <button
                  onClick={nextStep}
                  disabled={fetchingPatients}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={handleCreate}
                  disabled={loading || transplantNumberValid === false}
                  className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Transplantation"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}