// components/modals/UpdateAdherenceModal.tsx

"use client"

import { useState, useEffect } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2, CheckCircle, Pill } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
  adherence: any
  followUpId: string
  showToast?: (message: string, type?: "success" | "error") => void
}

export default function UpdateAdherenceModal({ isOpen, onClose, onUpdated, adherence, followUpId, showToast }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    date: "",
    adherencePercent: "",
    method: ""
  })

  const methodOptions = ["Patient Self-Report", "Pill Count", "Pharmacy Refill Records", "Electronic Monitoring", "Clinician Assessment", "Medication Event Monitoring System (MEMS)", "Immunosuppressant Drug Level Variability"]

  useEffect(() => {
    if (isOpen) {
      setForm({
        date: adherence?.date?.split("T")[0] || "",
        adherencePercent: adherence?.adherencePercent?.toString() || "",
        method: adherence?.method || ""
      })
    }
  }, [isOpen, adherence])

  const handleSubmit = async () => {
    if (!form.date || !form.adherencePercent || !form.method) {
      showToast?.("Please fill in all required fields", "error")
      return
    }

    const percent = Number(form.adherencePercent)
    if (percent < 0 || percent > 100) {
      showToast?.("Adherence percentage must be between 0 and 100", "error")
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        followup_id: followUpId,
        date: form.date,
        adherencePercent: percent,
        method: form.method
      }
      
      if (adherence?._id) {
        await api.patch(`/adherence/${adherence._id}`, payload)
        showToast?.("Adherence assessment updated successfully!", "success")
      } else {
        await api.post("/adherence", payload)
        showToast?.("Adherence assessment added successfully!", "success")
      }
      
      onUpdated()
      handleClose()
    } catch (err: any) {
      showToast?.(err.response?.data?.detail || "Failed to save adherence assessment", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const isEditMode = !!adherence?._id

  const getAdherenceColor = (percent: number) => {
    if (percent >= 95) return "text-green-600"
    if (percent >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getAdherenceMessage = (percent: number) => {
    if (percent >= 95) return "Excellent adherence"
    if (percent >= 80) return "Moderate adherence - Consider intervention"
    return "Poor adherence - Intervention recommended"
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
          <div className="bg-amber-100 rounded-full p-2">
            <CheckCircle className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "Update" : "Add"} Adherence Assessment</h2>
            <p className="text-sm text-gray-500 mt-1">Track medication adherence for immunosuppression</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adherence Percentage (%) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={form.adherencePercent}
                onChange={(e) => setForm(prev => ({ ...prev, adherencePercent: e.target.value }))}
                placeholder="0-100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
              {form.adherencePercent && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all ${Number(form.adherencePercent) >= 95 ? "bg-green-600" : Number(form.adherencePercent) >= 80 ? "bg-yellow-600" : "bg-red-600"}`} style={{ width: `${Math.min(100, Math.max(0, Number(form.adherencePercent)))}%` }} />
                  </div>
                  <p className={`text-sm mt-1 font-medium ${getAdherenceColor(Number(form.adherencePercent))}`}>{getAdherenceMessage(Number(form.adherencePercent))}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assessment Method <span className="text-red-500">*</span>
            </label>
            <select
              value={form.method}
              onChange={(e) => setForm(prev => ({ ...prev, method: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="">Select method</option>
              {methodOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
            </select>
          </div>

          <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
            <div className="flex items-start gap-2">
              <Pill className="h-5 w-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-teal-800">Why adherence matters</p>
                <p className="text-xs text-teal-700 mt-1">Non-adherence to immunosuppressive medications is a leading cause of late graft loss. Adherence {'>'} 95% is associated with better long-term outcomes.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {loading ? "Saving..." : isEditMode ? "Update" : "Add"} Assessment
          </button>
        </div>
      </div>
    </Modal>
  )
}