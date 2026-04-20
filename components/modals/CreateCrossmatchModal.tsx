"use client"

import { useState } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2, Syringe, XCircle, CheckCircle, Calendar, FileText, AlertCircle } from "lucide-react"

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

export default function CreateCrossmatchModal({ 
  isOpen, 
  onClose, 
  onCreated, 
  transplantationId,
  transplantInfo,
  showToast 
}: Props) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    testDate: "",
    methode: "CDC",
    result: "Negative",
    comment: ""
  })

  const methods = [
    { value: "CDC", label: "Complement-Dependent Cytotoxicity (CDC)" },
    { value: "FlowCytometry", label: "Flow Cytometry Crossmatch" },
    { value: "Virtual", label: "Virtual Crossmatch" }
  ]
  
  const results = [
    { value: "Positive", label: "Positive", color: "text-red-600", icon: XCircle },
    { value: "Negative", label: "Negative", color: "text-green-600", icon: CheckCircle }
  ]

  // Helper function to validate date (must be within last week or today)
  const validateTestDate = (dateString: string): string | null => {
    if (!dateString) return null
    
    const inputDate = new Date(dateString)
    const today = new Date()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(today.getDate() - 7)
    
    // Reset time part for accurate comparison
    today.setHours(0, 0, 0, 0)
    inputDate.setHours(0, 0, 0, 0)
    oneWeekAgo.setHours(0, 0, 0, 0)
    
    if (inputDate > today) {
      return "Test date cannot be in the future"
    }
    
    if (inputDate < oneWeekAgo) {
      return "Test date cannot be older than 1 week"
    }
    
    return null
  }

  const validateForm = () => {
    if (!form.testDate) {
      showToast?.("Please select a test date", "error")
      return false
    }
    
    const dateError = validateTestDate(form.testDate)
    if (dateError) {
      showToast?.(dateError, "error")
      return false
    }
    
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)
      await api.post("/crossmatch-tests", {
        transplantation_id: transplantationId,
        testDate: form.testDate,
        methode: form.methode,
        result: form.result,
        comment: form.comment || null
      })
      showToast?.("Crossmatch test created successfully!", "success")
      onCreated()
      handleClose()
    } catch (err: any) {
      console.error("Error creating crossmatch test:", err)
      const errorMessage = err.response?.data?.detail || "Failed to create crossmatch test"
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
      testDate: "",
      methode: "CDC",
      result: "Negative",
      comment: ""
    })
    onClose()
  }

  // Get max date (today) and min date (7 days ago) for date input
  const today = new Date().toISOString().split('T')[0]
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const minDate = oneWeekAgo.toISOString().split('T')[0]

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="max-h-[85vh] overflow-y-auto">
        <div className="px-6 py-6">
          {/* Header */}
          <div className="sticky top-0 bg-white pb-4 mb-4 border-b z-10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Syringe className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900">Create Crossmatch Test</h2>
                <p className="text-sm text-gray-500 mt-1">Record a new crossmatch test result for this transplantation</p>
              </div>
            </div>
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

            {/* Test Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={form.testDate}
                  max={today}
                  min={minDate}
                  onChange={(e) => setForm(prev => ({ ...prev, testDate: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Date must be within the last 7 days (including today)</p>
            </div>

            {/* Test Method - Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Method <span className="text-red-500">*</span>
              </label>
              <select
                value={form.methode}
                onChange={(e) => setForm(prev => ({ ...prev, methode: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {methods.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Result */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {results.map(r => {
                  const Icon = r.icon
                  return (
                    <label
                      key={r.value}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        form.result === r.value
                          ? r.value === "Positive"
                            ? "border-red-500 bg-red-50 ring-2 ring-red-200"
                            : "border-green-500 bg-green-50 ring-2 ring-green-200"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="result"
                        value={r.value}
                        checked={form.result === r.value}
                        onChange={(e) => setForm(prev => ({ ...prev, result: e.target.value }))}
                        className="w-4 h-4"
                      />
                      <Icon className={`h-5 w-5 ${r.color}`} />
                      <span className={`font-medium ${r.color}`}>{r.label}</span>
                    </label>
                  )
                })}
              </div>
              {form.result === "Positive" && (
                <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Positive Result</p>
                      <p className="text-xs text-red-600 mt-1">
                        A positive crossmatch indicates the presence of donor-specific antibodies,
                        which may increase the risk of rejection. Consider additional testing or alternative donors.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm(prev => ({ ...prev, comment: e.target.value }))}
                  rows={3}
                  placeholder="Enter any additional notes or observations..."
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
                  Creating...
                </>
              ) : (
                <>
                  <Syringe className="h-4 w-4" />
                  Create Crossmatch Test
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}