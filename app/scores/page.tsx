"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/features/auth/context"
import { useRouter } from "next/navigation"
import MLScoreCard from "@/components/ml/MLScoreCard"
import { 
  TrendingUp, 
  Loader2,
  Calendar,
  User,
  Hospital,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Heart,
  Droplet,
  Brain,
  Target,
  Shield,
  Zap,
  Clock,
  Sparkles,
  Activity,
  X,
  Eye,
  BarChart3,
  ChevronLeft,
  AlertTriangle,
  ThumbsUp,
  Gauge
} from "lucide-react"
import api from "@/services/api"
import Toast from "@/components/ui/Toast"

// Circular Progress Component
function CircularProgress({ value, max = 100, size = 120, color = "teal", label }: any) {
  const radius = (size - 8) / 2
  const circumference = radius * 2 * Math.PI
  const progress = (value / max) * 100
  const strokeDashoffset = circumference - (progress / 100) * circumference
  
  const colorMap: any = {
    teal: "text-teal-600 stroke-teal-500",
    red: "text-red-600 stroke-red-500",
    purple: "text-purple-600 stroke-purple-500"
  }
  
  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-1000 ease-out ${colorMap[color]}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-gray-800">{value}</span>
        <span className="text-xs text-gray-400">/ {max}</span>
      </div>
    </div>
  )
}

// Helper function to get priority label and color
function getPriorityInfo(score: number, scoreType: string) {
  if (scoreType === "SCORE_3") {
    // For SCORE 3: Higher score = Better success probability
    if (score >= 70) return { label: "High Priority", color: "text-green-600", bg: "bg-green-100", icon: ThumbsUp }
    if (score >= 50) return { label: "Medium Priority", color: "text-yellow-600", bg: "bg-yellow-100", icon: Gauge }
    return { label: "Low Priority", color: "text-red-600", bg: "bg-red-100", icon: AlertCircle }
  } else if (scoreType === "SCORE_2") {
    // For SCORE 2: Higher score = Higher risk
    if (score >= 80) return { label: "High Risk", color: "text-red-600", bg: "bg-red-100", icon: AlertTriangle }
    if (score >= 50) return { label: "Medium Risk", color: "text-yellow-600", bg: "bg-yellow-100", icon: Gauge }
    return { label: "Low Risk", color: "text-green-600", bg: "bg-green-100", icon: ThumbsUp }
  } else {
    // For SCORE 1: Higher score = Higher urgency (more urgent)
    if (score >= 70) return { label: "High Urgency", color: "text-red-600", bg: "bg-red-100", icon: AlertTriangle }
    if (score >= 40) return { label: "Medium Urgency", color: "text-yellow-600", bg: "bg-yellow-100", icon: Gauge }
    return { label: "Low Urgency", color: "text-green-600", bg: "bg-green-100", icon: ThumbsUp }
  }
}

// Helper function to get probability info
function getProbabilityInfo(score: number, scoreType: string) {
  if (scoreType === "SCORE_3") {
    // For SCORE 3: Score directly represents success probability
    return {
      success: score,
      risk: 100 - score,
      label: score >= 70 ? "High Success Probability" : score >= 50 ? "Moderate Success Probability" : "Low Success Probability"
    }
  } else if (scoreType === "SCORE_2") {
    // For SCORE 2: Higher score = Higher risk
    return {
      risk: score,
      success: 100 - score,
      label: score >= 80 ? "High Risk - Intensive Monitoring" : 
             score >= 50 ? "Moderate Risk - Standard Monitoring" : 
             "Low Risk - Routine Monitoring"
    }
  } else {
    // For SCORE 1: Higher score = Higher urgency
    return {
      urgency: score,
      label: score >= 70 ? "High Urgency - Immediate Action Required" : 
             score >= 40 ? "Moderate Urgency - Plan Within 3 Months" : 
             "Low Urgency - Routine Monitoring"
    }
  }
}

