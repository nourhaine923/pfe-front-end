"use client"

import { useState } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2, Droplet, Calendar, FileText } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  patientId: string | null
  patientName?: string
  showToast?: (message: string, type?: "success" | "error") => void
}

export default function CreateTransfusionModal({ 
  isOpen, 
  onClose, 
  onCreated, 
  patientId,
  patientName,
  showToast 
}: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    transfusionDate: "",
    units: "",
    aboType: "",
    indication: ""
  })

  const aboTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

  const validateForm = () => {
    if (!form.transfusionDate) {
      showToast?.("Please select transfusion date", "error")
      return false
    }
    if (!form.units || Number(form.units) <= 0) {
      showToast?.("Please enter valid number of units", "error")
      return false
    }
    if (!form.aboType) {
      showToast?.("Please select ABO type", "error")
      return false
    }
    if (!form.indication) {
      showToast?.("Please enter indication", "error")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      await api.post("/transfusions", {
        patient_id: patientId,
        transfusionDate: form.transfusionDate,
        units: Number(form.units),
        aboType: form.aboType,
        indication: form.indication
      })
      showToast?.("Transfusion event recorded successfully!", "success")
      onCreated()
      handleClose()
    } catch (err: any) {
      console.error("Error creating transfusion event:", err)
      const errorMessage = err.response?.data?.detail || "Failed to record transfusion event"
      if (Array.isArray(errorMessage)) {
        showToast?.(errorMessage[0]?.msg || "Validation error", "error")
      } else {
        showToast?.(errorMessage, "error")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm({
      transfusionDate: "",
      units: "",
      aboType: "",
      indication: ""
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[85vh] overflow-y-auto">
        <div className="px-6 py-6">
          {/* Header */}
          <div className="sticky top-0 bg-white pb-4 mb-4 border-b z-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Droplet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900">Record Transfusion Event</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {patientName ? `Recording for: ${patientName}` : "Record a new transfusion event"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Transfusion Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfusion Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={form.transfusionDate}
                  onChange={(e) => setForm(prev => ({ ...prev, transfusionDate: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Number of Units */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Units <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.units}
                onChange={(e) => setForm(prev => ({ ...prev, units: e.target.value }))}
                placeholder="e.g., 2"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* ABO Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ABO Type <span className="text-red-500">*</span>
              </label>
              <select
                value={form.aboType}
                onChange={(e) => setForm(prev => ({ ...prev, aboType: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Select ABO type</option>
                {aboTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Indication */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Indication <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  value={form.indication}
                  onChange={(e) => setForm(prev => ({ ...prev, indication: e.target.value }))}
                  rows={3}
                  placeholder="e.g., Anemia, Bleeding, Surgery, etc."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <Droplet className="h-4 w-4" />
                  Record Transfusion
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}