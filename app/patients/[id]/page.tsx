"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import api from "@/services/api"
import { ProtectRoute } from "@/features/auth/context"

export default function PatientDetailPage() {

  const { id } = useParams()

  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {

    async function fetchPatient() {

      try {

        setLoading(true)

        const res = await api.get(`/patients/${id}`)

        setPatient(res.data)

      } catch (err) {

        console.error("Failed to load patient:", err)
        setError("Failed to load patient")

      } finally {

        setLoading(false)

      }

    }

    if (id) fetchPatient()

  }, [id])

  if (loading) return <p style={{ padding: 40 }}>Loading patient...</p>

  if (error) return <p style={{ padding: 40 }}>{error}</p>

  if (!patient) return <p style={{ padding: 40 }}>Patient not found</p>

  return (

    <ProtectRoute>

      <div style={{ padding: 40 }}>

        <h1>Patient Details</h1>

        {/* IDENTITY */}
        <h2>Identity</h2>

        <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
        <p><strong>Sex:</strong> {patient.sex}</p>
        <p><strong>Blood Group:</strong> {patient.bloodGroup}</p>
        <p><strong>Role:</strong> {patient.patientRole}</p>
        <p><strong>Foreign Patient:</strong> {patient.foreignPatient ? "Yes" : "No"}</p>

        {patient.birthDate && (
          <p><strong>Birth Date:</strong> {patient.birthDate}</p>
        )}

        {/* MORPHOLOGY */}
        <h2>Morphology</h2>

        <p><strong>Height:</strong> {patient.heightCm} cm</p>
        <p><strong>Weight:</strong> {patient.weightKg} kg</p>

        {/* DONOR */}
        {patient.patientRole === "donor" && (
          <>
            <h2>Donor Data</h2>
            <p><strong>Donor Type:</strong> {patient.donorType}</p>
            <p><strong>Age At Donation:</strong> {patient.ageAtDonation}</p>
          </>
        )}

        {/* RECIPIENT */}
        {patient.patientRole === "recipient" && (
          <>
            <h2>Clinical Data</h2>

            <p><strong>Age at Transplant:</strong> {patient.clinicalData?.age_at_transplant}</p>
            <p><strong>Blood Group (Clinical):</strong> {patient.clinicalData?.blood_group}</p>
            <p><strong>Primary Nephropathy:</strong> {patient.clinicalData?.primary_nephropathy}</p>
            <p><strong>Dialysis Type:</strong> {patient.clinicalData?.dialysis_type}</p>
            <p><strong>Dialysis Duration:</strong> {patient.clinicalData?.dialysis_duration}</p>
            <p><strong>Comorbidities:</strong> {patient.clinicalData?.comorbidities}</p>
            <p><strong>Transplant Rank:</strong> {patient.clinicalData?.transplant_rank}</p>
          </>
        )}

        {/* HLA */}
        <h2>HLA Typing</h2>

        <p><strong>A:</strong> {patient.hlaTyping?.hlaA1} / {patient.hlaTyping?.hlaA2}</p>
        <p><strong>B:</strong> {patient.hlaTyping?.hlaB1} / {patient.hlaTyping?.hlaB2}</p>
        <p><strong>DR:</strong> {patient.hlaTyping?.hlaDR1} / {patient.hlaTyping?.hlaDR2}</p>
        <p><strong>DQ:</strong> {patient.hlaTyping?.hlaDQ1} / {patient.hlaTyping?.hlaDQ2}</p>

      </div>

    </ProtectRoute>

  )
}