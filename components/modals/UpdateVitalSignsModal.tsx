// components/modals/UpdateVitalSignsModal.tsx - Modified to handle creation when no data exists

"use client"

import { useState, useEffect } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2, Heart } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
  vitalSigns: any // Can be null
  followUpId: string
  showToast?: (message: string, type?: "success" | "error") => void
}

export default function UpdateVitalSignsModal({ isOpen, onClose, onUpdated, vitalSigns, followUpId, showToast }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    dateTime: "",
    heartRate: "",
    temperature: "",
    oxygenSaturation: "",
    urineOutputMl: "",
    mentalStatus: "",
    bloodPressure: "",
    graftUltraSound: ""
  })

  const mentalStatusOptions = ["Alert", "Confused", "Lethargic", "Unresponsive"]

  // Initialize form when modal opens or vitalSigns changes
  useEffect(() => {
    if (isOpen) {
      setForm({
        dateTime: vitalSigns?.dateTime?.slice(0, 16) || "",
        heartRate: vitalSigns?.heartRate?.toString() || "",
        temperature: vitalSigns?.temperature?.toString() || "",
        oxygenSaturation: vitalSigns?.oxygenSaturation?.toString() || "",
        urineOutputMl: vitalSigns?.urineOutputMl?.toString() || "",
        mentalStatus: vitalSigns?.mentalStatus || "",
        bloodPressure: vitalSigns?.bloodPressure?.toString() || "",
        graftUltraSound: vitalSigns?.graftUltraSound || ""
      })
    }
  }, [isOpen, vitalSigns])

  const handleSubmit = async () => {
    if (!form.dateTime) {
      showToast?.("Please select date and time", "error")
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        followup_id: followUpId,
        dateTime: form.dateTime,
        heartRate: Number(form.heartRate),
        temperature: Number(form.temperature),
        oxygenSaturation: Number(form.oxygenSaturation),
        urineOutputMl: Number(form.urineOutputMl),
        mentalStatus: form.mentalStatus,
        bloodPressure: Number(form.bloodPressure),
        graftUltraSound: form.graftUltraSound || null
      }
      
      // If vitalSigns exists (has _id), update it; otherwise create new
      if (vitalSigns?._id) {
        await api.patch(`/vitals/${vitalSigns._id}`, payload)
        showToast?.("Vital signs updated successfully!", "success")
      } else {
        await api.post("/vitals", payload)
        showToast?.("Vital signs added successfully!", "success")
      }
      
      onUpdated()
      handleClose()
    } catch (err: any) {
      showToast?.(err.response?.data?.detail || "Failed to save vital signs", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const isEditMode = !!vitalSigns?._id

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-amber-100 rounded-full p-2">
            <Heart className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "Update" : "Add"} Vital Signs</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={form.dateTime}
              onChange={(e) => setForm(prev => ({ ...prev, dateTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
              <input type="number" value={form.heartRate} onChange={(e) => setForm(prev => ({ ...prev, heartRate: e.target.value }))} placeholder="60-100" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
              <input type="number" step="0.1" value={form.temperature} onChange={(e) => setForm(prev => ({ ...prev, temperature: e.target.value }))} placeholder="36.5-37.5" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">O2 Saturation (%)</label>
              <input type="number" value={form.oxygenSaturation} onChange={(e) => setForm(prev => ({ ...prev, oxygenSaturation: e.target.value }))} placeholder="95-100" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urine Output (ml)</label>
              <input type="number" value={form.urineOutputMl} onChange={(e) => setForm(prev => ({ ...prev, urineOutputMl: e.target.value }))} placeholder="ml/24h" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Pressure (mmHg)</label>
              <input type="number" value={form.bloodPressure} onChange={(e) => setForm(prev => ({ ...prev, bloodPressure: e.target.value }))} placeholder="120/80" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mental Status</label>
              <select value={form.mentalStatus} onChange={(e) => setForm(prev => ({ ...prev, mentalStatus: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                <option value="">Select</option>
                {mentalStatusOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Graft Ultrasound</label>
            <textarea value={form.graftUltraSound} onChange={(e) => setForm(prev => ({ ...prev, graftUltraSound: e.target.value }))} rows={2} placeholder="Findings from graft ultrasound..." className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
            {loading ? "Saving..." : isEditMode ? "Update" : "Add"} Vital Signs
          </button>
        </div>
      </div>
    </Modal>
  )
}