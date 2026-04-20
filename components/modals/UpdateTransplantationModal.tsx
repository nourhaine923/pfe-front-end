"use client"

import { useEffect, useState } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2, Heart, Droplet, Clock, Stethoscope } from "lucide-react"
import { Transplantation } from "@/features/transplantation/types"

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
        {options.map((opt: any) => (
          <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
            {typeof opt === 'object' ? opt.label : opt}
          </option>
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

const SectionTitle = ({ title, icon: Icon }: { title: string; icon?: any }) => (
  <div className="flex items-center gap-2 mt-6 mb-4 pb-2 border-b border-gray-200">
    {Icon && <Icon className="h-5 w-5 text-teal-600" />}
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
)

interface Props {
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
  transplantation: Transplantation | null
  showToast?: (message: string, type?: "success" | "error") => void
}

export default function UpdateTransplantationModal({ isOpen, onClose, onUpdated, transplantation, showToast }: Props) {

  const [form, setForm] = useState({
    transplantNumber: "",
    transplantDate: "",
    transplantLocation: "",
    serviceOrigin: "",
    coldIschemiaHours: "",
    warmIschemiaMinutes: "",
    status: "PENDING",
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
      serumCreatinine: "",
      numberOfPreviousTransplants: ""
    }
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})

  const locationOptions = ["HCN", "RABTA", "HMPIT", "MONASTIR", "SOUSSE", "SFAX"]
  const serviceOptions = ["Nephrology_HCN", "Pediatrics_HCN", "RABTA", "MONASTIR", "SOUSSE"]
  const statusOptions = ["PENDING", "APPROVED", "REJECTED"]
  const nephropathyTypeOptions = ["Diabetic", "Glomerular", "Vascular", "NTIC", "Hereditary", "NI"]
  const eerModalityOptions = [
    { value: "HD", label: "Hemodialysis" },
    { value: "DP", label: "Peritoneal Dialysis" },
    { value: "DP_HD", label: "Both DP and HD" },
    { value: "Preemptive", label: "Preemptive" }
  ]

  // Initialize form when transplantation data is available
  useEffect(() => {
    if (transplantation) {
      setForm({
        transplantNumber: transplantation.transplantNumber || "",
        transplantDate: transplantation.transplantDate || "",
        transplantLocation: transplantation.transplantLocation || "",
        serviceOrigin: transplantation.serviceOrigin || "",
        coldIschemiaHours: transplantation.coldIschemiaHours?.toString() || "",
        warmIschemiaMinutes: transplantation.warmIschemiaMinutes?.toString() || "",
        status: transplantation.status || "PENDING",
        preTransplantAssessment: {
          ageAtTransplant: transplantation.preTransplantAssessment?.ageAtTransplant?.toString() || "",
          diabetes: transplantation.preTransplantAssessment?.diabetes || false,
          hypertension: transplantation.preTransplantAssessment?.hypertension || false,
          hbsAg: transplantation.preTransplantAssessment?.hbsAg || false,
          antiHCV: transplantation.preTransplantAssessment?.antiHCV || false,
          transfusion: transplantation.preTransplantAssessment?.transfusion || false,
          acc: transplantation.preTransplantAssessment?.acc || false,
          nephropathyType: transplantation.preTransplantAssessment?.nephropathyType || "",
          etiologyIRC: transplantation.preTransplantAssessment?.etiologyIRC || "",
          eerModality: transplantation.preTransplantAssessment?.eerModality || "",
          eerStartDate: transplantation.preTransplantAssessment?.eerStartDate || "",
          trDelayMonths: transplantation.preTransplantAssessment?.trDelayMonths?.toString() || "",
          serumCreatinine: transplantation.preTransplantAssessment?.serumCreatinine?.toString() || "",
          numberOfPreviousTransplants: transplantation.preTransplantAssessment?.numberOfPreviousTransplants?.toString() || ""
        }
      })
    }
  }, [transplantation])

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

  const validateForm = (): boolean => {
    const newErrors: any = {}
    
    if (!form.transplantNumber) newErrors.transplantNumber = "Transplant number is required"
    if (!form.transplantDate) newErrors.transplantDate = "Transplant date is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdate = async () => {
    if (!validateForm() || !transplantation) return

    setLoading(true)
    try {
      const payload = {
        transplantNumber: form.transplantNumber,
        transplantDate: form.transplantDate,
        transplantLocation: form.transplantLocation,
        serviceOrigin: form.serviceOrigin,
        coldIschemiaHours: Number(form.coldIschemiaHours) || 0,
        warmIschemiaMinutes: Number(form.warmIschemiaMinutes) || 0,
        status: form.status,
        preTransplantAssessment: {
          ageAtTransplant: Number(form.preTransplantAssessment.ageAtTransplant) || 0,
          diabetes: form.preTransplantAssessment.diabetes || false,
          hypertension: form.preTransplantAssessment.hypertension || false,
          hbsAg: form.preTransplantAssessment.hbsAg || false,
          antiHCV: form.preTransplantAssessment.antiHCV || false,
          transfusion: form.preTransplantAssessment.transfusion || false,
          acc: form.preTransplantAssessment.acc || false,
          nephropathyType: form.preTransplantAssessment.nephropathyType || "",
          etiologyIRC: form.preTransplantAssessment.etiologyIRC || "",
          eerModality: form.preTransplantAssessment.eerModality || "",
          eerStartDate: form.preTransplantAssessment.eerStartDate || "",
          trDelayMonths: Number(form.preTransplantAssessment.trDelayMonths) || 0,
          serumCreatinine: Number(form.preTransplantAssessment.serumCreatinine) || 0,
          numberOfPreviousTransplants: Number(form.preTransplantAssessment.numberOfPreviousTransplants) || 0
        }
      }

      await api.patch(`/transplantations/${transplantation._id}`, payload)
      
      // Show success toast and close modal first
      if (showToast) {
        showToast("Transplantation updated successfully!", "success")
      }
      onUpdated()
      onClose()
    } catch (err: any) {
      console.error("Update transplantation error:", err)
      if (showToast) {
        showToast(err.response?.data?.detail || "Failed to update transplantation", "error")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  if (!transplantation) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="px-4 py-4">
          {/* Sticky header */}
          <div className="sticky top-0 bg-white pb-4 mb-4 border-b z-10">
            <h2 className="text-2xl font-bold text-teal-900">Update Transplantation</h2>
            <p className="text-sm text-gray-500 mt-1">
              Editing transplantation {transplantation.transplantNumber || `#${transplantation._id?.slice(-6)}`}
            </p>
          </div>

          <div className="space-y-6">
            {/* Status */}
            <SectionTitle title="Status" icon={Heart} />
            <SelectField
              label="Status"
              name="status"
              options={statusOptions}
              value={form.status}
              onChange={(val: string) => handleChange("status", val)}
              error={errors.status}
            />

            {/* Basic Information */}
            <SectionTitle title="Basic Information" icon={Droplet} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Transplant Number"
                name="transplantNumber"
                placeholder="e.g., TX-2024-001"
                required
                value={form.transplantNumber}
                onChange={(val: string) => handleChange("transplantNumber", val)}
                error={errors.transplantNumber}
              />
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

            {/* Ischemia Times */}
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

            {/* Pre-Transplant Assessment */}
            <SectionTitle title="Pre-Transplant Assessment" icon={Stethoscope} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Age at Transplant (years)"
                name="ageAtTransplant"
                placeholder="Age at transplant"
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

            {/* Other Assessment Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Nephropathy Type"
                name="nephropathyType"
                options={nephropathyTypeOptions}
                value={form.preTransplantAssessment.nephropathyType}
                onChange={(val: string) => handleAssessmentChange("nephropathyType", val)}
                error={errors.nephropathyType}
              />
              <InputField
                label="Etiology IRC"
                name="etiologyIRC"
                placeholder="Etiology of IRC"
                value={form.preTransplantAssessment.etiologyIRC}
                onChange={(val: string) => handleAssessmentChange("etiologyIRC", val)}
                error={errors.etiologyIRC}
              />
              <SelectField
                label="EER Modality"
                name="eerModality"
                options={eerModalityOptions}
                value={form.preTransplantAssessment.eerModality}
                onChange={(val: string) => handleAssessmentChange("eerModality", val)}
                error={errors.eerModality}
              />
              <InputField
                label="EER Start Date"
                name="eerStartDate"
                type="date"
                value={form.preTransplantAssessment.eerStartDate}
                onChange={(val: string) => handleAssessmentChange("eerStartDate", val)}
                error={errors.eerStartDate}
              />
              <InputField
                label="Transplant Delay (months)"
                name="trDelayMonths"
                placeholder="Months on waiting list"
                numeric
                value={form.preTransplantAssessment.trDelayMonths}
                onChange={(val: string) => handleAssessmentChange("trDelayMonths", val)}
                error={errors.trDelayMonths}
              />
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
              onClick={handleUpdate}
              disabled={loading}
              className="px-6 py-2 bg-teal-900 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Transplantation"
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}