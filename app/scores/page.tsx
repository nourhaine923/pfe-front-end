// app/scores/page.tsx
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
  Sparkles
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
  const [calculating, setCalculating] = useState(false)
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
      setScores(res.data || [])
    } catch (err) {
      console.error("Error fetching scores:", err)
      setScores([])
    }
  }

  const calculateScore = async (scoreType: string) => {
    if (!selectedTx) return
    
    setCalculating(true)
    try {
      let endpoint = ""
      if (scoreType === "SCORE_1") {
        endpoint = `/scores/calculate-score-1/${selectedTx}`
      } else if (scoreType === "SCORE_3") {
        endpoint = `/scores/calculate-score-3/${selectedTx}`
      }
      
      await api.post(endpoint)
      showToast(`${scoreType} calculated successfully!`, "success")
      await fetchScores()
    } catch (err: any) {
      console.error("Error calculating score:", err)
      showToast(err.response?.data?.detail || "Failed to calculate score", "error")
    } finally {
      setCalculating(false)
    }
  }

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const score1 = scores.find(s => s.score_type === "SCORE_1")
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* SCORE 1 Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-xl p-2">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-lg">Transplant Urgency Score</h3>
                  </div>
                  {!score1 && (
                    <button
                      onClick={() => calculateScore("SCORE_1")}
                      disabled={calculating}
                      className="px-3 py-1 bg-white/20 rounded-lg text-white text-sm hover:bg-white/30"
                    >
                      {calculating ? "..." : "Calculate"}
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6 text-center">
                <CircularProgress value={score1?.value || 0} max={100} color="orange" />
                <div className="mt-4">
                  {score1?.value >= 70 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">Excellent Candidate</span>
                    </div>
                  )}
                  {score1?.value >= 40 && score1?.value < 70 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100">
                      <Activity className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-600">Moderate Risk</span>
                    </div>
                  )}
                  {score1?.value < 40 && score1?.value > 0 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-600">High Risk</span>
                    </div>
                  )}
                  {!score1 && (
                    <p className="text-sm text-gray-500">Click Calculate to see score</p>
                  )}
                </div>
              </div>
            </div>

            {/* SCORE 3 Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-xl p-2">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-white font-semibold text-lg">Success Probability</h3>
                  </div>
                  {!score3 && (
                    <button
                      onClick={() => calculateScore("SCORE_3")}
                      disabled={calculating}
                      className="px-3 py-1 bg-white/20 rounded-lg text-white text-sm hover:bg-white/30"
                    >
                      {calculating ? "..." : "Calculate"}
                    </button>
                  )}
                </div>
              </div>
              <div className="p-6 text-center">
                <CircularProgress value={score3?.value || 0} max={100} color="teal" />
                <div className="mt-4">
                  {score3?.value >= 70 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-600">High Likelihood</span>
                    </div>
                  )}
                  {score3?.value >= 50 && score3?.value < 70 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100">
                      <Activity className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-600">Moderate Likelihood</span>
                    </div>
                  )}
                  {score3?.value < 50 && score3?.value > 0 && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-600">Low Likelihood</span>
                    </div>
                  )}
                  {!score3 && (
                    <p className="text-sm text-gray-500">Click Calculate to see score</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score History */}
        {selectedTx && scores.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Score History</h3>
            <div className="space-y-3">
              {scores.sort((a, b) => new Date(b.calculated_at).getTime() - new Date(a.calculated_at).getTime()).map((score) => (
                <div key={score._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-gray-800">{score.value}</span>
                    <span className="text-xs text-gray-400">/100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}