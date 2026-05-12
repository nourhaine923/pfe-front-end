"use client"

import { useState, useEffect } from "react"
import { Brain, Activity, Shield, Loader2, AlertCircle, CheckCircle, Zap } from "lucide-react"
import api from "@/services/api"
import MLScoreBreakdown from "./MLScoreBreakdown"

interface MLPrediction {
  score: number
  risk_level: string
  urgency_status: string
  confidence: number
  probability_high_urgency: number
  probability_low_urgency: number
}

// Updated PatientData to match your transplant features
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

interface MLScoreCardProps {
  patientData?: Partial<PatientData>
  onPredictionComplete?: (prediction: MLPrediction) => void
}

export default function MLScoreCard({ patientData, onPredictionComplete }: MLScoreCardProps) {
  // Reset state when patientData changes
  useEffect(() => {
    if (patientData) {
      // Update form data with new patient data
      setFormData({
        recipient_age: patientData?.recipient_age || 50,
        donor_age: patientData?.donor_age || 40,
        diabetes: patientData?.diabetes || false,
        hypertension: patientData?.hypertension || false,
        previous_transplants: patientData?.previous_transplants || 0,
        cold_ischemia: patientData?.cold_ischemia || 10,
        warm_ischemia: patientData?.warm_ischemia || 30,
        donor_type: patientData?.donor_type || "Living",
        eer_modality: patientData?.eer_modality || "Hemodialysis",
        bmi: patientData?.bmi || 25,
        acc: patientData?.acc || false,
        hbsag: patientData?.hbsag || false,
        anti_hcv: patientData?.anti_hcv || false,
        transfusion_history: patientData?.transfusion_history || false,
        serum_creatinine: patientData?.serum_creatinine || 1.2,
        nephropathy: patientData?.nephropathy || "Genetic"
      })
      // Clear previous prediction when patient changes
      setPrediction(null)
      setError(null)
    }
  }, [patientData])

  const [formData, setFormData] = useState<PatientData>({
    recipient_age: patientData?.recipient_age || 50,
    donor_age: patientData?.donor_age || 40,
    diabetes: patientData?.diabetes || false,
    hypertension: patientData?.hypertension || false,
    previous_transplants: patientData?.previous_transplants || 0,
    cold_ischemia: patientData?.cold_ischemia || 10,
    warm_ischemia: patientData?.warm_ischemia || 30,
    donor_type: patientData?.donor_type || "Living",
    eer_modality: patientData?.eer_modality || "Hemodialysis",
    bmi: patientData?.bmi || 25,
    acc: patientData?.acc || false,
    hbsag: patientData?.hbsag || false,
    anti_hcv: patientData?.anti_hcv || false,
    transfusion_history: patientData?.transfusion_history || false,
    serum_creatinine: patientData?.serum_creatinine || 1.2,
    nephropathy: patientData?.nephropathy || "Genetic"
  })
  
  const [prediction, setPrediction] = useState<MLPrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const donorTypeOptions = ["Living", "Deceased"]
  const eerModalityOptions = ["Preemptive", "Hemodialysis", "Peritoneal"]
  const nephropathyOptions = ["Genetic", "Congenital", "Glomerulonephritis", "Hypertensive", "Diabetic"]

  const handleInputChange = (field: keyof PatientData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handlePredict = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post("/ml/predict-score1", formData)
      const data = response.data
      
      // Align risk levels with scoring rule system (0-100 scale)
      let risk_level = ""
      let urgency_status = ""
      
      if (data.score >= 70) {
        risk_level = "High Urgency"
        urgency_status = "High Urgency - Immediate Action Required"
      } else if (data.score >= 40) {
        risk_level = "Moderate Urgency"
        urgency_status = "Moderate Urgency - Plan Within 3 Months"
      } else {
        risk_level = "Low Urgency"
        urgency_status = "Low Urgency - Routine Monitoring"
      }
      
      const transformedPrediction: MLPrediction = {
        score: data.score,
        risk_level: risk_level,
        urgency_status: urgency_status,
        confidence: data.confidence,
        probability_high_urgency: data.probability_ckd,
        probability_low_urgency: data.probability_no_ckd
      }
      setPrediction(transformedPrediction)
      onPredictionComplete?.(transformedPrediction)
    } catch (err: any) {
      console.error("Prediction error:", err)
      setError(err.response?.data?.detail || "Failed to get prediction")
    } finally {
      setLoading(false)
    }
  }

  // Score ranges aligned with scoring rule system
  // 0-39: Low Urgency (Green)
  // 40-69: Moderate Urgency (Yellow)
  // 70-100: High Urgency (Red)
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-red-600"
    if (score >= 40) return "text-yellow-600"
    return "text-green-600"
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return "bg-red-100"
    if (score >= 40) return "bg-yellow-100"
    return "bg-green-100"
  }

  const getProgressBarColor = (score: number) => {
    if (score >= 70) return "bg-red-500"
    if (score >= 40) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getUrgencyIcon = (riskLevel: string) => {
    if (riskLevel === "High Urgency") {
      return <AlertCircle className="h-5 w-5 text-red-600" />
    }
    if (riskLevel === "Moderate Urgency") {
      return <Activity className="h-5 w-5 text-yellow-600" />
    }
    return <Shield className="h-5 w-5 text-green-600" />
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-xl p-2">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">AI-Powered SCORE 1</h3>
              <p className="text-purple-100 text-sm">ML-based Transplant Urgency Prediction</p>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white/80 hover:text-white text-sm"
          >
            {isExpanded ? "Hide Details" : "Show Details"}
          </button>
        </div>
      </div>

      <div className="p-6">
        {isExpanded && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Patient Clinical Data</h4>
            
            {/* Demographics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Recipient Age</label>
                <input type="number" value={formData.recipient_age} onChange={(e) => handleInputChange('recipient_age', parseFloat(e.target.value))} className="w-full px-2 py-1 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Donor Age</label>
                <input type="number" value={formData.donor_age} onChange={(e) => handleInputChange('donor_age', parseFloat(e.target.value))} className="w-full px-2 py-1 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">BMI</label>
                <input type="number" step="0.1" value={formData.bmi} onChange={(e) => handleInputChange('bmi', parseFloat(e.target.value))} className="w-full px-2 py-1 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Creatinine (mg/dL)</label>
                <input type="number" step="0.1" value={formData.serum_creatinine} onChange={(e) => handleInputChange('serum_creatinine', parseFloat(e.target.value))} className="w-full px-2 py-1 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Previous Transplants</label>
                <input type="number" value={formData.previous_transplants} onChange={(e) => handleInputChange('previous_transplants', parseInt(e.target.value))} className="w-full px-2 py-1 border rounded text-sm" />
              </div>
            </div>

            {/* Ischemia Times */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Cold Ischemia (hours)</label>
                <input type="number" step="0.5" value={formData.cold_ischemia} onChange={(e) => handleInputChange('cold_ischemia', parseFloat(e.target.value))} className="w-full px-2 py-1 border rounded text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Warm Ischemia (minutes)</label>
                <input type="number" value={formData.warm_ischemia} onChange={(e) => handleInputChange('warm_ischemia', parseFloat(e.target.value))} className="w-full px-2 py-1 border rounded text-sm" />
              </div>
            </div>

            {/* Categorical Selections */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Donor Type</label>
                <select value={formData.donor_type} onChange={(e) => handleInputChange('donor_type', e.target.value)} className="w-full px-2 py-1 border rounded text-sm bg-white">
                  {donorTypeOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">EER Modality</label>
                <select value={formData.eer_modality} onChange={(e) => handleInputChange('eer_modality', e.target.value)} className="w-full px-2 py-1 border rounded text-sm bg-white">
                  {eerModalityOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Nephropathy</label>
                <select value={formData.nephropathy} onChange={(e) => handleInputChange('nephropathy', e.target.value)} className="w-full px-2 py-1 border rounded text-sm bg-white">
                  {nephropathyOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
              </div>
            </div>

            {/* Comorbidities - Checkboxes */}
            <div className="mb-4">
              <label className="block text-xs text-gray-500 mb-2">Comorbidities</label>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={formData.diabetes} onChange={(e) => handleInputChange('diabetes', e.target.checked)} className="rounded" /> Diabetes</label>
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={formData.hypertension} onChange={(e) => handleInputChange('hypertension', e.target.checked)} className="rounded" /> Hypertension</label>
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={formData.acc} onChange={(e) => handleInputChange('acc', e.target.checked)} className="rounded" /> ACC/CAD</label>
                <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={formData.transfusion_history} onChange={(e) => handleInputChange('transfusion_history', e.target.checked)} className="rounded" /> Transfusion History</label>
              </div>
            </div>
          </div>
        )}

        <button onClick={handlePredict} disabled={loading} className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing...</> : <><Brain className="h-4 w-4" /> Predict Urgency Score</>}
        </button>

        {error && (<div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>)}

        {prediction && !error && (
          <div className="mt-6 animate-in fade-in duration-300">
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-6 border border-purple-100">
              <div className="flex items-center gap-6 mb-4">
                <div className="relative">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="48" fill="none" stroke="#e9d5ff" strokeWidth="8" />
                    <circle 
                      cx="56" cy="56" r="48" fill="none" stroke="#8b5cf6" strokeWidth="8" 
                      strokeDasharray="301.59" 
                      strokeDashoffset={301.59 - (prediction.score / 100) * 301.59} 
                      strokeLinecap="round" 
                      className="transition-all duration-700 ease-out" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-purple-700">{prediction.score}</span>
                    <span className="text-xs text-gray-400">/100</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getUrgencyIcon(prediction.risk_level)}
                    <span className="font-semibold text-gray-800">{prediction.risk_level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreBgColor(prediction.score)} ${getScoreColor(prediction.score)}`}>
                      {prediction.urgency_status}
                    </div>
                    <div className="text-xs text-gray-500">Confidence: {(prediction.confidence * 100).toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              {/* Urgency Level Progress Bar - Aligned with scoring rules */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Urgency Level:</span>
                  <span className={`font-semibold ${getScoreColor(prediction.score)}`}>
                    {prediction.score}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getProgressBarColor(prediction.score)}`} 
                    style={{ width: `${prediction.score}%` }} 
                  />
                </div>
              </div>
              <button onClick={() => setShowBreakdown(true)} className="mt-3 w-full text-center text-xs text-purple-600 hover:text-purple-700 font-medium">
                View Full Breakdown →
              </button>

              {showBreakdown && (<MLScoreBreakdown patientData={formData} onClose={() => setShowBreakdown(false)} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}