// components/modals/UpdateImmunosuppressionModal.tsx

"use client"

import { useState, useEffect } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2, Shield, Calendar } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
  regimen: any
  followUpId: string
  showToast?: (message: string, type?: "success" | "error") => void
}

export default function UpdateImmunosuppressionModal({ isOpen, onClose, onUpdated, regimen, followUpId, showToast }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    corticosteroids: false,
    mmf: false,
    azathioprine: false,
    tacrolimus: false,
    ciclosporine: false,
    sirolimus: false
  })

  useEffect(() => {
    if (isOpen) {
      setForm({
        startDate: regimen?.startDate?.split("T")[0] || "",
        endDate: regimen?.endDate?.split("T")[0] || "",
        corticosteroids: regimen?.corticosteroids || false,
        mmf: regimen?.mmf || false,
        azathioprine: regimen?.azathioprine || false,
        tacrolimus: regimen?.tacrolimus || false,
        ciclosporine: regimen?.ciclosporine || false,
        sirolimus: regimen?.sirolimus || false
      })
    }
  }, [isOpen, regimen])

  const handleSubmit = async () => {
    if (!form.startDate) {
      showToast?.("Please select start date", "error")
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        followup_id: followUpId,
        startDate: form.startDate,
        endDate: form.endDate || null,
        corticosteroids: form.corticosteroids,
        mmf: form.mmf,
        azathioprine: form.azathioprine,
        tacrolimus: form.tacrolimus,
        ciclosporine: form.ciclosporine,
        sirolimus: form.sirolimus
      }
      
      if (regimen?._id) {
        await api.patch(`/immunosuppressions/${regimen._id}`, payload)
        showToast?.("Immunosuppression regimen updated successfully!", "success")
      } else {
        await api.post("/immunosuppressions", payload)
        showToast?.("Immunosuppression regimen added successfully!", "success")
      }
      
      onUpdated()
      handleClose()
    } catch (err: any) {
      showToast?.(err.response?.data?.detail || "Failed to save regimen", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const isEditMode = !!regimen?._id

  const DrugCheckbox = ({ label, name, checked, onChange }: any) => (
    <label className="flex items-center justify-between p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500" />
    </label>
  )

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
          <div className="bg-amber-100 rounded-full p-2">
            <Shield className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "Update" : "Add"} Immunosuppression Regimen</h2>
            <p className="text-sm text-gray-500 mt-1">Record immunosuppressive therapy details</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="date" value={form.startDate} onChange={(e) => setForm(prev => ({ ...prev, startDate: e.target.value }))} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="date" value={form.endDate} onChange={(e) => setForm(prev => ({ ...prev, endDate: e.target.value }))} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">Leave empty if currently ongoing</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Immunosuppressive Drugs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DrugCheckbox label="Corticosteroids" name="corticosteroids" checked={form.corticosteroids} onChange={(e: any) => setForm(prev => ({ ...prev, corticosteroids: e.target.checked }))} />
              <DrugCheckbox label="Tacrolimus" name="tacrolimus" checked={form.tacrolimus} onChange={(e: any) => setForm(prev => ({ ...prev, tacrolimus: e.target.checked }))} />
              <DrugCheckbox label="Ciclosporine" name="ciclosporine" checked={form.ciclosporine} onChange={(e: any) => setForm(prev => ({ ...prev, ciclosporine: e.target.checked }))} />
              <DrugCheckbox label="MMF (Mycophenolate Mofetil)" name="mmf" checked={form.mmf} onChange={(e: any) => setForm(prev => ({ ...prev, mmf: e.target.checked }))} />
              <DrugCheckbox label="Azathioprine" name="azathioprine" checked={form.azathioprine} onChange={(e: any) => setForm(prev => ({ ...prev, azathioprine: e.target.checked }))} />
              <DrugCheckbox label="Sirolimus" name="sirolimus" checked={form.sirolimus} onChange={(e: any) => setForm(prev => ({ ...prev, sirolimus: e.target.checked }))} />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Clinical Note</p>
                <p className="text-xs text-blue-700 mt-1">Immunosuppression regimens typically combine multiple drugs to prevent graft rejection. Record all medications the patient is currently taking.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
          <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            {loading ? "Saving..." : isEditMode ? "Update" : "Add"} Regimen
          </button>
        </div>
      </div>
    </Modal>
  )
}