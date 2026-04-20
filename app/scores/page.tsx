"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/features/auth/context"
import { useRouter } from "next/navigation"
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
  BarChart3
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
    orange: "text-orange-600 stroke-orange-500",
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
        return { title: "SCORE 1 - Pre-transplant Risk", icon: Zap, color: "orange", maxValue: 100 }
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
        {/* Header */}
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

        {/* Content */}
        <div className="p-6">
          {/* Overall Score Summary */}
          <div className="text-center mb-6 p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl  ">
            <div className="flex items-center justify-center gap-6 ">
              <div className="relative">
                <CircularProgress 
                  value={score.value} 
                  max={info.maxValue} 
                  size={100} 
                  color={info.color} 
                />
              </div>
              <div className="text-left">
                <p className="text-sm text-gray-500">Total Score</p>
                <p className="text-3xl font-bold text-gray-800">{score.value}</p>
                <p className="text-xs text-gray-400">out of {info.maxValue}</p>
                <div className="mt-2 w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-${info.color}-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Calculated on {new Date(score.calculated_at).toLocaleString()}
            </p>
          </div>

          {/* Score Breakdown Table */}
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

interface Transplantation {
  _id: string
  transplantNumber: string
  recipient?: { firstName: string; lastName: string }
  transplantDate: string
}

export default function ScoresPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [transplantations, setTransplantations] = useState<Transplantation[]>([])
  const [selectedTx, setSelectedTx] = useState<string>("")
  const [scores, setScores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState<string | null>(null)
  const [selectedScore, setSelectedScore] = useState<any>(null)
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null)

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
    }
  }, [selectedTx])

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

  const fetchScores = async () => {
    if (!selectedTx) return
    
    try {
      const res = await api.get(`/scores/history/${selectedTx}`)
      const scoresData = res.data || []
      // Remove duplicates by _id
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
        // SCORE_2 is calculated per follow-up visit, not here
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

  const score1 = scores.find(s => s.score_type === "SCORE_1")
  const score2 = scores.find(s => s.score_type === "SCORE_2")
  const score3 = scores.find(s => s.score_type === "SCORE_3")

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
        
        {/* Header */}
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

        {/* Transplantation Selector */}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              
              {/* SCORE 1 Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 rounded-xl p-2">
                        <Zap className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg">Transplant Urgency</h3>
                    </div>
                    <div className="flex gap-2">
                      {score1 && (
                        <button
                          onClick={() => setSelectedScore(score1)}
                          className="p-1.5 bg-white/20 rounded-lg text-white text-xs hover:bg-white/30 transition-colors"
                          title="View Breakdown"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => calculateScore("SCORE_1")}
                        disabled={calculating === "SCORE_1"}
                        className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm hover:bg-white/30 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {calculating === "SCORE_1" ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            ...
                          </>
                        ) : (
                          score1 ? "Recalc" : "Calculate"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <CircularProgress value={score1?.value || 0} max={100} color="orange" />
                  <div className="mt-4">
                    {score1?.value >= 80 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">Low Risk</span>
                      </div>
                    )}
                    {score1?.value >= 60 && score1?.value < 80 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100">
                        <Activity className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-yellow-600">Medium Risk</span>
                      </div>
                    )}
                    {score1?.value >= 40 && score1?.value < 60 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span className="text-sm font-semibold text-orange-600">High Risk</span>
                      </div>
                    )}
                    {score1?.value < 40 && score1?.value > 0 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">Very High Risk</span>
                      </div>
                    )}
                    {!score1 && (
                      <p className="text-sm text-gray-500">Click Calculate to see score</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SCORE 2 Card - No Recalc button */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 rounded-xl p-2">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg">Post-Transplant Risk</h3>
                    </div>
                    <div className="flex gap-2">
                      {score2 && (
                        <button
                          onClick={() => setSelectedScore(score2)}
                          className="p-1.5 bg-white/20 rounded-lg text-white text-xs hover:bg-white/30 transition-colors"
                          title="View Breakdown"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-purple-100 text-xs mt-1">Calculated per follow-up visit</p>
                </div>
                <div className="p-6 text-center">
                  <CircularProgress value={score2?.value || 0} max={120} color="purple" />
                  <div className="mt-4">
                    {score2?.value >= 100 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">Excellent</span>
                      </div>
                    )}
                    {score2?.value >= 60 && score2?.value < 100 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100">
                        <Shield className="h-4 w-4 text-teal-600" />
                        <span className="text-sm font-semibold text-teal-600">Good</span>
                      </div>
                    )}
                    {score2?.value >= 20 && score2?.value < 60 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100">
                        <Activity className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-yellow-600">Moderate</span>
                      </div>
                    )}
                    {score2?.value < 20 && score2?.value > 0 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">Poor</span>
                      </div>
                    )}
                    {!score2 && (
                      <p className="text-sm text-gray-500">No SCORE 2 calculated yet</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SCORE 3 Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all hover:shadow-xl">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 rounded-xl p-2">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-white font-semibold text-lg">Success Probability</h3>
                    </div>
                    <div className="flex gap-2">
                      {score3 && (
                        <button
                          onClick={() => setSelectedScore(score3)}
                          className="p-1.5 bg-white/20 rounded-lg text-white text-xs hover:bg-white/30 transition-colors"
                          title="View Breakdown"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => calculateScore("SCORE_3")}
                        disabled={calculating === "SCORE_3"}
                        className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm hover:bg-white/30 transition-all disabled:opacity-50 flex items-center gap-2"
                      >
                        {calculating === "SCORE_3" ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            ...
                          </>
                        ) : (
                          score3 ? "Recalc" : "Calculate"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-6 text-center">
                  <CircularProgress value={score3?.value || 0} max={100} color="teal" />
                  <div className="mt-4">
                    {score3?.value >= 70 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-semibold text-green-600">High</span>
                      </div>
                    )}
                    {score3?.value >= 50 && score3?.value < 70 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100">
                        <Activity className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-semibold text-yellow-600">Moderate</span>
                      </div>
                    )}
                    {score3?.value < 50 && score3?.value > 0 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-semibold text-red-600">Low</span>
                      </div>
                    )}
                    {!score3 && (
                      <p className="text-sm text-gray-500">Click Calculate to see score</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Score History */}
            {scores.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Score History</h3>
                <div className="space-y-3">
                  {scores
                    .sort((a, b) => new Date(b.calculated_at).getTime() - new Date(a.calculated_at).getTime())
                    .map((score) => (
                      <div key={score._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            score.score_type === "SCORE_1" ? "bg-orange-100 text-orange-700" :
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
              </div>
            )}
          </>
        )}

        {/* Score Breakdown Modal */}
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