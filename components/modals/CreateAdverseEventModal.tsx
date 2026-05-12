"use client"

import { useState } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2, AlertCircle, AlertOctagon } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  treatmentId: string | null 
  showToast?: (message: string, type?: "success" | "error") => void
}

export default function CreateAdverseEventModal({ isOpen, onClose, onCreated, followUpId, showToast }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    eventType: "",
    severity: "",
    date: "",
    comment: "",
    infectionSeverity: "",
    infectionType: ""
  })

  const eventTypeOptions = [
    "Infection",
    "Surgical Complication",
    "Cardiovascular Event",
    "Metabolic Disorder",
    "Malignancy",
    "Drug Toxicity",
    "Gastrointestinal",
    "Neurological",
    "Other"
  ]

  const severityOptions = ["Mild", "Moderate", "Severe", "Life-threatening"]
  const infectionSeverityOptions = ["Mild", "Moderate", "Severe", "Sepsis", "Septic Shock"]
  const infectionTypeOptions = [
    "Urinary Tract Infection",
    "Pneumonia",
    "Sepsis",
    "Wound Infection",
    "BK Virus Nephropathy",
    "CMV Infection",
    "EBV Infection",
    "COVID-19",
    "Other Viral",
    "Other Bacterial",
    "Fungal"
  ]

  const handleSubmit = async () => {
    if (!form.eventType || !form.severity || !form.date) {
      showToast?.("Please fill in all required fields", "error")
      return
    }

    try {
      setLoading(true)
      await api.post("/adverse-events", {
        treatment_id: treatmentId,
        eventType: form.eventType,
        severity: form.severity,
        date: form.date,
        comment: form.comment || null,
        infectionSeverity: form.eventType === "Infection" ? form.infectionSeverity : null,
        infectionType: form.eventType === "Infection" ? form.infectionType : null
      })
      showToast?.("Adverse event recorded successfully!", "success")
      onCreated()
      handleClose()
    } catch (err: any) {
      console.error("Error creating adverse event:", err)
      showToast?.(err.response?.data?.detail || "Failed to record adverse event", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm({
      eventType: "",
      severity: "",
      date: "",
      comment: "",
      infectionSeverity: "",
      infectionType: ""
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="bg-orange-100 rounded-full p-2">
              <AlertOctagon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Record Adverse Event</h2>
              <p className="text-sm text-gray-500 mt-1">Document complications and adverse events</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.eventType}
                onChange={(e) => setForm(prev => ({ ...prev, eventType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 bg-white"
              >
                <option value="">Select event type</option>
                {eventTypeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Infection-specific fields */}
            {form.eventType === "Infection" && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-semibold text-blue-800">Infection Details</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Infection Type</label>
                  <select
                    value={form.infectionType}
                    onChange={(e) => setForm(prev => ({ ...prev, infectionType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="">Select infection type</option>
                    {infectionTypeOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Infection Severity</label>
                  <select
                    value={form.infectionSeverity}
                    onChange={(e) => setForm(prev => ({ ...prev, infectionSeverity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="">Select severity</option>
                    {infectionSeverityOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Severity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {severityOptions.map(sev => (
                  <label
                    key={sev}
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${
                      form.severity === sev
                        ? sev === "Mild"
                          ? "border-green-500 bg-green-50"
                          : sev === "Moderate"
                          ? "border-yellow-500 bg-yellow-50"
                          : sev === "Severe"
                          ? "border-orange-500 bg-orange-50"
                          : "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="severity"
                      value={sev}
                      checked={form.severity === sev}
                      onChange={(e) => setForm(prev => ({ ...prev, severity: e.target.value }))}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{sev}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <textarea
                value={form.comment}
                onChange={(e) => setForm(prev => ({ ...prev, comment: e.target.value }))}
                rows={3}
                placeholder="Additional details about the event, management, and outcome..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2 disabled:bg-gray-400"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
              {loading ? "Saving..." : "Record Event"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}