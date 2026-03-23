"use client"

import { useState } from "react"
import Modal from "./Modal"
import api from "@/services/api"

interface Props {
  isOpen: boolean
  onClose: () => void
  patientId: string | null
  onDeleted: () => void
}

export default function DeletePatientModal({
  isOpen,
  onClose,
  patientId,
  onDeleted
}: Props) {

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {

    if (!patientId) return

    try {

      setLoading(true)
      setError("")

      await api.delete(`/patients/${patientId}`)

      onDeleted()
      onClose()

    } catch (err: any) {

      console.error("Delete patient error:", err)

      if (err.response) {
        setError(err.response.data?.detail || "Failed to delete patient")
      } else {
        setError("Failed to delete patient")
      }

    } finally {

      setLoading(false)

    }

  }

  return (

    <Modal isOpen={isOpen} onClose={onClose}>

      <h3>Delete Patient</h3>

      <p>Are you sure you want to delete this patient?</p>

      {error && (
        <p style={{ color: "red" }}>{error}</p>
      )}

      <div style={{ marginTop: 20 }}>

        <button
          onClick={handleDelete}
          disabled={!patientId || loading}
          style={{
            marginRight: 10,
            background: "red",
            color: "white",
            padding: "8px 12px"
          }}
        >
          {loading ? "Deleting..." : "Delete"}
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          style={{
            padding: "8px 12px"
          }}
        >
          Cancel
        </button>

      </div>

    </Modal>
  )
}