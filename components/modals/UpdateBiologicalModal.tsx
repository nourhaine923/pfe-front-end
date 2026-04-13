// components/modals/UpdateBiologicalModal.tsx

"use client"

import { useState, useEffect } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2, Droplet, FlaskConical } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onUpdated: () => void
  biological: any
  followUpId: string
  showToast?: (message: string, type?: "success" | "error") => void
}

export default function UpdateBiologicalModal({ isOpen, onClose, onUpdated, biological, followUpId, showToast }: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    date: "",
    creatinine: "",
    urea: "",
    gfr: "",
    hemoglobin: "",
    crp: "",
    tsh: "",
    proteinuria: "",
    otherBioMarker1: "",
    otherBioMarker2: ""
  })

  useEffect(() => {
    if (isOpen) {
      setForm({
        date: biological?.date?.split("T")[0] || "",
        creatinine: biological?.creatinine?.toString() || "",
        urea: biological?.urea?.toString() || "",
        gfr: biological?.gfr?.toString() || "",
        hemoglobin: biological?.hemoglobin?.toString() || "",
        crp: biological?.crp?.toString() || "",
        tsh: biological?.tsh?.toString() || "",
        proteinuria: biological?.proteinuria?.toString() || "",
        otherBioMarker1: biological?.otherBioMarker1?.toString() || "",
        otherBioMarker2: biological?.otherBioMarker2?.toString() || ""
      })
    }
  }, [isOpen, biological])

  const handleSubmit = async () => {
    if (!form.date) {
      showToast?.("Please select a date", "error")
      return
    }

    try {
      setLoading(true)
      
      const payload = {
        followup_id: followUpId,
        date: form.date,
        creatinine: form.creatinine ? Number(form.creatinine) : null,
        urea: form.urea ? Number(form.urea) : null,
        gfr: form.gfr ? Number(form.gfr) : null,
        hemoglobin: form.hemoglobin ? Number(form.hemoglobin) : null,
        crp: form.crp ? Number(form.crp) : null,
        tsh: form.tsh ? Number(form.tsh) : null,
        proteinuria: form.proteinuria ? Number(form.proteinuria) : null,
        otherBioMarker1: form.otherBioMarker1 ? Number(form.otherBioMarker1) : null,
        otherBioMarker2: form.otherBioMarker2 ? Number(form.otherBioMarker2) : null
      }
      
      if (biological?._id) {
        await api.patch(`/biological/${biological._id}`, payload)
        showToast?.("Biological measurement updated successfully!", "success")
      } else {
        await api.post("/biological", payload)
        showToast?.("Biological measurement added successfully!", "success")
      }
      
      onUpdated()
      handleClose()
    } catch (err: any) {
      showToast?.(err.response?.data?.detail || "Failed to save biological measurement", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const isEditMode = !!biological?._id

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b">
            <div className="bg-amber-100 rounded-full p-2">
              <FlaskConical className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{isEditMode ? "Update" : "Add"} Biological Measurement</h2>
              <p className="text-sm text-gray-500 mt-1">Enter laboratory results and biomarkers</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Measurement Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-md font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Droplet className="h-4 w-4" />
                Renal Function
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Creatinine (mg/dL)</label>
                  <input type="number" step="0.01" value={form.creatinine} onChange={(e) => setForm(prev => ({ ...prev, creatinine: e.target.value }))} placeholder="0.5-1.2" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urea (mg/dL)</label>
                  <input type="number" step="0.1" value={form.urea} onChange={(e) => setForm(prev => ({ ...prev, urea: e.target.value }))} placeholder="10-50" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">eGFR (mL/min)</label>
                  <input type="number" step="1" value={form.gfr} onChange={(e) => setForm(prev => ({ ...prev, gfr: e.target.value }))} placeholder=">60" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Proteinuria (g/24h)</label>
                  <input type="number" step="0.1" value={form.proteinuria} onChange={(e) => setForm(prev => ({ ...prev, proteinuria: e.target.value }))} placeholder="<0.15" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-md font-semibold text-purple-800 mb-3">Hematology & Inflammation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hemoglobin (g/dL)</label>
                  <input type="number" step="0.1" value={form.hemoglobin} onChange={(e) => setForm(prev => ({ ...prev, hemoglobin: e.target.value }))} placeholder="12-16" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CRP (mg/L)</label>
                  <input type="number" step="0.1" value={form.crp} onChange={(e) => setForm(prev => ({ ...prev, crp: e.target.value }))} placeholder="<5" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-md font-semibold text-yellow-800 mb-3">Endocrine</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">TSH (mIU/L)</label>
                <input type="number" step="0.01" value={form.tsh} onChange={(e) => setForm(prev => ({ ...prev, tsh: e.target.value }))} placeholder="0.4-4.0" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-md font-semibold text-gray-800 mb-3">Other Biomarkers</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biomarker 1</label>
                  <input type="number" step="0.01" value={form.otherBioMarker1} onChange={(e) => setForm(prev => ({ ...prev, otherBioMarker1: e.target.value }))} placeholder="Value" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Biomarker 2</label>
                  <input type="number" step="0.01" value={form.otherBioMarker2} onChange={(e) => setForm(prev => ({ ...prev, otherBioMarker2: e.target.value }))} placeholder="Value" className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button onClick={handleSubmit} disabled={loading} className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FlaskConical className="h-4 w-4" />}
              {loading ? "Saving..." : isEditMode ? "Update" : "Add"} Measurement
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}