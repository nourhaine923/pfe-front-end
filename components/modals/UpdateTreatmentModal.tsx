// components/modals/UpdateTreatmentModal.tsx

"use client"

import { useState, useEffect } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2, Pill, Calendar, Syringe, Droplet } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
  treatment: any
  followUpId: string
  showToast?: (message: string, type?: "success" | "error") => void
}

export default function UpdateTreatmentModal({ isOpen, onClose, onUpdated, treatment, followUpId, showToast }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    drugName: "",
    dosage: "",
    dosageUnit: "",
    route: "",
    startDate: "",
    endDate: "",
    bloodLevel: "",
    interpretation: ""
  })

  const drugNameOptions = ["Tacrolimus (Prograf)", "Cyclosporine (Neoral)", "Mycophenolate Mofetil (CellCept)", "Mycophenolate Sodium (Myfortic)", "Azathioprine (Imuran)", "Sirolimus (Rapamune)", "Everolimus (Zortress)", "Prednisone", "Methylprednisolone", "Belatacept (Nulojix)", "Basiliximab (Simulect)", "Thymoglobulin", "Rituximab (Rituxan)", "IVIG", "Eculizumab (Soliris)", "Other"]
  const dosageUnitOptions = ["mg", "g", "mcg", "μg", "mg/kg", "g/kg", "units", "IU"]
  const routeOptions = ["Oral", "IV", "IM", "Subcutaneous", "Topical", "Inhalation"]

  const getTherapeuticRange = (drugName: string) => {
    if (drugName.includes("Tacrolimus")) return { min: 5, max: 15, unit: "ng/mL" }
    if (drugName.includes("Cyclosporine")) return { min: 100, max: 300, unit: "ng/mL" }
    if (drugName.includes("Sirolimus") || drugName.includes("Everolimus")) return { min: 4, max: 12, unit: "ng/mL" }
    return null
  }

  const getLevelInterpretation = (level: number, drugName: string) => {
    const range = getTherapeuticRange(drugName)
    if (!range) return null
    if (level < range.min) return "Subtherapeutic - Risk of rejection"
    if (level > range.max) return "Supratherapeutic - Risk of toxicity"
    return "Therapeutic - Within target range"
  }

  useEffect(() => {
    if (isOpen) {
      setForm({
        drugName: treatment?.drugName || "",
        dosage: treatment?.dosage?.toString() || "",
        dosageUnit: treatment?.dosageUnit || "",
        route: treatment?.route || "",
        startDate: treatment?.startDate?.split("T")[0] || "",
        endDate: treatment?.endDate?.split("T")[0] || "",
        bloodLevel: treatment?.bloodLevel?.toString() || "",
        interpretation: treatment?.interpretation || ""
      })
    }
  }, [isOpen, treatment])

  const handleBloodLevelChange = (value: string) => {
    const level = Number(value)
    setForm(prev => ({ ...prev, bloodLevel: value }))
    if (level && !isNaN(level)) {
      const interpretation = getLevelInterpretation(level, form.drugName)
      if (interpretation) setForm(prev => ({ ...prev, interpretation }))
    }
  }

  const handleSubmit = async () => {
    if (!form.drugName || !form.dosage || !form.dosageUnit || !form.route || !form.startDate) {
      showToast?.("Please fill in all required fields", "error")
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        followup_id: followUpId,
        drugName: form.drugName,
        dosage: Number(form.dosage),
        dosageUnit: form.dosageUnit,
        route: form.route,
        startDate: form.startDate,
        endDate: form.endDate || null,
        bloodLevel: form.bloodLevel ? Number(form.bloodLevel) : null,
        interpretation: form.interpretation || null
      }
      
      if (treatment?._id) {
        await api.patch(`/treatments/${treatment._id}`, payload)
        showToast?.("Treatment updated successfully!", "success")
      } else {
        await api.post("/treatments", payload)
        showToast?.("Treatment added successfully!", "success")
      }
      
      onUpdated()
      handleClose()
    } catch (err: any) {
      showToast?.(err.response?.data?.detail || "Failed to save treatment", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const isEditMode = !!treatment?._id

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="bg-amber-100 rounded-full p-2">
              <Pill className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "Update" : "Add"} Therapeutic Treatment</h2>
              <p className="text-sm text-gray-500 mt-1">Document medications and therapeutic interventions</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Drug Name <span className="text-red-500">*</span>
              </label>
              <select
                value={form.drugName}
                onChange={(e) => setForm(prev => ({ ...prev, drugName: e.target.value, interpretation: "" }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
              >
                <option value="">Select drug</option>
                {drugNameOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage <span className="text-red-500">*</span>
                </label>
                <input type="number" step="0.1" value={form.dosage} onChange={(e) => setForm(prev => ({ ...prev, dosage: e.target.value }))} placeholder="e.g., 5" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit <span className="text-red-500">*</span>
                </label>
                <select value={form.dosageUnit} onChange={(e) => setForm(prev => ({ ...prev, dosageUnit: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white">
                  <option value="">Select unit</option>
                  {dosageUnitOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Route <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {routeOptions.map(r => (
                  <label key={r} className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${form.route === r ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" name="route" value={r} checked={form.route === r} onChange={(e) => setForm(prev => ({ ...prev, route: e.target.value }))} className="sr-only" />
                    <span className="text-sm">{r}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="date" value={form.startDate} onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="date" value={form.endDate} onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            {(form.drugName.includes("Tacrolimus") || form.drugName.includes("Cyclosporine") || form.drugName.includes("Sirolimus") || form.drugName.includes("Everolimus")) && (
              <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Droplet className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-semibold text-blue-800">Drug Level Monitoring</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Level</label>
                    <input type="number" step="0.1" value={form.bloodLevel} onChange={(e) => handleBloodLevelChange(e.target.value)} placeholder="Enter trough level" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Range</label>
                    {(() => { const range = getTherapeuticRange(form.drugName); return range ? <p className="text-sm text-gray-600 mt-2">{range.min}-{range.max} {range.unit}</p> : <p className="text-sm text-gray-500 mt-2">—</p> })()}
                  </div>
                </div>
                {form.interpretation && (
                  <div className={`p-2 rounded ${form.interpretation.includes("Therapeutic") ? "bg-green-100 text-green-800" : form.interpretation.includes("Subtherapeutic") ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                    <p className="text-sm">{form.interpretation}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Syringe className="h-4 w-4" />}
              {loading ? "Saving..." : isEditMode ? "Update" : "Add"} Treatment
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}