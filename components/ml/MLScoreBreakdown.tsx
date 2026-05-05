// components/ml/MLScoreBreakdown.tsx - Updated for Urgency (no CKD)

"use client"

import { useState, useEffect } from "react"
import { Brain, AlertCircle, CheckCircle, Activity } from "lucide-react"
import api from "@/services/api"

interface PatientData {
  recipient_age: number
  donor_age: number
  diabetes: boolean
  hypertension: boolean
  previous_transplants: number
  cold_ischemia: number
  warm_ischemia: number
  donor_type: string
  eer_modality: string
  bmi: number
  acc: boolean
  hbsag: boolean
  anti_hcv: boolean
  transfusion_history: boolean
  serum_creatinine: number
  nephropathy: string
}

interface MLScoreBreakdownProps {
  patientData: PatientData
  onClose: () => void
}

export default function MLScoreBreakdown({ patientData, onClose }: MLScoreBreakdownProps) {
  const [loading, setLoading] = useState(true)
  const [modelInfo, setModelInfo] = useState<any>(null)
  const [predictionDetails, setPredictionDetails] = useState<any>(null)

  useEffect(() => {
    fetchModelInfo()
    analyzePrediction()
  }, [])

  const fetchModelInfo = async () => {
    try {
      const res = await api.get("/ml/model-info")
      setModelInfo(res.data)
    } catch (err) {
      console.error("Error fetching model info:", err)
    }
  }

  const analyzePrediction = async () => {
    setLoading(true)
    try {
      const res = await api.post("/ml/predict-score1", patientData)
      setPredictionDetails(res.data)
    } catch (err) {
      console.error("Error analyzing prediction:", err)
    } finally {
      setLoading(false)
    }
  }

  const getRiskFactors = () => {
    const factors = []
    if (patientData.recipient_age > 60) factors.push({ name: "Advanced Age", severity: "high", value: `${patientData.recipient_age} years` })
    if (patientData.diabetes) factors.push({ name: "Diabetes", severity: "high", value: "Present" })
    if (patientData.hypertension) factors.push({ name: "Hypertension", severity: "medium", value: "Present" })
    if (patientData.serum_creatinine > 2.0) factors.push({ name: "High Creatinine", severity: "high", value: `${patientData.serum_creatinine} mg/dL` })
    if (patientData.previous_transplants > 0) factors.push({ name: "Previous Transplants", severity: "medium", value: `${patientData.previous_transplants} time(s)` })
    if (patientData.cold_ischemia > 20) factors.push({ name: "Prolonged Cold Ischemia", severity: "medium", value: `${patientData.cold_ischemia} hours` })
    if (patientData.donor_type === "Deceased") factors.push({ name: "Deceased Donor", severity: "low", value: "Deceased donor" })
    if (patientData.bmi > 30) factors.push({ name: "Obesity", severity: "medium", value: `BMI ${patientData.bmi}` })
    if (patientData.acc) factors.push({ name: "Cardiovascular Disease", severity: "high", value: "Present" })
    
    return factors
  }

  const getProtectiveFactors = () => {
    const factors = []
    if (patientData.recipient_age < 40) factors.push({ name: "Young Age", value: `${patientData.recipient_age} years` })
    if (!patientData.diabetes && !patientData.hypertension) factors.push({ name: "No Comorbidities", value: "Healthy" })
    if (patientData.serum_creatinine < 1.0) factors.push({ name: "Normal Creatinine", value: `${patientData.serum_creatinine} mg/dL` })
    if (patientData.donor_type === "Living") factors.push({ name: "Living Donor", value: "Living donor" })
    if (patientData.eer_modality === "Preemptive") factors.push({ name: "Preemptive Transplant", value: "No prior dialysis" })
    if (patientData.bmi >= 18.5 && patientData.bmi <= 25) factors.push({ name: "Normal BMI", value: `${patientData.bmi}` })
    
    return factors
  }

  const getUrgencyLabel = (score: number) => {
    if (score >= 70) return { label: "High Urgency", color: "text-red-600", bg: "bg-red-100" }
    if (score >= 40) return { label: "Moderate Urgency", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { label: "Low Urgency", color: "text-green-600", bg: "bg-green-100" }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Analyzing prediction...</p>
        </div>
      </div>
    )
  }

  const riskFactors = getRiskFactors()
  const protectiveFactors = getProtectiveFactors()
  const urgencyLabel = getUrgencyLabel(predictionDetails?.score || 0)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">ML Score Breakdown</h2>
                <p className="text-purple-100 text-sm">AI Model - Transplant Urgency Predictor</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">✕</button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Prediction Result */}
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100">
            <h3 className="font-semibold text-gray-800 mb-4">🧠 AI Prediction Result</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-5xl font-bold text-purple-700">{predictionDetails?.score}</p>
                <p className="text-sm text-gray-500">/ 100</p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-semibold ${urgencyLabel.color}`}>
                  {urgencyLabel.label}
                </p>
                <p className="text-sm text-gray-500">Transplant Urgency Score</p>
                <p className="text-xs text-gray-400">Confidence: {(predictionDetails?.confidence * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Risk Factors Analysis */}
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Risk Factors Increasing Urgency
            </h3>
            {riskFactors.length > 0 ? (
              <div className="space-y-2">
                {riskFactors.map((factor, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{factor.name}</p>
                      <p className="text-xs text-gray-500">{factor.value}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      factor.severity === "high" ? "bg-red-100 text-red-700" :
                      factor.severity === "medium" ? "bg-orange-100 text-orange-700" :
                      "bg-yellow-100 text-yellow-700"
                    }`}>
                      {factor.severity.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">No major risk factors identified</p>
            )}
          </div>

          {/* Protective Factors */}
          {protectiveFactors.length > 0 && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Factors Reducing Urgency
              </h3>
              <div className="flex flex-wrap gap-2">
                {protectiveFactors.map((factor, idx) => (
                  <div key={idx} className="bg-white rounded-lg px-3 py-1.5">
                    <p className="text-sm font-medium text-green-700">{factor.name}</p>
                    <p className="text-xs text-gray-500">{factor.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Input Patient Data Summary */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">📋 Patient Data Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500 uppercase">Recipient Age</p>
                <p className="text-sm font-semibold">{patientData.recipient_age} years</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500 uppercase">Donor Age</p>
                <p className="text-sm font-semibold">{patientData.donor_age} years</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500 uppercase">BMI</p>
                <p className="text-sm font-semibold">{patientData.bmi}</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500 uppercase">Creatinine</p>
                <p className="text-sm font-semibold">{patientData.serum_creatinine} mg/dL</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500 uppercase">Cold Ischemia</p>
                <p className="text-sm font-semibold">{patientData.cold_ischemia} hrs</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500 uppercase">Donor Type</p>
                <p className="text-sm font-semibold">{patientData.donor_type}</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500 uppercase">EER Modality</p>
                <p className="text-sm font-semibold">{patientData.eer_modality}</p>
              </div>
              <div className="bg-white rounded-lg p-2">
                <p className="text-xs text-gray-500 uppercase">Nephropathy</p>
                <p className="text-sm font-semibold">{patientData.nephropathy}</p>
              </div>
            </div>
          </div>

          {/* Urgency Probability Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3">🎯 Urgency Probability Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-red-600">High Urgency Probability</span>
                  <span className="font-mono">{(predictionDetails?.probability_ckd * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-red-500 h-3 rounded-full transition-all" style={{ width: `${(predictionDetails?.probability_ckd || 0) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-green-600">Low Urgency Probability</span>
                  <span className="font-mono">{(predictionDetails?.probability_no_ckd * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${(predictionDetails?.probability_no_ckd || 0) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}