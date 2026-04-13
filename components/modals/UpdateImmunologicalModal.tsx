// components/modals/UpdateImmunologicalModal.tsx

"use client"

import { useState, useEffect } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2, Dna, FlaskRound } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
  marker: any
  followUpId: string
  showToast?: (message: string, type?: "success" | "error") => void
}

export default function UpdateImmunologicalModal({ isOpen, onClose, onUpdated, marker, followUpId, showToast }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    markerType: "",
    timePoint: "",
    value: "",
    unit: ""
  })

  const markerTypeOptions = ["Anti-HLA Class I", "Anti-HLA Class II", "DSA - Donor Specific Antibodies", "PRA - Panel Reactive Antibodies", "C1q Binding Antibodies", "C3d Binding Antibodies", "IgG Subclass", "BK Virus PCR", "CMV PCR", "EBV PCR"]
  const timePointOptions = ["Pre-transplant", "Day 7", "Month 1", "Month 3", "Month 6", "Month 12", "Year 2", "Year 3", "Year 5", "As needed"]
  const unitOptions = ["MFI (Mean Fluorescence Intensity)", "% (Percentage)", "copies/mL", "IU/mL", "Ratio", "Titer"]

  useEffect(() => {
    if (isOpen) {
      setForm({
        markerType: marker?.markerType || "",
        timePoint: marker?.timePoint || "",
        value: marker?.value?.toString() || "",
        unit: marker?.unit || ""
      })
    }
  }, [isOpen, marker])

  const handleSubmit = async () => {
    if (!form.markerType || !form.timePoint || !form.value || !form.unit) {
      showToast?.("Please fill in all required fields", "error")
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        followup_id: followUpId,
        markerType: form.markerType,
        timePoint: form.timePoint,
        value: Number(form.value),
        unit: form.unit
      }
      
      if (marker?._id) {
        await api.patch(`/immunological/${marker._id}`, payload)
        showToast?.("Immunological marker updated successfully!", "success")
      } else {
        await api.post("/immunological", payload)
        showToast?.("Immunological marker added successfully!", "success")
      }
      
      onUpdated()
      handleClose()
    } catch (err: any) {
      showToast?.(err.response?.data?.detail || "Failed to save immunological marker", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const isEditMode = !!marker?._id

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
          <div className="bg-amber-100 rounded-full p-2">
            <Dna className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "Update" : "Add"} Immunological Marker</h2>
            <p className="text-sm text-gray-500 mt-1">Enter antibody and immunological test results</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marker Type <span className="text-red-500">*</span>
            </label>
            <select
              value={form.markerType}
              onChange={(e) => setForm(prev => ({ ...prev, markerType: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">Select marker type</option>
              {markerTypeOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Point <span className="text-red-500">*</span>
            </label>
            <select
              value={form.timePoint}
              onChange={(e) => setForm(prev => ({ ...prev, timePoint: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">Select time point</option>
              {timePointOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                value={form.value}
                onChange={(e) => setForm(prev => ({ ...prev, value: e.target.value }))}
                placeholder="Enter numeric value"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                value={form.unit}
                onChange={(e) => setForm(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">Select unit</option>
                {unitOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
              </select>
            </div>
          </div>

          {form.markerType === "DSA - Donor Specific Antibodies" && (
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-sm text-yellow-800"><strong>Note:</strong> DSA values above 1000 MFI are generally considered clinically significant. Higher values ({`>`}5000 MFI) indicate increased risk of antibody-mediated rejection.</p>
            </div>
          )}

          {form.markerType === "PRA - Panel Reactive Antibodies" && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-blue-800"><strong>Note:</strong> PRA {'>'} 20% indicates sensitization. Consider virtual crossmatch for highly sensitized patients (PRA {'>'} 80%).</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskRound className="h-4 w-4" />}
            {loading ? "Saving..." : isEditMode ? "Update" : "Add"} Marker
          </button>
        </div>
      </div>
    </Modal>
  )
}