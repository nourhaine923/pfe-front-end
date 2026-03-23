"use client"

import { useState } from "react"
import Modal from "./Modal"
import api from "@/services/api"

/* -------------------- SHARED COMPONENTS -------------------- */

const InputField = ({
  label,
  name,
  placeholder,
  required = false,
  numeric = false,
  form,
  setForm,
  errors,
  setErrors,
  ...props
}: any) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (numeric) {
      if (value === "" || /^\d*\.?\d*$/.test(value)) {
        setForm((prev: any) => ({
          ...prev,
          [name]: value
        }))
      }
    } else {
      setForm((prev: any) => ({
        ...prev,
        [name]: value
      }))
    }

    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type="text"
        name={name}
        placeholder={placeholder}
        value={form[name] || ""}
        onChange={handleInputChange}
        inputMode={numeric ? "numeric" : "text"}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all
        ${errors[name] ? "border-red-500" : "border-gray-300"}`}
        {...props}
      />

      {errors[name] && (
        <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
      )}
    </div>
  )
}

const SelectField = ({ 
  label, 
  name, 
  options, 
  form, 
  setForm, 
  errors,
  required = false 
}: any) => {

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev: any) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <select
        name={name}
        value={form[name] || ""}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white
        ${errors[name] ? "border-red-500" : "border-gray-300"}`}
      >
        <option value="">Select {label}</option>
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>

      {errors[name] && (
        <p className="text-sm text-red-500 mt-1">{errors[name]}</p>
      )}
    </div>
  )
}

const CheckboxField = ({ label, name, form, setForm }: any) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setForm((prev: any) => ({ ...prev, [name]: checked }))
  }

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={form[name] || false}
          onChange={handleChange}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
      </label>
    </div>
  )
}

