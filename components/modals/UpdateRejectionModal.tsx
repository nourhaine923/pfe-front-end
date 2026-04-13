// components/modals/UpdateRejectionModal.tsx

"use client"

import { useState, useEffect } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2, AlertTriangle, Syringe } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
  rejection: any
  followUpId: string
  showToast?: (message: string, type?: "success" | "error") => void
}

export default function UpdateRejectionModal({ isOpen, onClose, onUpdated, rejection, followUpId, showToast }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    date: "",
    type: "",
    grade: "",
    biopsyProven: false,
    treatment: "",
    resolved: false
  })

  const rejectionTypes = ["Cellular", "AntibodyMediated", "Mixed"]
  const banffGrades = ["Borderline", "IA", "IB", "IIA", "IIB", "III", "Antibody-Mediated Rejection (AMR)"]
  const treatmentOptions = ["IV Methylprednisolone", "Thymoglobulin", "Rituximab", "Plasmapheresis", "IVIG", "Bortezomib", "Eculizumab", "Adjustment of maintenance immunosuppression", "Combination therapy"]

  useEffect(() => {
    if (isOpen) {
      setForm({
        date: rejection?.date?.split("T")[0] || "",
        type: rejection?.type || "",
        grade: rejection?.grade || "",
        biopsyProven: rejection?.biopsyProven || false,
        treatment: rejection?.treatment || "",
        resolved: rejection?.resolved || false
      })
    }
  }, [isOpen, rejection])

  const handleSubmit = async () => {
    if (!form.date || !form.type || !form.grade || !form.treatment) {
      showToast?.("Please fill in all required fields", "error")
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        followup_id: followUpId,
        date: form.date,
        type: form.type,
        grade: form.grade,
        biopsyProven: form.biopsyProven,
        treatment: form.treatment,
        resolved: form.resolved
      }
      
      if (rejection?._id) {
        await api.patch(`/rejections/${rejection._id}`, payload)
        showToast?.("Rejection episode updated successfully!", "success")
      } else {
        await api.post("/rejections", payload)
        showToast?.("Rejection episode added successfully!", "success")
      }
      
      onUpdated()
      handleClose()
    } catch (err: any) {
      showToast?.(err.response?.data?.detail || "Failed to save rejection episode", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const isEditMode = !!rejection?._id

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="bg-amber-100 rounded-full p-2">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "Update" : "Add"} Rejection Episode</h2>
              <p className="text-sm text-gray-500 mt-1">Document acute or chronic rejection events</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Date <span className="text-red-500">*</span>
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
                Rejection Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {rejectionTypes.map(type => (
                  <label
                    key={type}
                    className={`flex items-center justify-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                      form.type === type
                        ? type === "Cellular"
                          ? "border-blue-500 bg-blue-50"
                          : type === "AntibodyMediated"
                          ? "border-purple-500 bg-purple-50"
                          : "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={form.type === type}
                      onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value }))}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">
                      {type === "AntibodyMediated" ? "Antibody-Mediated" : type}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banff Grade <span className="text-red-500">*</span>
              </label>
              <select
                value={form.grade}
                onChange={(e) => setForm(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">Select Banff grade</option>
                {banffGrades.map(grade => (<option key={grade} value={grade}>{grade}</option>))}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-700">Biopsy Proven</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.biopsyProven} onChange={(e) => setForm(prev => ({ ...prev, biopsyProven: e.target.checked }))} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Treatment <span className="text-red-500">*</span>
              </label>
              <select
                value={form.treatment}
                onChange={(e) => setForm(prev => ({ ...prev, treatment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">Select treatment</option>
                {treatmentOptions.map(treatment => (<option key={treatment} value={treatment}>{treatment}</option>))}
              </select>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium text-gray-700">Episode Resolved</label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.resolved} onChange={(e) => setForm(prev => ({ ...prev, resolved: e.target.checked }))} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <p className="text-sm text-red-800"><strong>Clinical Note:</strong> Rejection episodes require prompt treatment. Document the type, grade, and treatment response for proper management.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Syringe className="h-4 w-4" />}
              {loading ? "Saving..." : isEditMode ? "Update" : "Add"} Rejection
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}