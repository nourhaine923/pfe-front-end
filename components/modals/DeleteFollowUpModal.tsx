"use client"

import { useState } from "react"
import Modal from "./Modal"
import api from "@/services/api"
import { Loader2, AlertTriangle } from "lucide-react"

interface Props {
  isOpen: boolean
  onClose: () => void
  followUpId: string | null
  onDeleted: () => void
  showToast?: (message: string, type?: "success" | "error") => void
}

export default function DeleteFollowUpModal({ isOpen, onClose, followUpId, onDeleted, showToast }: Props) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!followUpId) return

    try {
      setLoading(true)
      await api.delete(`/followups/${followUpId}`)
      showToast?.("Follow-up deleted successfully!", "success")
      onDeleted()
      onClose()
    } catch (err: any) {
      console.error("Delete follow-up error:", err)
      showToast?.(err.response?.data?.detail || "Failed to delete follow-up", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 rounded-full p-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Delete Follow-up</h2>
        </div>
        
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete this follow-up? This action cannot be undone.
          All associated data (vital signs, biological measurements, etc.) will also be deleted.
        </p>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}