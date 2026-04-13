"use client"

import { useEffect, useState } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Calendar, Activity, Loader2 } from "lucide-react"
import { FollowUp } from "@/features/followup/types"

interface Props {
  isOpen: boolean
  onClose: () => void
  followUp: FollowUp | null
  onUpdated: () => void
  showToast?: (message: string, type?: "success" | "error") => void
}

const InputField = ({ label, name, type = "text", required = false, value, onChange, error }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
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
      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white
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

const TextAreaField = ({ label, name, value, onChange }: any) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <textarea
      name={name}
      value={value || ""}
      onChange={onChange}
      rows={3}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
  </div>
)

export default function UpdateFollowUpModal({ isOpen, onClose, followUp, onUpdated, showToast }: Props) {
  const [form, setForm] = useState({
    visitDate: "",
    postTransplantDay: "",
    postTransplantMonth: "",
    visitType: "",
    clinicalStatus: "",
    comment: "",
    nephropathyRecurrence: ""
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})

  const visitTypeOptions = ["Scheduled", "Emergency", "Follow-up"]
  const clinicalStatusOptions = ["Stable", "Improving", "Worsening", "Critical"]
  const nephropathyRecurrenceOptions = ["None", "Mild", "Moderate", "Severe"]

  useEffect(() => {
    if (followUp) {
      setForm({
        visitDate: followUp.visitDate?.split("T")[0] || "",
        postTransplantDay: followUp.postTransplantDay?.toString() || "",
        postTransplantMonth: followUp.postTransplantMonth?.toString() || "",
        visitType: followUp.visitType || "",
        clinicalStatus: followUp.clinicalStatus || "",
        comment: followUp.comment || "",
        nephropathyRecurrence: followUp.nephropathyRecurrence || "None"
      })
    }
  }, [followUp])

  const validateForm = (): boolean => {
    const newErrors: any = {}
    
    if (!form.visitDate) newErrors.visitDate = "Visit date is required"
    if (!form.visitType) newErrors.visitType = "Visit type is required"
    if (!form.clinicalStatus) newErrors.clinicalStatus = "Clinical status is required"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm() || !followUp) return

    try {
      setLoading(true)
      
      const payload = {
        visitDate: form.visitDate,
        postTransplantDay: Number(form.postTransplantDay),
        postTransplantMonth: Number(form.postTransplantMonth),
        visitType: form.visitType,
        clinicalStatus: form.clinicalStatus,
        comment: form.comment || null,
        nephropathyRecurrence: form.nephropathyRecurrence
      }
      
      await api.patch(`/followups/${followUp._id}`, payload)
      
      showToast?.("Follow-up updated successfully!", "success")
      onUpdated()
      onClose()
    } catch (err: any) {
      console.error("Update follow-up error:", err)
      showToast?.(err.response?.data?.detail || "Failed to update follow-up", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  if (!followUp) return null

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="px-6 py-6">
          {/* Header */}
          <div className="sticky top-0 bg-white pb-4 mb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900">Update Follow-up</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Editing visit from {new Date(followUp.visitDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <InputField
              label="Visit Date"
              name="visitDate"
              type="date"
              required
              value={form.visitDate}
              onChange={(e: any) => setForm(prev => ({ ...prev, visitDate: e.target.value }))}
              error={errors.visitDate}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField
                label="Post-Transplant Day"
                name="postTransplantDay"
                type="number"
                value={form.postTransplantDay}
                onChange={(e: any) => setForm(prev => ({ ...prev, postTransplantDay: e.target.value }))}
              />
              <InputField
                label="Post-Transplant Month"
                name="postTransplantMonth"
                type="number"
                value={form.postTransplantMonth}
                onChange={(e: any) => setForm(prev => ({ ...prev, postTransplantMonth: e.target.value }))}
              />
            </div>
            
            <SelectField
              label="Visit Type"
              name="visitType"
              options={visitTypeOptions}
              required
              value={form.visitType}
              onChange={(e: any) => setForm(prev => ({ ...prev, visitType: e.target.value }))}
              error={errors.visitType}
            />
            
            <SelectField
              label="Clinical Status"
              name="clinicalStatus"
              options={clinicalStatusOptions}
              required
              value={form.clinicalStatus}
              onChange={(e: any) => setForm(prev => ({ ...prev, clinicalStatus: e.target.value }))}
              error={errors.clinicalStatus}
            />
            
            <SelectField
              label="Nephropathy Recurrence"
              name="nephropathyRecurrence"
              options={nephropathyRecurrenceOptions}
              value={form.nephropathyRecurrence}
              onChange={(e: any) => setForm(prev => ({ ...prev, nephropathyRecurrence: e.target.value }))}
            />
            
            <TextAreaField
              label="Comment"
              name="comment"
              value={form.comment}
              onChange={(e: any) => setForm(prev => ({ ...prev, comment: e.target.value }))}
            />
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white pt-4 mt-6 border-t flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Follow-up"
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}