const SectionTitle = ({ title }: { title: string }) => (
  <div className="mt-6 mb-4 pb-2 border-b border-gray-200">
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

export default function CreatePatientModal({ isOpen, onClose, onCreated, showToast }: Props) {

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

  // Helper function to check if string contains numbers
  const containsNumbers = (str: string): boolean => {
    return /\d/.test(str)
  }

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: any = {}
    
    // Required fields
    if (!form.firstName.trim()) newErrors.firstName = "First name is required"
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!form.medicalRecordNumber.trim()) {
      newErrors.medicalRecordNumber = "Medical Record Number is required"
    } else if (!/^\d+$/.test(form.medicalRecordNumber)) {
      newErrors.medicalRecordNumber = "MRN must contain only numbers"
    }
    if (!form.sex) newErrors.sex = "Sex is required"
    if (!form.bloodGroup) newErrors.bloodGroup = "Blood group is required"
    
    // Validate string fields for numbers (no numbers allowed)
    const stringFields = [
      { field: 'firstName', label: 'First name' },
      { field: 'lastName', label: 'Last name' },
      { field: 'donorType', label: 'Donor type' },
      { field: 'blood_group', label: 'Blood group (clinical)' },
      { field: 'primary_nephropathy', label: 'Primary nephropathy' },
      { field: 'dialysis_type', label: 'Dialysis type' },
      { field: 'comorbidities', label: 'Comorbidities' }
    ]
    
    stringFields.forEach(({ field, label }) => {
      const value = form[field]
      if (value && containsNumbers(value)) {
        newErrors[field] = `${label} should not contain numbers`
      }
    })
    
    // Role-specific validation
    if (form.patientRole === "donor") {
      if (!form.donorType.trim()) newErrors.donorType = "Donor type is required"
      if (!form.ageAtDonation) newErrors.ageAtDonation = "Age at donation is required"
      const ageNum = Number(form.ageAtDonation)
      if (form.ageAtDonation && (isNaN(ageNum) || ageNum < 18 || ageNum > 70)) {
        newErrors.ageAtDonation = "Age must be between 18 and 70"
      }
    }
    
    if (form.patientRole === "recipient") {
      if (!form.birthDate) newErrors.birthDate = "Birth date is required"
      const heightNum = Number(form.heightCm)
      if (form.heightCm && (isNaN(heightNum) || heightNum < 50 || heightNum > 300)) {
        newErrors.heightCm = "Height must be between 50cm and 300cm"
      }
      const weightNum = Number(form.weightKg)
      if (form.weightKg && (isNaN(weightNum) || weightNum < 10 || weightNum > 500)) {
        newErrors.weightKg = "Weight must be between 10kg and 500kg"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      const payload = {
        lastName: form.lastName,
        firstName: form.firstName,
        medicalRecordNumber: Number(form.medicalRecordNumber),
        sex: form.sex,
        bloodGroup: form.bloodGroup,
        foreignPatient: form.foreignPatient,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        patientRole: form.patientRole,
        donorType: form.patientRole === "donor" ? form.donorType : null,
        ageAtDonation: form.patientRole === "donor" ? (form.ageAtDonation ? Number(form.ageAtDonation) : null) : null,
        birthDate: form.patientRole === "recipient" ? form.birthDate : null,
        clinicalData: form.patientRole === "recipient" ? {
          age_at_transplant: form.age_at_transplant ? Number(form.age_at_transplant) : null,
          blood_group: form.blood_group,
          primary_nephropathy: form.primary_nephropathy,
          dialysis_type: form.dialysis_type,
          dialysis_duration: form.dialysis_duration ? Number(form.dialysis_duration) : null,
          comorbidities: form.comorbidities,
          transplant_rank: form.transplant_rank ? Number(form.transplant_rank) : null
        } : {},
        hlaTyping: {
          hlaA1: form.hlaA1,
          hlaA2: form.hlaA2,
          hlaB1: form.hlaB1,
          hlaB2: form.hlaB2,
          hlaDR1: form.hlaDR1,
          hlaDR2: form.hlaDR2,
          hlaDQ1: form.hlaDQ1,
          hlaDQ2: form.hlaDQ2
        },
        administrativeData: []
      }

      await api.post("/patients", payload)
      
      showToast?.("Patient created successfully!", "success")
      onCreated()
      setForm(initialState)
      onClose()
    } catch (err) {
      console.error("Create patient error:", err)
      showToast?.("Failed to create patient. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm(initialState)
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      {/* Scroll container WITHOUT vertical padding */}
      <div className="max-h-[80vh] overflow-y-auto">
        {/* Inner wrapper WITH padding */}
        <div className="px-4 py-4">
          {/* Sticky header */}
          <div className="sticky top-0 bg-white pb-4 mb-4 border-b z-10">
            <h2 className="text-2xl font-bold text-purple-900">Create New Patient</h2>
            <p className="text-sm text-gray-500 mt-1">Fill in the patient information below</p>
          </div>

          <div className="space-y-6">
            {/* Identity Section */}
            <SectionTitle title="Identity" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Medical Record Number"
                name="medicalRecordNumber"
                placeholder="Enter MRN"
                required
                numeric
                form={form}
                setForm={setForm}
                errors={errors}
                setErrors={setErrors}
              />
              <InputField
                label="First Name"
                name="firstName"
                placeholder="Enter first name"
                required
                form={form}
                setForm={setForm}
                errors={errors}
                setErrors={setErrors}
              />
              <InputField
                label="Last Name"
                name="lastName"
                placeholder="Enter last name"
                required
                form={form}
                setForm={setForm}
                errors={errors}
                setErrors={setErrors}
              />
              <SelectField
                label="Sex"
                name="sex"
                options={["Male", "Female"]}
                required
                form={form}
                setForm={setForm}
                errors={errors}
              />
              <SelectField
                label="Blood Group"
                name="bloodGroup"
                options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
                required
                form={form}
                setForm={setForm}
                errors={errors}
              />
            </div>

            <CheckboxField
              label="Foreign Patient"
              name="foreignPatient"
              form={form}
              setForm={setForm}
            />

            {/* Morphology Section */}
            <SectionTitle title="Morphology" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Height (cm)"
                name="heightCm"
                placeholder="Enter height"
                numeric
                form={form}
                setForm={setForm}
                errors={errors}
                setErrors={setErrors}
              />
              <InputField
                label="Weight (kg)"
                name="weightKg"
                placeholder="Enter weight"
                numeric
                form={form}
                setForm={setForm}
                errors={errors}
                setErrors={setErrors}
              />
            </div>

            {/* Role Selection */}
            <SectionTitle title="Patient Role" />
            <SelectField
              label="Role"
              name="patientRole"
              options={["recipient", "donor"]}
              required
              form={form}
              setForm={setForm}
              errors={errors}
            />

            {/* Donor Specific Fields */}
            {form.patientRole === "donor" && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <SectionTitle title="Donor Information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Donor Type"
                    name="donorType"
                    placeholder="Living / Cadaveric"
                    required
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    setErrors={setErrors}
                  />
                  <InputField
                    label="Age at Donation"
                    name="ageAtDonation"
                    placeholder="Age at donation"
                    required
                    numeric
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    setErrors={setErrors}
                  />
                </div>
              </div>
            )}

            {/* Recipient Specific Fields */}
            {form.patientRole === "recipient" && (
              <>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <SectionTitle title="Recipient Information" />
                  <InputField
                    label="Birth Date"
                    name="birthDate"
                    type="date"
                    required
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    setErrors={setErrors}
                  />
                </div>

                <SectionTitle title="Clinical Data" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Age at Transplant"
                    name="age_at_transplant"
                    placeholder="Age at transplant"
                    numeric
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    setErrors={setErrors}
                  />
                  <InputField
                    label="Blood Group (Clinical)"
                    name="blood_group"
                    placeholder="Blood group"
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    setErrors={setErrors}
                  />
                  <InputField
                    label="Primary Nephropathy"
                    name="primary_nephropathy"
                    placeholder="Primary nephropathy"
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    setErrors={setErrors}
                  />
                  <InputField
                    label="Dialysis Type"
                    name="dialysis_type"
                    placeholder="Type of dialysis"
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    setErrors={setErrors}
                  />
                  <InputField
                    label="Dialysis Duration (months)"
                    name="dialysis_duration"
                    placeholder="Duration"
                    numeric
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    setErrors={setErrors}
                  />
                  <InputField
                    label="Comorbidities"
                    name="comorbidities"
                    placeholder="Comorbidities"
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    setErrors={setErrors}
                  />
                  <InputField
                    label="Transplant Rank"
                    name="transplant_rank"
                    placeholder="Number of transplants"
                    numeric
                    form={form}
                    setForm={setForm}
                    errors={errors}
                    setErrors={setErrors}
                  />
                </div>
              </>
            )}

            {/* HLA Typing Section */}
            <SectionTitle title="HLA Typing" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField label="HLA A1" name="hlaA1" placeholder="HLA A1" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
              <InputField label="HLA A2" name="hlaA2" placeholder="HLA A2" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
              <InputField label="HLA B1" name="hlaB1" placeholder="HLA B1" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
              <InputField label="HLA B2" name="hlaB2" placeholder="HLA B2" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
              <InputField label="HLA DR1" name="hlaDR1" placeholder="HLA DR1" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
              <InputField label="HLA DR2" name="hlaDR2" placeholder="HLA DR2" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
              <InputField label="HLA DQ1" name="hlaDQ1" placeholder="HLA DQ1" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
              <InputField label="HLA DQ2" name="hlaDQ2" placeholder="HLA DQ2" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
            </div>
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex justify-end gap-3 z-10">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-6 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                "Create Patient"
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}