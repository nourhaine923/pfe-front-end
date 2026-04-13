"use client"

import { useState } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2, Activity, Heart, Droplet, AlertCircle } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: () => void
  transplantationId: string | null
  transplantInfo?: {
    transplantNumber: string
    donorName: string
    recipientName: string
  }
  showToast?: (message: string, type?: "success" | "error") => void
}

export default function CreateOutcomeModal({ 
  isOpen, 
  onClose, 
  onCreated, 
  transplantationId,
  transplantInfo,
  showToast 
}: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    lastNewsDate: "",
    aliveWithFunctioningGraft: false,
    returnToDialysis: false,
    deathWithFunctioningGraft: false,
    lostToFollowUp: false,
    delayedGraftFunction: false
  })

  const handleCheckboxChange = (field: string, checked: boolean) => {
    // When selecting one, unselect others (mutually exclusive except delayedGraftFunction)
    if (field !== "delayedGraftFunction") {
      setForm(prev => ({
        ...prev,
        aliveWithFunctioningGraft: field === "aliveWithFunctioningGraft" ? checked : false,
        returnToDialysis: field === "returnToDialysis" ? checked : false,
        deathWithFunctioningGraft: field === "deathWithFunctioningGraft" ? checked : false,
        lostToFollowUp: field === "lostToFollowUp" ? checked : false,
        [field]: checked
      }))
    } else {
      setForm(prev => ({ ...prev, [field]: checked }))
    }
  }

  const handleSubmit = async () => {
    if (!form.lastNewsDate) {
      showToast?.("Please select the last news date", "error")
      return
    }

    // Check if at least one outcome is selected
    const hasOutcome = form.aliveWithFunctioningGraft || form.returnToDialysis || 
                        form.deathWithFunctioningGraft || form.lostToFollowUp
    if (!hasOutcome) {
      showToast?.("Please select at least one outcome", "error")
      return
    }

    try {
      setLoading(true)
      await api.post("/outcomes", {
        transplantation_id: transplantationId,
        lastNewsDate: form.lastNewsDate,
        aliveWithFunctioningGraft: form.aliveWithFunctioningGraft,
        returnToDialysis: form.returnToDialysis,
        deathWithFunctioningGraft: form.deathWithFunctioningGraft,
        lostToFollowUp: form.lostToFollowUp,
        delayedGraftFunction: form.delayedGraftFunction
      })
      showToast?.("Outcome recorded successfully!", "success")
      onCreated()
      handleClose()
    } catch (err: any) {
      console.error("Error creating outcome:", err)
      showToast?.(err.response?.data?.detail || "Failed to record outcome", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm({
      lastNewsDate: "",
      aliveWithFunctioningGraft: false,
      returnToDialysis: false,
      deathWithFunctioningGraft: false,
      lostToFollowUp: false,
      delayedGraftFunction: false
    })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[80vh] overflow-y-auto">
        <div className="px-4 py-4">
          <div className="sticky top-0 bg-white pb-4 mb-4 border-b z-10">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-blue-900">Record Outcome</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">Record the outcome for this transplantation</p>
          </div>

          <div className="space-y-6">
            {/* Transplantation Info Display */}
            {transplantInfo && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Transplantation Details</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Transplant Number</p>
                    <p className="font-medium text-gray-900">{transplantInfo.transplantNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Donor</p>
                    <p className="font-medium text-gray-900">{transplantInfo.donorName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Recipient</p>
                    <p className="font-medium text-gray-900">{transplantInfo.recipientName}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Last News Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last News Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.lastNewsDate}
                onChange={(e) => setForm(prev => ({ ...prev, lastNewsDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Outcome Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Patient Status <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.aliveWithFunctioningGraft}
                    onChange={(e) => handleCheckboxChange("aliveWithFunctioningGraft", e.target.checked)}
                    className="w-4 h-4 text-green-600 focus:ring-green-500"
                  />
                  <Heart className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-gray-700">Alive with Functioning Graft</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.returnToDialysis}
                    onChange={(e) => handleCheckboxChange("returnToDialysis", e.target.checked)}
                    className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                  />
                  <Droplet className="h-5 w-5 text-yellow-600" />
                  <span className="font-medium text-gray-700">Return to Dialysis</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.deathWithFunctioningGraft}
                    onChange={(e) => handleCheckboxChange("deathWithFunctioningGraft", e.target.checked)}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-gray-700">Death with Functioning Graft</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <input
                    type="checkbox"
                    checked={form.lostToFollowUp}
                    onChange={(e) => handleCheckboxChange("lostToFollowUp", e.target.checked)}
                    className="w-4 h-4 text-gray-600 focus:ring-gray-500"
                  />
                  <AlertCircle className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-700">Lost to Follow Up</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-2">Note: Only one main status can be selected</p>
            </div>

            {/* Delayed Graft Function */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <input
                  type="checkbox"
                  checked={form.delayedGraftFunction}
                  onChange={(e) => handleCheckboxChange("delayedGraftFunction", e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-700">Delayed Graft Function</span>
              </label>
              <p className="text-xs text-gray-500 mt-1">This can be selected along with other outcomes</p>
            </div>
          </div>

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
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
              {loading ? "Recording..." : "Record Outcome"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}