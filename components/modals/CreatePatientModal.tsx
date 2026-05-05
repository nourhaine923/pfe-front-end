"use client"

import { useState, useEffect, useCallback } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2 } from "lucide-react"

/*SHARED COMPONENTS */

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
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
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

const SectionTitle = ({ title }: { title: string }) => (
  <div className="mt-6 mb-4 pb-2 border-b border-gray-200">
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
)

/* MAIN COMPONENT */

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  showToast?: (message: string, type?: "success" | "error") => void
}

export default function CreatePatientModal({ isOpen, onClose, onCreated, showToast }: Props) {

  const [step, setStep] = useState(1)
  const totalSteps = 3

  const initialState = {
    lastName: "",
    firstName: "",
    medicalRecordNumber: "",
    sex: "",
    bloodGroup: "",
    foreignPatient: false,
    heightCm: "",
    weightKg: "",
    patientRole: "recipient",
    donorType: "",
    ageAtDonation: "",
    birthDate: "",
    age_at_transplant: "",
    blood_group: "",
    primary_nephropathy: "",
    dialysis_type: "",
    dialysis_duration: "",
    comorbidities: "",
    transplant_rank: "",
    hlaA1: "",
    hlaA2: "",
    hlaB1: "",
    hlaB2: "",
    hlaDR1: "",
    hlaDR2: "",
    hlaDQ1: "",
    hlaDQ2: ""
  }

  const [form, setForm] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [mrnValid, setMrnValid] = useState<boolean | null>(null)

  // Helper function to validate birth date
  const validateBirthDate = (dateString: string): string | null => {
    if (!dateString) return null
    
    const birthDate = new Date(dateString)
    const today = new Date()
    
    // Reset time part for accurate comparison
    today.setHours(0, 0, 0, 0)
    birthDate.setHours(0, 0, 0, 0)
    
    if (birthDate > today) {
      return "Birth date cannot be in the future"
    }
    
    // Check if date is too old (optional: max 120 years)
    const maxAgeDate = new Date()
    maxAgeDate.setFullYear(today.getFullYear() - 120)
    if (birthDate < maxAgeDate) {
      return "Birth date seems too old (max 120 years)"
    }
    
    return null
  }

  // Check if MRN exists via API
  const checkMRNExists = useCallback(async (mrn: string) => {
    if (!mrn || mrn === "") {
      setMrnValid(null)
      return
    }

    if (!/^\d+$/.test(mrn)) {
      setMrnValid(false)
      return
    }

    try {
      const mrnNumber = Number(mrn)
      const res = await api.get(`/patients/check-mrn/${mrnNumber}`)
      const exists = res.data.exists
      setMrnValid(!exists)
    } catch (err) {
      console.error("Error checking MRN:", err)
    }
  }, [])

  const handleMRNChange = (value: string) => {
    setForm(prev => ({ ...prev, medicalRecordNumber: value }))
    
    if (value === "") {
      setMrnValid(null)
    } else if (!/^\d+$/.test(value)) {
      setMrnValid(false)
    } else {
      setTimeout(() => {
        checkMRNExists(value)
      }, 500)
    }
  }

  const handleBirthDateChange = (value: string) => {
    setForm(prev => ({ ...prev, birthDate: value }))
    
    // Clear previous birth date error
    if (errors.birthDate) {
      setErrors((prev: any) => ({ ...prev, birthDate: undefined }))
    }
  }

  const containsNumbers = (str: string): boolean => /\d/.test(str)

  // Validate current step and return errors
  const validateCurrentStep = (): { isValid: boolean; errorMessages: string[] } => {
    const newErrors: any = {}
    const errorMessages: string[] = []
    
    if (step === 1) {
      if (!form.firstName.trim()) {
        newErrors.firstName = "First name is required"
        errorMessages.push("First name is required")
      }
      if (!form.lastName.trim()) {
        newErrors.lastName = "Last name is required"
        errorMessages.push("Last name is required")
      }
      if (!form.medicalRecordNumber.trim()) {
        newErrors.medicalRecordNumber = "Medical Record Number is required"
        errorMessages.push("Medical Record Number is required")
      } else if (!/^\d+$/.test(form.medicalRecordNumber)) {
        newErrors.medicalRecordNumber = "MRN must contain only numbers"
        errorMessages.push("MRN must contain only numbers")
      } else if (mrnValid === false) {
        newErrors.medicalRecordNumber = "This Medical Record Number already exists"
        errorMessages.push("This Medical Record Number already exists")
      }
      if (!form.sex) {
        newErrors.sex = "Sex is required"
        errorMessages.push("Sex is required")
      }
      if (!form.bloodGroup) {
        newErrors.bloodGroup = "Blood group is required"
        errorMessages.push("Blood group is required")
      }
      
      if (form.firstName && containsNumbers(form.firstName)) {
        newErrors.firstName = "First name should not contain numbers"
        errorMessages.push("First name should not contain numbers")
      }
      if (form.lastName && containsNumbers(form.lastName)) {
        newErrors.lastName = "Last name should not contain numbers"
        errorMessages.push("Last name should not contain numbers")
      }
    }
    
    if (step === 2) {
      if (form.patientRole === "donor") {
        if (!form.donorType.trim()) {
          newErrors.donorType = "Donor type is required"
          errorMessages.push("Donor type is required")
        }
        if (!form.ageAtDonation) {
          newErrors.ageAtDonation = "Age at donation is required"
          errorMessages.push("Age at donation is required")
        } else {
          const ageNum = Number(form.ageAtDonation)
          if (isNaN(ageNum) || ageNum < 18 || ageNum > 70) {
            newErrors.ageAtDonation = "Age must be between 18 and 70"
            errorMessages.push("Age must be between 18 and 70")
          }
        }
        // Morphology for donors - height and weight 
        if (!form.heightCm || form.heightCm === "") {
          newErrors.heightCm = "Height is required for donors"
          errorMessages.push("Height is required for donors")
        } else {
          const heightNum = Number(form.heightCm)
          if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
            newErrors.heightCm = "Height must be between 50cm and 300cm"
            errorMessages.push("Height must be between 50cm and 300cm")
          }
        }
        if (!form.weightKg || form.weightKg === "") {
          newErrors.weightKg = "Weight is required for donors"
          errorMessages.push("Weight is required for donors")
        } else {
          const weightNum = Number(form.weightKg)
          if (isNaN(weightNum) || weightNum < 10 || weightNum > 500) {
            newErrors.weightKg = "Weight must be between 10kg and 500kg"
            errorMessages.push("Weight must be between 10kg and 500kg")
          }
        }
      }
      
      if (form.patientRole === "recipient") {
        if (!form.birthDate) {
          newErrors.birthDate = "Birth date is required"
          errorMessages.push("Birth date is required")
        } else {
          const birthDateError = validateBirthDate(form.birthDate)
          if (birthDateError) {
            newErrors.birthDate = birthDateError
            errorMessages.push(birthDateError)
          }
        }
        // Morphology for recipients - height and weight
        if (!form.heightCm || form.heightCm === "") {
          newErrors.heightCm = "Height is required"
          errorMessages.push("Height is required")
        } else {
          const heightNum = Number(form.heightCm)
          if (isNaN(heightNum) || heightNum < 50 || heightNum > 300) {
            newErrors.heightCm = "Height must be between 50cm and 300cm"
            errorMessages.push("Height must be between 50cm and 300cm")
          }
        }
        if (!form.weightKg || form.weightKg === "") {
          newErrors.weightKg = "Weight is required"
          errorMessages.push("Weight is required")
        } else {
          const weightNum = Number(form.weightKg)
          if (isNaN(weightNum) || weightNum < 10 || weightNum > 500) {
            newErrors.weightKg = "Weight must be between 10kg and 500kg"
            errorMessages.push("Weight must be between 10kg and 500kg")
          }
        }
      }
    }
    
    if (step === 3 && form.patientRole === "recipient") {
      // Clinical data validation 
      if (form.age_at_transplant && isNaN(Number(form.age_at_transplant))) {
        newErrors.age_at_transplant = "Age at transplant must be a number"
        errorMessages.push("Age at transplant must be a number")
      }
      if (form.dialysis_duration && isNaN(Number(form.dialysis_duration))) {
        newErrors.dialysis_duration = "Dialysis duration must be a number"
        errorMessages.push("Dialysis duration must be a number")
      }
      if (form.transplant_rank && isNaN(Number(form.transplant_rank))) {
        newErrors.transplant_rank = "Transplant rank must be a number"
        errorMessages.push("Transplant rank must be a number")
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

      const payload: any = {
        lastName: form.lastName,
        firstName: form.firstName,
        medicalRecordNumber: Number(form.medicalRecordNumber),
        sex: form.sex,
        bloodGroup: form.bloodGroup,
        foreignPatient: form.foreignPatient,
        patientRole: form.patientRole,
      }

      // Morphology for both donor and recipient
      if (form.heightCm && form.heightCm !== "") {
        payload.heightCm = Number(form.heightCm)
      }
      if (form.weightKg && form.weightKg !== "") {
        payload.weightKg = Number(form.weightKg)
      }

      if (form.patientRole === "donor") {
        if (form.donorType && form.donorType !== "") payload.donorType = form.donorType
        if (form.ageAtDonation && form.ageAtDonation !== "") payload.ageAtDonation = Number(form.ageAtDonation)
      }

      if (form.patientRole === "recipient") {
        if (form.birthDate && form.birthDate !== "") payload.birthDate = form.birthDate
      }

      // Clinical Data for recipients
      if (form.patientRole === "recipient") {
        const clinicalData: any = {}
        if (form.age_at_transplant && form.age_at_transplant !== "") clinicalData.age_at_transplant = Number(form.age_at_transplant)
        if (form.blood_group && form.blood_group !== "") clinicalData.blood_group = form.blood_group
        if (form.primary_nephropathy && form.primary_nephropathy !== "") clinicalData.primary_nephropathy = form.primary_nephropathy
        if (form.dialysis_type && form.dialysis_type !== "") clinicalData.dialysis_type = form.dialysis_type
        if (form.dialysis_duration && form.dialysis_duration !== "") clinicalData.dialysis_duration = Number(form.dialysis_duration)
        if (form.comorbidities && form.comorbidities !== "") clinicalData.comorbidities = form.comorbidities
        if (form.transplant_rank && form.transplant_rank !== "") clinicalData.transplant_rank = Number(form.transplant_rank)
        
        if (Object.keys(clinicalData).length > 0) payload.clinicalData = clinicalData
      }

      // HLA Typing
      const hlaTyping: any = {}
      if (form.hlaA1 && form.hlaA1 !== "") hlaTyping.hlaA1 = form.hlaA1.toUpperCase()
      if (form.hlaA2 && form.hlaA2 !== "") hlaTyping.hlaA2 = form.hlaA2.toUpperCase()
      if (form.hlaB1 && form.hlaB1 !== "") hlaTyping.hlaB1 = form.hlaB1.toUpperCase()
      if (form.hlaB2 && form.hlaB2 !== "") hlaTyping.hlaB2 = form.hlaB2.toUpperCase()
      if (form.hlaDR1 && form.hlaDR1 !== "") hlaTyping.hlaDR1 = form.hlaDR1.toUpperCase()
      if (form.hlaDR2 && form.hlaDR2 !== "") hlaTyping.hlaDR2 = form.hlaDR2.toUpperCase()
      if (form.hlaDQ1 && form.hlaDQ1 !== "") hlaTyping.hlaDQ1 = form.hlaDQ1.toUpperCase()
      if (form.hlaDQ2 && form.hlaDQ2 !== "") hlaTyping.hlaDQ2 = form.hlaDQ2.toUpperCase()
      
      if (Object.keys(hlaTyping).length > 0) payload.hlaTyping = hlaTyping

      // Administrative data (empty object as per schema)
      payload.administrativeData = {}

      console.log("Sending payload:", payload)

      await api.post("/patients", payload)
      
      showToast?.("Patient created successfully!", "success")
      onCreated()
      setForm(initialState)
      setMrnValid(null)
      setStep(1)
      onClose()
    } catch (err: any) {
      console.error("Create patient error:", err)
      
      if (err.response?.status === 422) {
        const errorDetails = err.response?.data?.detail
        if (Array.isArray(errorDetails)) {
          const firstError = errorDetails[0]
          showToast?.(`${firstError.loc[1]}: ${firstError.msg}`, "error")
        } else {
          showToast?.("Validation error. Please check all fields.", "error")
        }
      } else if (err.response?.data?.detail?.includes("duplicate")) {
        showToast?.("Medical Record Number already exists. Please use a unique MRN.", "error")
      } else {
        showToast?.("Failed to create patient. Please try again.", "error")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm(initialState)
    setErrors({})
    setMrnValid(null)
    setStep(1)
    onClose()
  }

  const donorTypeOptions = ["Living Related", "Living Unrelated", "Cadaveric", "Deceased Donor"]
  const bloodGroupOptions = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  const dialysisTypeOptions = ["Hemodialysis", "Peritoneal Dialysis", "None"]

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[80vh] overflow-y-auto w-full md:w-[700px] lg:w-[900px] ">
        <div className="px-4 py-4">
          <div className="sticky top-0 bg-white pb-4 mb-4 border-b z-10">
            <h2 className="text-2xl font-bold text-teal-900">Create New Patient</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the patient information below</p>
            
            <div className="mt-4 flex items-center justify-between gap-2">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`flex-1 h-2 rounded-full transition-all ${
                  s === step ? "bg-teal-600" : s < step ? "bg-teal-500" : "bg-gray-200"
                }`} />
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Step {step} of {totalSteps}: {step === 1 && "Basic Information"}
              {step === 2 && (form.patientRole === "donor" ? "Donor Information & Morphology" : "Recipient Information & Morphology")}
              {step === 3 && (form.patientRole === "recipient" ? "Clinical Data & HLA Typing" : "HLA Typing")}
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <>
                <SectionTitle title="Basic Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <InputField
                      label="Medical Record Number"
                      name="medicalRecordNumber"
                      placeholder="Enter unique MRN"
                      required
                      numeric
                      value={form.medicalRecordNumber}
                      onChange={handleMRNChange}
                      error={errors.medicalRecordNumber}
                    />
                    {mrnValid === true && form.medicalRecordNumber && (
                      <p className="text-xs text-teal-500 mt-1">✓ Available</p>
                    )}
                    {mrnValid === false && form.medicalRecordNumber && (
                      <p className="text-xs text-red-500 mt-1">✗ This MRN already exists</p>
                    )}
                  </div>
                  <InputField
                    label="First Name"
                    name="firstName"
                    placeholder="Enter first name"
                    required
                    value={form.firstName}
                    onChange={(val: string) => setForm(prev => ({ ...prev, firstName: val }))}
                    error={errors.firstName}
                  />
                  <InputField
                    label="Last Name"
                    name="lastName"
                    placeholder="Enter last name"
                    required
                    value={form.lastName}
                    onChange={(val: string) => setForm(prev => ({ ...prev, lastName: val }))}
                    error={errors.lastName}
                  />
                  <SelectField
                    label="Gender"
                    name="sex"
                    options={["Male", "Female"]}
                    required
                    value={form.sex}
                    onChange={(val: string) => setForm(prev => ({ ...prev, sex: val }))}
                    error={errors.sex}
                  />
                  <SelectField
                    label="Blood Group"
                    name="bloodGroup"
                    options={bloodGroupOptions}
                    required
                    value={form.bloodGroup}
                    onChange={(val: string) => setForm(prev => ({ ...prev, bloodGroup: val }))}
                    error={errors.bloodGroup}
                  />
                </div>
                <CheckboxField
                  label="Foreign Patient"
                  name="foreignPatient"
                  checked={form.foreignPatient}
                  onChange={(val: boolean) => setForm(prev => ({ ...prev, foreignPatient: val }))}
                />
                <SelectField
                  label="Patient Role"
                  name="patientRole"
                  options={["recipient", "donor"]}
                  required
                  value={form.patientRole}
                  onChange={(val: string) => setForm(prev => ({ ...prev, patientRole: val }))}
                  error={errors.patientRole}
                />
              </>
            )}

            {/* Step 2: Role-Specific Information & Morphology */}
            {step === 2 && form.patientRole === "donor" && (
              <>
                <SectionTitle title="Donor Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <SelectField
                    label="Donor Type"
                    name="donorType"
                    options={donorTypeOptions}
                    required
                    value={form.donorType}
                    onChange={(val: string) => setForm(prev => ({ ...prev, donorType: val }))}
                    error={errors.donorType}
                  />
                  <InputField
                    label="Age at Donation"
                    name="ageAtDonation"
                    placeholder="Age at donation (18-70 years)"
                    required
                    numeric
                    value={form.ageAtDonation}
                    onChange={(val: string) => setForm(prev => ({ ...prev, ageAtDonation: val }))}
                    error={errors.ageAtDonation}
                  />
                </div>
                <SectionTitle title="Morphology" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Height (cm)"
                    name="heightCm"
                    placeholder="Enter height (50-300cm)"
                    required
                    numeric
                    value={form.heightCm}
                    onChange={(val: string) => setForm(prev => ({ ...prev, heightCm: val }))}
                    error={errors.heightCm}
                  />
                  <InputField
                    label="Weight (kg)"
                    name="weightKg"
                    placeholder="Enter weight (10-500kg)"
                    required
                    numeric
                    value={form.weightKg}
                    onChange={(val: string) => setForm(prev => ({ ...prev, weightKg: val }))}
                    error={errors.weightKg}
                  />
                </div>
              </>
            )}

            {step === 2 && form.patientRole === "recipient" && (
              <>
                <SectionTitle title="Recipient Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Birth Date"
                    name="birthDate"
                    type="date"
                    required
                    value={form.birthDate}
                    onChange={handleBirthDateChange}
                    error={errors.birthDate}
                  />
                </div>
                <SectionTitle title="Morphology" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Height (cm)"
                    name="heightCm"
                    placeholder="Enter height (50-300cm)"
                    required
                    numeric
                    value={form.heightCm}
                    onChange={(val: string) => setForm(prev => ({ ...prev, heightCm: val }))}
                    error={errors.heightCm}
                  />
                  <InputField
                    label="Weight (kg)"
                    name="weightKg"
                    placeholder="Enter weight (10-500kg)"
                    required
                    numeric
                    value={form.weightKg}
                    onChange={(val: string) => setForm(prev => ({ ...prev, weightKg: val }))}
                    error={errors.weightKg}
                  />
                </div>
              </>
            )}

            {/* Step 3: Clinical Data & HLA Typing */}
            {step === 3 && (
              <>
                {form.patientRole === "recipient" && (
                  <>
                    <SectionTitle title="Clinical Data" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField
                        label="Age at Transplant"
                        name="age_at_transplant"
                        placeholder="Age at transplant (years)"
                        numeric
                        value={form.age_at_transplant}
                        onChange={(val: string) => setForm(prev => ({ ...prev, age_at_transplant: val }))}
                        error={errors.age_at_transplant}
                      />
                      <SelectField
                        label="Blood Group (Clinical)"
                        name="blood_group"
                        options={bloodGroupOptions}
                        value={form.blood_group}
                        onChange={(val: string) => setForm(prev => ({ ...prev, blood_group: val }))}
                      />
                      <InputField
                        label="Primary Nephropathy"
                        name="primary_nephropathy"
                        placeholder="Primary nephropathy"
                        value={form.primary_nephropathy}
                        onChange={(val: string) => setForm(prev => ({ ...prev, primary_nephropathy: val }))}
                      />
                      <SelectField
                        label="Dialysis Type"
                        name="dialysis_type"
                        options={dialysisTypeOptions}
                        value={form.dialysis_type}
                        onChange={(val: string) => setForm(prev => ({ ...prev, dialysis_type: val }))}
                      />
                      <InputField
                        label="Dialysis Duration (months)"
                        name="dialysis_duration"
                        placeholder="Duration in months"
                        numeric
                        value={form.dialysis_duration}
                        onChange={(val: string) => setForm(prev => ({ ...prev, dialysis_duration: val }))}
                        error={errors.dialysis_duration}
                      />
                      <InputField
                        label="Comorbidities"
                        name="comorbidities"
                        placeholder="Comorbidities (comma separated)"
                        value={form.comorbidities}
                        onChange={(val: string) => setForm(prev => ({ ...prev, comorbidities: val }))}
                      />
                      <InputField
                        label="Transplant Rank"
                        name="transplant_rank"
                        placeholder="Number of transplants (1, 2, 3...)"
                        numeric
                        value={form.transplant_rank}
                        onChange={(val: string) => setForm(prev => ({ ...prev, transplant_rank: val }))}
                        error={errors.transplant_rank}
                      />
                    </div>
                  </>
                )}

                <SectionTitle title="HLA Typing" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <InputField label="HLA A1" name="hlaA1" placeholder="A*01:01" value={form.hlaA1} onChange={(val: string) => setForm(prev => ({ ...prev, hlaA1: val.toUpperCase() }))} />
                  <InputField label="HLA A2" name="hlaA2" placeholder="A*02:01" value={form.hlaA2} onChange={(val: string) => setForm(prev => ({ ...prev, hlaA2: val.toUpperCase() }))} />
                  <InputField label="HLA B1" name="hlaB1" placeholder="B*07:02" value={form.hlaB1} onChange={(val: string) => setForm(prev => ({ ...prev, hlaB1: val.toUpperCase() }))} />
                  <InputField label="HLA B2" name="hlaB2" placeholder="B*08:01" value={form.hlaB2} onChange={(val: string) => setForm(prev => ({ ...prev, hlaB2: val.toUpperCase() }))} />
                  <InputField label="HLA DR1" name="hlaDR1" placeholder="DRB1*11:04" value={form.hlaDR1} onChange={(val: string) => setForm(prev => ({ ...prev, hlaDR1: val.toUpperCase() }))} />
                  <InputField label="HLA DR2" name="hlaDR2" placeholder="DRB1*15:01" value={form.hlaDR2} onChange={(val: string) => setForm(prev => ({ ...prev, hlaDR2: val.toUpperCase() }))} />
                  <InputField label="HLA DQ1" name="hlaDQ1" placeholder="DQB1*03:01" value={form.hlaDQ1} onChange={(val: string) => setForm(prev => ({ ...prev, hlaDQ1: val.toUpperCase() }))} />
                  <InputField label="HLA DQ2" name="hlaDQ2" placeholder="DQB1*02:01" value={form.hlaDQ2} onChange={(val: string) => setForm(prev => ({ ...prev, hlaDQ2: val.toUpperCase() }))} />
                </div>
              </>
            )}
          </div>

          <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex justify-between gap-3 z-10">
            <div>{step > 1 && <button onClick={prevStep} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">← Previous</button>}</div>
            <div className="flex gap-3">
              <button onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
              {step < totalSteps ? (
                <button onClick={nextStep} className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">Next →</button>
              ) : (
                <button onClick={handleCreate} disabled={loading} className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 flex items-center gap-2">
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : "Create Patient"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}