// Score Breakdown Modal Component
function ScoreBreakdownModal({ score, onClose }: { score: any; onClose: () => void }) {
  const getScoreColor = (impact: number) => {
    if (impact > 0) return "text-green-600 bg-green-50"
    if (impact < 0) return "text-red-600 bg-red-50"
    return "text-gray-600 bg-gray-50"
  }

  const getScoreTypeInfo = (scoreType: string) => {
    switch(scoreType) {
      case "SCORE_1":
        return { title: "SCORE 1 - Pre-transplant Risk", icon: Zap, color: "red", maxValue: 100 }
      case "SCORE_2":
        return { title: "SCORE 2 - Post-transplant Risk", icon: Activity, color: "purple", maxValue: 120 }
      case "SCORE_3":
        return { title: "SCORE 3 - Success Probability", icon: Target, color: "teal", maxValue: 100 }
      default:
        return { title: scoreType, icon: BarChart3, color: "gray", maxValue: 100 }
    }
  }

  const info = getScoreTypeInfo(score.score_type)
  const Icon = info.icon
  const percentage = (score.value / info.maxValue) * 100

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={`sticky top-0 z-10 bg-gradient-to-r from-${info.color}-500 to-${info.color}-600 px-6 py-4 rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-xl p-2">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{info.title}</h2>
                <p className="text-white/80 text-sm">Detailed score breakdown</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center mb-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl">
            <div className="flex items-center justify-center gap-6">
              <div className="relative">
                <CircularProgress value={score.value} max={info.maxValue} size={100} color={info.color} />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">Total Score</p>
                <p className="text-3xl font-bold text-gray-800">{score.value}</p>
                <p className="text-xs text-gray-400">out of {info.maxValue}</p>
                <div className="mt-2 w-32 bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full bg-${info.color}-500`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Calculated on {new Date(score.calculated_at).toLocaleString()}
            </p>
          </div>

          {score.details && score.details.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gray-600" />
                Score Components
              </h3>
              <div className="space-y-2">
                {score.details.map((detail: any, idx: number) => (
                  <div key={idx} className={`flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-md ${getScoreColor(detail.impact)}`}>
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">
                        {detail.attribute.replace(/_/g, " ").toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Value: {detail.value !== undefined && detail.value !== null 
                          ? (typeof detail.value === 'boolean' 
                              ? (detail.value ? 'Yes' : 'No') 
                              : Array.isArray(detail.value) 
                                ? `${detail.value[0]} - ${detail.value[1]}`
                                : detail.value)
                          : 'N/A'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${detail.impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {detail.impact > 0 ? '+' : ''}{detail.impact}
                      </p>
                      <p className="text-xs text-gray-400">points</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="text-xl font-bold text-gray-900">{score.value}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No detailed breakdown available for this score</p>
              <p className="text-xs text-gray-400 mt-1">Recalculate to generate breakdown</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

interface Transplantation {
  _id: string
  transplantNumber: string
  recipient?: { firstName: string; lastName: string }
  transplantDate: string
}

const ITEMS_PER_PAGE = 5

export default function ScoresPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [transplantations, setTransplantations] = useState<Transplantation[]>([])
  const [selectedTx, setSelectedTx] = useState<string>("")
  const [selectedTransplantationData, setSelectedTransplantationData] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState<string | null>(null)
  const [selectedScore, setSelectedScore] = useState<any>(null)
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null)
  const [activeTab, setActiveTab] = useState<string>("scores")
  
  // Pagination state for Score History
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (authLoading) return
    
    if (user?.role === "ADMIN") {
      router.replace("/not-authorized")
      return
    }
    
    fetchTransplantations()
  }, [authLoading, user, router])

  useEffect(() => {
    if (selectedTx) {
      fetchScores()
      fetchTransplantationDetails()
    }
  }, [selectedTx])

  // Reset pagination when scores change
  useEffect(() => {
    setCurrentPage(1)
    if (scores.length > 0) {
      setTotalPages(Math.ceil(scores.length / ITEMS_PER_PAGE))
    } else {
      setTotalPages(1)
    }
  }, [scores])

  const fetchTransplantations = async () => {
    try {
      const res = await api.get("/transplantations", { params: { limit: 100 } })
      const data = res.data?.data || res.data || []
      setTransplantations(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching transplantations:", err)
      showToast("Failed to load transplantations", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchTransplantationDetails = async () => {
    if (!selectedTx) return
    
    try {
      const res = await api.get(`/transplantations/${selectedTx}`)
      setSelectedTransplantationData(res.data)
    } catch (err) {
      console.error("Error fetching transplantation details:", err)
    }
  }

  const fetchScores = async () => {
    if (!selectedTx) return
    
    try {
      const res = await api.get(`/scores/history/${selectedTx}`)
      const scoresData = res.data || []
      const uniqueScores = scoresData.filter((score: any, index: number, self: any[]) =>
        index === self.findIndex((s: any) => s._id === score._id)
      )
      setScores(uniqueScores)
    } catch (err) {
      console.error("Error fetching scores:", err)
      setScores([])
    }
  }

  const calculateScore = async (scoreType: string) => {
    if (!selectedTx) return
    
    setCalculating(scoreType)
    try {
      let endpoint = ""
      if (scoreType === "SCORE_1") {
        endpoint = `/scores/calculate-score-1/${selectedTx}`
      } else if (scoreType === "SCORE_2") {
        showToast("SCORE 2 is calculated per follow-up visit in the follow-up details page", "warning")
        setCalculating(null)
        return
      } else if (scoreType === "SCORE_3") {
        endpoint = `/scores/calculate-score-3/${selectedTx}`
      }
      
      if (endpoint) {
        await api.post(endpoint)
        showToast(`${scoreType} calculated successfully!`, "success")
        await fetchScores()
      }
    } catch (err: any) {
      console.error("Error calculating score:", err)
      showToast(err.response?.data?.detail || "Failed to calculate score", "error")
    } finally {
      setCalculating(null)
    }
  }

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Get paginated scores
  const getPaginatedScores = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return scores
      .sort((a, b) => new Date(b.calculated_at).getTime() - new Date(a.calculated_at).getTime())
      .slice(startIndex, endIndex)
  }

  const paginatedScores = getPaginatedScores()

  // Pagination handlers
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Prepare patient data for ML prediction
  const getPatientDataForML = () => {
    if (!selectedTransplantationData) return null

    const tx = selectedTransplantationData
    const preAssessment = tx.preTransplantAssessment || {}
    const recipient = tx.recipient || {}
    
    let recipientAge = 50
    if (recipient.birthDate) {
      const birthDate = new Date(recipient.birthDate)
      const today = new Date()
      recipientAge = today.getFullYear() - birthDate.getFullYear()
    } else if (preAssessment.ageAtTransplant) {
      recipientAge = preAssessment.ageAtTransplant
    }

    let donorAge = 40
    if (tx.donor?.ageAtDonation) {
      donorAge = tx.donor.ageAtDonation
    } else if (tx.donor?.birthDate) {
      const birthDate = new Date(tx.donor.birthDate)
      const today = new Date()
      donorAge = today.getFullYear() - birthDate.getFullYear()
    }

    const mapDonorType = (type: string): string => {
      if (type === "Living Related" || type === "Living Unrelated") return "Living"
      return "Deceased"
    }

    const mapEERModality = (modality: string): string => {
      if (modality === "Preemptive") return "Preemptive"
      if (modality === "DP") return "Peritoneal"
      return "Hemodialysis"
    }

    const mapNephropathy = (type: string): string => {
      const mapping: Record<string, string> = {
        "Diabetic": "Diabetic",
        "Diabetic Nephropathy": "Diabetic",
        "Glomerular": "Glomerulonephritis",
        "Glomerulonephritis": "Glomerulonephritis",
        "Vascular": "Hypertensive",
        "Hypertensive": "Hypertensive",
        "Hereditary": "Genetic",
        "Genetic": "Genetic",
        "NTIC": "Congenital",
        "NI": "Congenital"
      }
      return mapping[type] || "Genetic"
    }

    return {
      recipient_age: recipientAge,
      donor_age: donorAge,
      diabetes: preAssessment.diabetes || false,
      hypertension: preAssessment.hypertension || false,
      previous_transplants: preAssessment.numberOfPreviousTransplants || 0,
      cold_ischemia: tx.coldIschemiaHours || 10,
      warm_ischemia: tx.warmIschemiaMinutes || 30,
      donor_type: mapDonorType(tx.donor?.donorType || "Living"),
      eer_modality: mapEERModality(preAssessment.eerModality || "Hemodialysis"),
      bmi: recipient.bmi || 25,
      acc: preAssessment.acc || false,
      hbsag: preAssessment.hbsAg || false,
      anti_hcv: preAssessment.antiHCV || false,
      transfusion_history: preAssessment.transfusion || false,
      serum_creatinine: preAssessment.serumCreatinine || 1.2,
      nephropathy: mapNephropathy(preAssessment.nephropathyType || recipient.clinicalData?.primary_nephropathy || "Genetic")
    }
  }

  const score1 = scores.find(s => s.score_type === "SCORE_1")
  const score2 = scores.find(s => s.score_type === "SCORE_2")
  const score3 = scores.find(s => s.score_type === "SCORE_3")
  const mlPatientData = getPatientDataForML()

  // Get priority and probability info for each score
  const priority1 = score1 ? getPriorityInfo(score1.value, "SCORE_1") : null
  const probability1 = score1 ? getProbabilityInfo(score1.value, "SCORE_1") : null
  
  const priority2 = score2 ? getPriorityInfo(score2.value, "SCORE_2") : null
  const probability2 = score2 ? getProbabilityInfo(score2.value, "SCORE_2") : null
  
  const priority3 = score3 ? getPriorityInfo(score3.value, "SCORE_3") : null
  const probability3 = score3 ? getProbabilityInfo(score3.value, "SCORE_3") : null

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-12 w-12 text-teal-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 bg-teal-100 rounded-full px-4 py-1.5 mb-4">
            <Brain className="h-4 w-4 text-teal-600" />
            <span className="text-sm font-medium text-teal-600">AI-Powered Decision Support</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Kidney Transplant <span className="text-teal-600">Decision Support</span>
          </h1>
          <p className="text-gray-500">Multi-criteria clinical assessment system for transplant prioritization</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Transplantation
          </label>
          <select
            value={selectedTx}
            onChange={(e) => setSelectedTx(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Select a transplantation...</option>
            {transplantations.map((tx) => (
              <option key={tx._id} value={tx._id}>
                {tx.transplantNumber} - {tx.recipient?.firstName} {tx.recipient?.lastName}
              </option>
            ))}
          </select>
        </div>

        {selectedTx && (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex gap-1 px-4">
                  <button
                    onClick={() => setActiveTab("scores")}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "scores"
                        ? "border-teal-600 text-teal-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                     Clinical Scores
                  </button>
                  <button
                    onClick={() => setActiveTab("ml-prediction")}
                    className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "ml-prediction"
                        ? "border-purple-600 text-purple-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Brain className="h-4 w-4" />
                    ML Prediction
                  </button>
                </nav>
              </div>
            </div>

            {activeTab === "scores" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* SCORE 1 Card - Urgency Score */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 rounded-xl p-2">
                            <Zap className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-white font-semibold text-lg">Transplant Urgency</h3>
                        </div>
                        <div className="flex gap-2">
                          {score1 && (
                            <button onClick={() => setSelectedScore(score1)} className="p-1.5 bg-white/20 rounded-lg text-white text-xs hover:bg-white/30">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => calculateScore("SCORE_1")} 
                            disabled={calculating === "SCORE_1"} 
                            className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm hover:bg-white/30 disabled:opacity-50 flex items-center gap-2"
                          >
                            {calculating === "SCORE_1" ? <Loader2 className="h-3 w-3 animate-spin" /> : (score1 ? "Recalc" : "Calculate")}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-center mb-4">
                        <CircularProgress value={score1?.value || 0} max={100} color="red" />
                      </div>
                      
                      {/* Priority Badge */}
                      {priority1 && (
                        <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${priority1.bg} mb-3`}>
                          <priority1.icon className={`h-4 w-4 ${priority1.color}`} />
                          <span className={`text-sm font-semibold ${priority1.color}`}>{priority1.label}</span>
                        </div>
                      )}
                      
                      {/* Urgency Level - Single progress bar showing urgency percentage */}
                      {probability1 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Urgency Level:</span>
                            <span className={`font-semibold ${score1?.value >= 70 ? 'text-red-600' : score1?.value >= 40 ? 'text-yellow-600' : 'text-green-600'}`}>
                              {score1?.value || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${score1?.value >= 70 ? 'bg-red-500' : score1?.value >= 40 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                              style={{ width: `${score1?.value || 0}%` }} 
                            />
                          </div>
                          <p className="text-xs text-gray-500 text-center mt-2">{probability1.label}</p>
                        </div>
                      )}
                      
                      {!score1 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">Click Calculate to see score</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SCORE 2 Card - Post-Transplant Risk */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 rounded-xl p-2">
                            <Activity className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-white font-semibold text-lg">Follow-up Risk Score</h3>
                        </div>
                        {score2 && (
                          <button onClick={() => setSelectedScore(score2)} className="p-1.5 bg-white/20 rounded-lg text-white text-xs hover:bg-white/30">
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-purple-100 text-xs mt-1">Calculated per follow-up visit</p>
                    </div>
                    <div className="p-6">
                      <div className="text-center mb-4">
                        <CircularProgress value={score2?.value || 0} max={120} color="purple" />
                      </div>
                      
                      {/* Priority Badge */}
                      {priority2 && (
                        <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${priority2.bg} mb-3`}>
                          <priority2.icon className={`h-4 w-4 ${priority2.color}`} />
                          <span className={`text-sm font-semibold ${priority2.color}`}>{priority2.label}</span>
                        </div>
                      )}
                      
                      {/* Probability Info */}
                      {probability2 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Complication Risk:</span>
                            <span className="font-semibold text-red-600">{probability2.risk}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${probability2.risk}%` }} />
                          </div>
                          <p className="text-xs text-gray-500 text-center mt-2">{probability2.label}</p>
                        </div>
                      )}
                      
                      {!score2 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No SCORE 2 calculated yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SCORE 3 Card - Success Probability */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="bg-white/20 rounded-xl p-2">
                            <Target className="h-6 w-6 text-white" />
                          </div>
                          <h3 className="text-white font-semibold text-lg">Success Probability Score</h3>
                        </div>
                        <div className="flex gap-2">
                          {score3 && (
                            <button onClick={() => setSelectedScore(score3)} className="p-1.5 bg-white/20 rounded-lg text-white text-xs hover:bg-white/30">
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => calculateScore("SCORE_3")} 
                            disabled={calculating === "SCORE_3"} 
                            className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm hover:bg-white/30 disabled:opacity-50 flex items-center gap-2"
                          >
                            {calculating === "SCORE_3" ? <Loader2 className="h-3 w-3 animate-spin" /> : (score3 ? "Recalc" : "Calculate")}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="text-center mb-4">
                        <CircularProgress value={score3?.value || 0} max={100} color="teal" />
                      </div>
                      
                      {/* Priority Badge */}
                      {priority3 && (
                        <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg ${priority3.bg} mb-3`}>
                          <priority3.icon className={`h-4 w-4 ${priority3.color}`} />
                          <span className={`text-sm font-semibold ${priority3.color}`}>{priority3.label}</span>
                        </div>
                      )}
                      
                      {/* Probability Info */}
                      {probability3 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Success Probability:</span>
                            <span className="font-semibold text-green-600">{probability3.success}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: `${probability3.success}%` }} />
                          </div>
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-600">Failure Risk:</span>
                            <span className="font-semibold text-red-600">{probability3.risk}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${probability3.risk}%` }} />
                          </div>
                          <p className="text-xs text-gray-500 text-center mt-2">{probability3.label}</p>
                        </div>
                      )}
                      
                      {!score3 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">Click Calculate to see score</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {scores.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800">Score History</h3>
                      <div className="text-sm text-gray-500">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, scores.length)} of {scores.length} scores
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      {paginatedScores.map((score) => (
                        <div key={score._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              score.score_type === "SCORE_1" ? "bg-red-100 text-red-700" :
                              score.score_type === "SCORE_2" ? "bg-purple-100 text-purple-700" :
                              "bg-teal-100 text-teal-700"
                            }`}>
                              {score.score_type}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(score.calculated_at).toLocaleDateString()}
                            </span>
                            {score.followup_id && (
                              <span className="text-xs text-gray-400">(Follow-up)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-gray-800">{score.value}</span>
                              <span className="text-xs text-gray-400">
                                /{score.score_type === "SCORE_2" ? "120" : "100"}
                              </span>
                            </div>
                            <button
                              onClick={() => setSelectedScore(score)}
                              className="p-1.5 text-gray-400 hover:text-teal-600 transition-colors"
                              title="View Breakdown"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                          Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              currentPage === 1
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </button>
                          <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNum: number
                              if (totalPages <= 5) {
                                pageNum = i + 1
                              } else if (currentPage <= 3) {
                                pageNum = i + 1
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                              } else {
                                pageNum = currentPage - 2 + i
                              }
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => goToPage(pageNum)}
                                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${
                                    currentPage === pageNum
                                      ? "bg-teal-600 text-white"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              )
                            })}
                          </div>
                          <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                              currentPage === totalPages
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "ml-prediction" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {mlPatientData ? (
                  <MLScoreCard 
                    key={selectedTx}
                    patientData={mlPatientData}
                    onPredictionComplete={(prediction) => {
                      console.log("ML Prediction:", prediction)
                    }}
                  />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Loading patient data...</p>
                    <p className="text-xs mt-2">Please select a transplantation first</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {selectedScore && (
          <ScoreBreakdownModal
            score={selectedScore}
            onClose={() => setSelectedScore(null)}
          />
        )}

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}