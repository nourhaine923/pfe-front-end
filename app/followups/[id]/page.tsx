"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  Calendar, 
  User, 
  Activity, 
  Heart,
  AlertCircle,
  ArrowLeft,
  Edit2,
  Trash2,
  Droplet,
  Dna,
  Pill,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Shield,
  FlaskConical,
  Hospital,
  Pencil,
  ListTodo,
  ChevronRight,
  TrendingUp, 
} from "lucide-react"

import api from "@/services/api"
import { FollowUp, FullFollowUpData } from "@/features/followup/types"
import Toast from "@/components/ui/Toast"
import DeleteFollowUpModal from "@/components/modals/DeleteFollowUpModal"
import UpdateFollowUpModal from "@/components/modals/UpdateFollowUpModal"
import CreateFollowUpModal from "@/components/modals/CreateFollowUpModal"
import CreateAdverseEventModal from "@/components/modals/CreateAdverseEventModal"
import { formatDate, formatDateTime } from "@/utils/exportUtils"
import ExportButton from "@/components/ui/ExportButton"

// Update Modals
import UpdateVitalSignsModal from "@/components/modals/UpdateVitalSignsModal"
import UpdateBiologicalModal from "@/components/modals/UpdateBiologicalModal"
import UpdateImmunologicalModal from "@/components/modals/UpdateImmunologicalModal"
import UpdateRejectionModal from "@/components/modals/UpdateRejectionModal"
import UpdateAdherenceModal from "@/components/modals/UpdateAdherenceModal"
import UpdateTreatmentModal from "@/components/modals/UpdateTreatmentModal"
import UpdateImmunosuppressionModal from "@/components/modals/UpdateImmunosuppressionModal"

// ============================================
// SCORE 2 COMPONENT - Follow-up Score with Messages
// ============================================
function ScoreCard2({ followUpId, transplantationId }: { followUpId: string; transplantationId: string }) {
  const [score2, setScore2] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)
  const [showToast, setShowToast] = useState<{ message: string; type?: string } | null>(null)

  useEffect(() => {
    if (followUpId) {
      fetchScore2()
    }
  }, [followUpId])

  const fetchScore2 = async () => {
    if (!followUpId) return
    setLoading(true)
    try {
      const res = await api.get(`/scores/history/${transplantationId}`)
      const scoresData = res.data || []
      const existingScore2 = scoresData.find((s: any) => s.score_type === "SCORE_2" && s.followup_id === followUpId)
      setScore2(existingScore2 || null)
    } catch (err) {
      console.error("Error fetching SCORE 2:", err)
    } finally {
      setLoading(false)
    }
  }

  const calculateScore2 = async () => {
    if (!followUpId) return
    
    setCalculating(true)
    try {
      const response = await api.post(`/scores/calculate-score-2/${followUpId}`)
      console.log("SCORE 2 response:", response.data)
      
      setScore2({
        score_type: "SCORE_2",
        value: response.data?.value || 0,
        calculated_at: new Date().toISOString(),
        details: response.data?.details || []
      })
      
      showLocalToast("SCORE 2 calculated successfully!", "success")
    } catch (err: any) {
      console.error("Error calculating SCORE 2:", err)
      showLocalToast(err.response?.data?.detail || "Failed to calculate SCORE 2", "error")
    } finally {
      setCalculating(false)
    }
  }

  const showLocalToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setShowToast({ message, type })
    setTimeout(() => setShowToast(null), 3000)
  }

  const scoreValue = score2?.value || 0

  const getScoreLevel = (score: number) => {
    if (score >= 100) return { label: "Excellent", color: "text-green-600", bg: "bg-green-100", icon: CheckCircle, description: "Optimal follow-up status" }
    if (score >= 60) return { label: "Good", color: "text-teal-600", bg: "bg-teal-100", icon: Shield, description: "Routine monitoring sufficient" }
    if (score >= 20) return { label: "Moderate Concern", color: "text-yellow-600", bg: "bg-yellow-100", icon: Activity, description: "Increase monitoring frequency" }
    return { label: "Poor", color: "text-red-600", bg: "bg-red-100", icon: AlertCircle, description: "Immediate intervention needed" }
  }

  // SCORE 2 Message Functions
  const getScore2Message = (score: number) => {
    if (score >= 100) {
      return {
        title: "🌟 Excellent Follow-up Status",
        message: "Patient is in optimal condition with excellent graft function.",
        recommendation: "• Continue current immunosuppression regimen\n• Routine follow-up every 6 months\n• Standard monitoring protocol\n• Encourage healthy lifestyle",
        color: "text-green-700",
        bg: "bg-green-50",
        border: "border-green-200"
      }
    }
    if (score >= 60) {
      return {
        title: "✅ Good Follow-up Status",
        message: "Patient has good graft function with stable clinical parameters.",
        recommendation: "• Continue current management\n• Routine follow-up every 3 months\n• Monitor creatinine and eGFR trends\n• Review medications at each visit",
        color: "text-teal-700",
        bg: "bg-teal-50",
        border: "border-teal-200"
      }
    }
    if (score >= 20) {
      return {
        title: "⚠️ Moderate Concern - Increase Monitoring",
        message: "Patient shows some concerning trends requiring closer follow-up.",
        recommendation: "• Increase follow-up frequency to monthly\n• Consider adjusting immunosuppression\n• Monitor for rejection signs\n• Review medication adherence\n• Schedule protocol biopsy if indicated",
        color: "text-yellow-700",
        bg: "bg-yellow-50",
        border: "border-yellow-200"
      }
    }
    return {
      title: "🚨 Poor Status - Immediate Intervention Needed",
      message: "Patient has significant abnormalities requiring urgent evaluation.",
      recommendation: "• Immediate nephrology consultation\n• Consider hospital admission\n• Urgent labs and imaging\n• Evaluate for rejection/infection\n• Adjust immunosuppression urgently",
      color: "text-red-700",
      bg: "bg-red-50",
      border: "border-red-200"
    }
  }

  const level = getScoreLevel(scoreValue)
  const scoreMessage = getScore2Message(scoreValue)

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Follow-up Risk Score</p>
              <p className="text-xs text-gray-400">Loading...</p>
            </div>
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-gradient-to-r from-purple-50 to-white rounded-xl shadow-sm border border-purple-100 overflow-hidden mb-6">
        <div className="px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg p-1.5">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Follow-up Risk Score</h3>
                <p className="text-purple-100 text-xs">SCORE 2 - Follow-up Assessment</p>
              </div>
            </div>
            {!score2 ? (
              <button
                onClick={calculateScore2}
                disabled={calculating}
                className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium hover:bg-white/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {calculating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Activity className="h-3 w-3" />
                    Calculate Score
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={calculateScore2}
                disabled={calculating}
                className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-xs font-medium hover:bg-white/30 transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {calculating ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Recalculating...
                  </>
                ) : (
                  <>
                    <Activity className="h-3 w-3" />
                    Recalculate
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {score2 ? (
          <div className="p-5">
            <div className="flex items-center gap-6">
              {/* Score Circle */}
              <div className="relative">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="42" fill="none" stroke="#e9d5ff" strokeWidth="6" />
                  <circle 
                    cx="48" cy="48" r="42" fill="none" stroke="#8b5cf6" strokeWidth="6" 
                    strokeDasharray="263.89" 
                    strokeDashoffset={263.89 - (scoreValue / 100) * 263.89}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-purple-700">{scoreValue}</span>
                  <span className="text-[10px] text-gray-400">/100</span>
                </div>
              </div>
              
              {/* Score Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${level.bg}`}>
                    <level.icon className={`h-3.5 w-3.5 ${level.color}`} />
                    <span className={`text-xs font-semibold ${level.color}`}>{level.label}</span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(score2.calculated_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{level.description}</p>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className={`mt-4 p-3 rounded-lg ${scoreMessage.bg} border ${scoreMessage.border}`}>
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {scoreValue >= 60 ? (
                    <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${scoreMessage.color}`}>{scoreMessage.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{scoreMessage.message}</p>
                  <div className="text-xs text-gray-600 mt-2 whitespace-pre-line">
                    <span className="font-medium">Recommendations:</span>
                    <br />
                    {scoreMessage.recommendation}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mini breakdown bars */}
            {score2.details && score2.details.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2">Key Factors:</p>
                <div className="flex flex-wrap gap-2">
                  {score2.details.slice(0, 3).map((detail: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className={`text-xs ${detail.impact >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {detail.impact > 0 ? "+" : ""}{detail.impact}
                      </span>
                      <span className="text-xs text-gray-500">
                        {detail.attribute.replace(/_/g, " ").substring(0, 15)}
                      </span>
                    </div>
                  ))}
                  {score2.details.length > 3 && (
                    <span className="text-xs text-gray-400">+{score2.details.length - 3} more</span>
                  )}
                </div>
              </div>
            )}
            
            {/* View Details Button */}
            <button
              onClick={() => {
                const modal = document.createElement('div')
                modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
                modal.innerHTML = `
                  <div class="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
                    <div class="sticky top-0 bg-white px-5 py-4 border-b flex justify-between items-center">
                      <h3 class="text-lg font-bold text-gray-800">SCORE 2 Breakdown</h3>
                      <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">✕</button>
                    </div>
                    <div class="p-5 space-y-3">
                      <div class="text-center mb-4">
                        <span class="text-3xl font-bold text-purple-600">${scoreValue}</span>
                        <span class="text-gray-400"> / 100</span>
                        <div class="mt-2 inline-flex px-3 py-1 rounded-full ${level.bg}">
                          <span class="text-sm font-semibold ${level.color}">${level.label}</span>
                        </div>
                      </div>
                      <div class="border-t pt-3">
                        ${score2.details.map((d: any) => `
                          <div class="flex justify-between items-center py-2 border-b border-gray-100">
                            <div>
                              <p class="text-sm font-medium text-gray-700">${d.attribute.replace(/_/g, " ").toUpperCase()}</p>
                              <p class="text-xs text-gray-400">Value: ${d.value !== undefined ? d.value : 'N/A'}</p>
                            </div>
                            <span class="text-sm font-bold ${d.impact >= 0 ? 'text-green-600' : 'text-red-600'}">
                              ${d.impact > 0 ? '+' : ''}${d.impact}
                            </span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                `
                document.body.appendChild(modal)
              }}
              className="mt-3 w-full text-center text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              View Full Breakdown →
            </button>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="bg-purple-50 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
            <p className="text-sm text-gray-500 mb-2">No risk score calculated yet</p>
            <p className="text-xs text-gray-400">Click "Calculate Score" to assess Follow-up Risk Score</p>
          </div>
        )}
      </div>
      {showToast && <Toast message={showToast.message} type={showToast.type as any} onClose={() => setShowToast(null)} />}
    </>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
export default function FollowUpDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  
  const [currentFollowUpId, setCurrentFollowUpId] = useState<string>(id as string)
  const [followUp, setFollowUp] = useState<FollowUp | null>(null)
  const [allFollowUps, setAllFollowUps] = useState<FollowUp[]>([])
  const [fullData, setFullData] = useState<FullFollowUpData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("vital-signs")
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null)
  const [transplantationId, setTransplantationId] = useState<string | null>(null)
  const [selectedTreatmentId, setSelectedTreatmentId] = useState<string | null>(null)
  
  // Modal states
  const [adverseEventOpen, setAdverseEventOpen] = useState(false)
  const [createFollowUpOpen, setCreateFollowUpOpen] = useState(false)
  
  // Update Modal states
  const [vitalSignsUpdateOpen, setVitalSignsUpdateOpen] = useState(false)
  const [biologicalUpdateOpen, setBiologicalUpdateOpen] = useState(false)
  const [immunologicalUpdateOpen, setImmunologicalUpdateOpen] = useState(false)
  const [rejectionUpdateOpen, setRejectionUpdateOpen] = useState(false)
  const [adherenceUpdateOpen, setAdherenceUpdateOpen] = useState(false)
  const [treatmentUpdateOpen, setTreatmentUpdateOpen] = useState(false)
  const [immunosuppressionUpdateOpen, setImmunosuppressionUpdateOpen] = useState(false)
  
  // Delete/Update modal states for follow-up
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)

  const fetchAllFollowUps = async (transplantationId: string) => {
    try {
      const res = await api.get(`/followups/by-transplantation/${transplantationId}`)
      setAllFollowUps(res.data || [])
    } catch (err) {
      console.error("Error fetching follow-ups list:", err)
    }
  }

  const fetchFollowUpData = async (followUpId: string) => {
    try {
      setLoading(true)
      
      const followUpRes = await api.get(`/followups/${followUpId}`)
      setFollowUp(followUpRes.data)
      
      const txId = followUpRes.data.transplantation_id
      setTransplantationId(txId)
      
      await fetchAllFollowUps(txId)
      
      const [
        vitalSignsRes,
        biologicalRes,
        immunologicalRes,
        rejectionRes,
        adverseEventsRes,
        adherenceRes,
        treatmentsRes,
        immunosuppressionRes
      ] = await Promise.all([
        api.get(`/vitals/by-followup/${followUpId}`).catch(() => ({ data: [] })),
        api.get(`/biological/by-followup/${followUpId}`).catch(() => ({ data: [] })),
        api.get(`/immunological/by-followup/${followUpId}`).catch(() => ({ data: [] })),
        api.get(`/rejections/by-followup/${followUpId}`).catch(() => ({ data: [] })),
        api.get(`/adverse-events/by-followup/${followUpId}`).catch(() => ({ data: [] })),
        api.get(`/adherence/by-followup/${followUpId}`).catch(() => ({ data: [] })),
        api.get(`/treatments/by-followup/${followUpId}`).catch(() => ({ data: [] })),
        api.get(`/immunosuppressions/by-followup/${followUpId}`).catch(() => ({ data: null }))
      ])
      
      setFullData({
        ...followUpRes.data,
        vitalSigns: vitalSignsRes.data,
        biologicalMeasurements: biologicalRes.data,
        immunologicalMarkers: immunologicalRes.data,
        rejectionEpisodes: rejectionRes.data,
        adverseEvents: adverseEventsRes.data,
        adherenceAssessments: adherenceRes.data,
        therapeuticTreatments: treatmentsRes.data,
        immunosuppressionRegimen: immunosuppressionRes.data
      })
      
    } catch (err) {
      console.error("Error fetching follow-up data:", err)
      showToast("Failed to load follow-up details", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentFollowUpId) {
      fetchFollowUpData(currentFollowUpId)
    }
  }, [currentFollowUpId])

  const handleFollowUpSelect = (followUpId: string) => {
    setCurrentFollowUpId(followUpId)
    router.push(`/followups/${followUpId}`, { scroll: false })
  }

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      "Mild": "bg-yellow-100 text-yellow-800",
      "Moderate": "bg-orange-100 text-orange-800",
      "Severe": "bg-red-100 text-red-800",
      "Life-threatening": "bg-purple-100 text-purple-800"
    }
    return colors[severity] || "bg-gray-100 text-gray-800"
  }

  const tabs = [
    { id: "vital-signs", label: "Vital Signs", icon: Heart },
    { id: "biological", label: "Biology", icon: Droplet },
    { id: "immunological", label: "Immunology", icon: Dna },
    { id: "rejection", label: "Rejection", icon: AlertTriangle },
    { id: "adverse-events", label: "Adverse Events", icon: AlertCircle },
    { id: "adherence", label: "Adherence", icon: CheckCircle },
    { id: "treatments", label: "Treatments", icon: Pill },
    { id: "immunosuppression", label: "Immunosuppression", icon: Shield }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-12 w-12 text-teal-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!followUp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Follow-up Not Found</h2>
          <button onClick={() => router.push("/followups")} className="px-4 py-2 bg-teal-600 text-white rounded-lg">
            Back to Follow-ups
          </button>
        </div>
      </div>
    )
  }

  const recipientName = followUp.transplantation?.recipient 
    ? `${followUp.transplantation.recipient.firstName} ${followUp.transplantation.recipient.lastName}`
    : "Unknown Patient"
  const transplantNumber = followUp.transplantation?.transplantNumber || "Unknown"

  const vitalSignsData = fullData?.vitalSigns?.[0] || null
  const biologicalData = fullData?.biologicalMeasurements?.[0] || null
  const immunologicalData = fullData?.immunologicalMarkers?.[0] || null
  const rejectionData = fullData?.rejectionEpisodes?.[0] || null
  const adherenceData = fullData?.adherenceAssessments?.[0] || null
  const treatmentData = fullData?.therapeuticTreatments?.[0] || null
  const immunosuppressionData = fullData?.immunosuppressionRegimen || null

  const sortedFollowUps = [...allFollowUps].sort((a, b) => 
    new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/followups")}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
                Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Follow-up - {formatDate(followUp.visitDate)}
                </h1>
                <p className="text-sm text-gray-500">
                  Day {followUp.postTransplantDay} | Month {followUp.postTransplantMonth}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <ExportButton
                type="followup"
                id={currentFollowUpId}
                filename={`Follow-up_${formatDate(followUp?.visitDate)}`}
                buttonText="Export PDF"
                variant="outline"
                size="md"
                showToast={showToast}
              />
              <button onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-red-700 bg-red-50 rounded-lg hover:bg-red-100">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout - LEFT SIDEBAR + RIGHT CONTENT */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* LEFT SIDEBAR - List of all follow-ups for this transplantation */}
          <div className="lg:w-80 flex-shrink-0 text-gray-50">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-8">
              <div className="px-4 py-3 border-b bg-white">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-5 w-5 text-teal-600" />
                  <h3 className="font-semibold text-teal-800">Follow-up Visits</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">Select a date to view details</p>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {sortedFollowUps.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <p className="text-sm">No follow-ups found</p>
                  </div>
                ) : (
                  sortedFollowUps.map((f) => (
                    <div
                      key={f._id}
                      onClick={() => handleFollowUpSelect(f._id)}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-teal-50 ${
                        currentFollowUpId === f._id ? "border-l-4 border-l-teal-600" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{formatDate(f.visitDate)}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              f.clinicalStatus === "Stable" ? "bg-green-100 text-green-700" :
                              f.clinicalStatus === "Critical" ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                              {f.clinicalStatus}
                            </span>
                            <span className="text-xs text-gray-500">Day {f.postTransplantDay}</span>
                          </div>
                        </div>
                        <ChevronRight className={`h-4 w-4 ${currentFollowUpId === f._id ? "text-teal-600" : "text-gray-400"}`} />
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-3 border-t bg-gray-50">
                <button
                  onClick={() => setCreateFollowUpOpen(true)}
                  className="w-full py-2 text-sm text-teal-600 font-medium hover:text-teal-700 flex items-center justify-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  New Follow-up
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT CONTENT - Patient Info + Tabs */}
          <div className="flex-1 min-w-0">
            
            {/* Patient Info Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="bg-teal-100 rounded-full p-3">
                    <User className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-semibold text-gray-900">{recipientName}</h2>
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        followUp.clinicalStatus === "Stable" ? "bg-green-100 text-green-700" :
                        followUp.clinicalStatus === "Critical" ? "bg-red-100 text-red-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {followUp.clinicalStatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 mt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Hospital className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Transplantation:</span>
                        <span className="text-gray-900">{transplantNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Transplant Date:</span>
                        <span className="text-gray-900">{formatDate(followUp.transplantation?.transplantDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Activity className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Visit Type:</span>
                        <span className="text-gray-900">{followUp.visitType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">Post-Transplant:</span>
                        <span className="text-gray-900">Day {followUp.postTransplantDay} (Month {followUp.postTransplantMonth})</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => setUpdateOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-green-700 bg-green-50 rounded-lg hover:bg-green-100">
                  <Edit2 className="h-4 w-4" /> Edit
                </button>
              </div>
            </div>

            {/* SCORE 2 CARD */}
            <ScoreCard2 followUpId={currentFollowUpId} transplantationId={transplantationId || followUp?.transplantation_id} />

            {/* Print Content Container for Export */}
            <div id="followup-print-content">
              
              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 px-4 overflow-x-auto">
                  <nav className="flex gap-1">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === tab.id
                            ? "border-teal-600 text-teal-600"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  
                  {/* VITAL SIGNS TAB */}
                  {activeTab === "vital-signs" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Vital Signs</h2>
                        <button onClick={() => setVitalSignsUpdateOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50">
                          <Pencil className="h-4 w-4" /> {vitalSignsData ? "Update" : "Add"}
                        </button>
                      </div>
                      {vitalSignsData ? (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div><p className="text-xs text-gray-500">Date/Time</p><p className="font-medium">{formatDateTime(vitalSignsData.dateTime)}</p></div>
                            <div><p className="text-xs text-gray-500">Heart Rate</p><p className="font-medium">{vitalSignsData.heartRate} bpm</p></div>
                            <div><p className="text-xs text-gray-500">Temperature</p><p className="font-medium">{vitalSignsData.temperature} °C</p></div>
                            <div><p className="text-xs text-gray-500">SpO2</p><p className="font-medium">{vitalSignsData.oxygenSaturation}%</p></div>
                            <div><p className="text-xs text-gray-500">Urine Output</p><p className="font-medium">{vitalSignsData.urineOutputMl} ml</p></div>
                            <div><p className="text-xs text-gray-500">Mental Status</p><p className="font-medium">{vitalSignsData.mentalStatus}</p></div>
                            <div><p className="text-xs text-gray-500">Blood Pressure</p><p className="font-medium">{vitalSignsData.bloodPressure} mmHg</p></div>
                            {vitalSignsData.graftUltraSound && <div><p className="text-xs text-gray-500">Graft Ultrasound</p><p className="font-medium">{vitalSignsData.graftUltraSound}</p></div>}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <Heart className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No vital signs recorded yet</p>
                          <button onClick={() => setVitalSignsUpdateOpen(true)} className="mt-2 text-teal-600 text-sm hover:underline">Click here to add vital signs</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* BIOLOGICAL TAB */}
                  {activeTab === "biological" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Biological Measurements</h2>
                        <button onClick={() => setBiologicalUpdateOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50">
                          <Pencil className="h-4 w-4" /> {biologicalData ? "Update" : "Add"}
                        </button>
                      </div>
                      {biologicalData ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr><th className="px-4 py-3 text-left text-xs font-medium">Date</th><th className="px-4 py-3 text-left text-xs font-medium">Creatinine</th><th className="px-4 py-3 text-left text-xs font-medium">Urea</th><th className="px-4 py-3 text-left text-xs font-medium">eGFR</th><th className="px-4 py-3 text-left text-xs font-medium">Hb</th><th className="px-4 py-3 text-left text-xs font-medium">CRP</th><th className="px-4 py-3 text-left text-xs font-medium">TSH</th><th className="px-4 py-3 text-left text-xs font-medium">Proteinuria</th></tr>
                            </thead>
                            <tbody>
                              <tr className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">{formatDate(biologicalData.date)}</td>
                                <td className="px-4 py-3 text-sm">{biologicalData.creatinine || "—"}</td>
                                <td className="px-4 py-3 text-sm">{biologicalData.urea || "—"}</td>
                                <td className="px-4 py-3 text-sm">{biologicalData.gfr || "—"}</td>
                                <td className="px-4 py-3 text-sm">{biologicalData.hemoglobin || "—"}</td>
                                <td className="px-4 py-3 text-sm">{biologicalData.crp || "—"}</td>
                                <td className="px-4 py-3 text-sm">{biologicalData.tsh || "—"}</td>
                                <td className="px-4 py-3 text-sm">{biologicalData.proteinuria || "—"}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <FlaskConical className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No biological measurements recorded yet</p>
                          <button onClick={() => setBiologicalUpdateOpen(true)} className="mt-2 text-teal-600 text-sm hover:underline">Click here to add measurements</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* IMMUNOLOGICAL TAB */}
                  {activeTab === "immunological" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Immunological Markers</h2>
                        <button onClick={() => setImmunologicalUpdateOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50">
                          <Pencil className="h-4 w-4" /> {immunologicalData ? "Update" : "Add"}
                        </button>
                      </div>
                      {immunologicalData ? (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between"><p className="font-medium">{immunologicalData.markerType}</p><p className="text-xs text-gray-500">{immunologicalData.timePoint}</p></div>
                          <p className="text-xl font-bold text-teal-600 mt-2">{immunologicalData.value} {immunologicalData.unit}</p>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <Dna className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No immunological markers recorded yet</p>
                          <button onClick={() => setImmunologicalUpdateOpen(true)} className="mt-2 text-teal-600 text-sm hover:underline">Click here to add markers</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* REJECTION TAB */}
                  {activeTab === "rejection" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Rejection Episode</h2>
                        <button onClick={() => setRejectionUpdateOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50">
                          <Pencil className="h-4 w-4" /> {rejectionData ? "Update" : "Add"}
                        </button>
                      </div>
                      {rejectionData ? (
                        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                          <div className="flex justify-between"><p className="font-medium text-red-800">{rejectionData.type} - Grade {rejectionData.grade}</p><span className={`px-2 py-1 text-xs rounded-full ${rejectionData.resolved ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{rejectionData.resolved ? "Resolved" : "Active"}</span></div>
                          <p className="text-sm text-red-600 mt-1">{formatDate(rejectionData.date)}</p><p className="text-sm mt-2">Treatment: {rejectionData.treatment}</p>
                          {rejectionData.biopsyProven && <div className="mt-2 text-sm text-red-700">✓ Biopsy Proven</div>}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No rejection episode recorded yet</p>
                          <button onClick={() => setRejectionUpdateOpen(true)} className="mt-2 text-teal-600 text-sm hover:underline">Click here to add rejection episode</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ADVERSE EVENTS TAB */}
                  {activeTab === "adverse-events" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Adverse Events</h2>
                      </div>
                      
                      {fullData?.therapeuticTreatments && fullData.therapeuticTreatments.length > 0 ? (
                        <div className="space-y-6">
                          {fullData.therapeuticTreatments.map((treatment) => (
                            <div key={treatment._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                              {/* Treatment Header */}
                              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                                <div>
                                  <h3 className="font-semibold text-gray-800">{treatment.drugName}</h3>
                                  <p className="text-xs text-gray-500">
                                    {treatment.dosage} {treatment.dosageUnit} - {treatment.route}
                                    {treatment.startDate && ` | Started: ${formatDate(treatment.startDate)}`}
                                    {treatment.endDate && ` | Ended: ${formatDate(treatment.endDate)}`}
                                  </p>
                                </div>
                                <button 
                                  onClick={() => {
                                    // Store treatment ID to associate adverse event with this treatment
                                    setSelectedTreatmentId(treatment._id)
                                    setAdverseEventOpen(true)
                                  }} 
                                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50"
                                >
                                  <Plus className="h-4 w-4" /> Add Adverse Event
                                </button>
                              </div>
                              
                              {/* Adverse Events List for this Treatment */}
                              <div className="p-4">
                                {fullData.adverseEvents && fullData.adverseEvents.filter(
                                  (event) => event.treatment_id === treatment._id
                                ).length > 0 ? (
                                  <div className="space-y-3">
                                    {fullData.adverseEvents
                                      .filter((event) => event.treatment_id === treatment._id)
                                      .map((event, idx) => (
                                        <div key={idx} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="font-medium text-gray-800">{event.eventType}</p>
                                              <p className="text-sm text-gray-600 mt-1">
                                                Date: {formatDate(event.date)}
                                              </p>
                                              {event.comment && (
                                                <p className="text-sm text-gray-500 mt-2 italic">
                                                  "{event.comment}"
                                                </p>
                                              )}
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(event.severity)}`}>
                                              {event.severity}
                                            </span>
                                          </div>
                                          {event.eventType === "Infection" && (
                                            <div className="mt-2 pt-2 border-t border-orange-200 text-sm">
                                              {event.infectionType && (
                                                <p className="text-gray-600">Type: {event.infectionType}</p>
                                              )}
                                              {event.infectionSeverity && (
                                                <p className="text-gray-600">Infection Severity: {event.infectionSeverity}</p>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 text-gray-400 text-sm">
                                    No adverse events recorded for this treatment
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No treatments recorded yet</p>
                          <p className="text-xs mt-1">Add a therapeutic treatment first to record adverse events</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ADHERENCE TAB */}
                  {activeTab === "adherence" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Therapeutic Adherence</h2>
                        <button onClick={() => setAdherenceUpdateOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50">
                          <Pencil className="h-4 w-4" /> {adherenceData ? "Update" : "Add"}
                        </button>
                      </div>
                      {adherenceData ? (
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div><p className="text-sm text-gray-600">{formatDate(adherenceData.date)}</p><p className="text-sm">Method: {adherenceData.method}</p></div>
                            <div className="text-center"><p className="text-3xl font-bold text-green-600">{adherenceData.adherencePercent}%</p><p className="text-xs text-gray-500">Adherence</p></div>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${adherenceData.adherencePercent >= 95 ? "bg-green-600" : adherenceData.adherencePercent >= 80 ? "bg-yellow-600" : "bg-red-600"}`} style={{ width: `${adherenceData.adherencePercent}%` }} /></div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No adherence assessment recorded yet</p>
                          <button onClick={() => setAdherenceUpdateOpen(true)} className="mt-2 text-teal-600 text-sm hover:underline">Click here to add assessment</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TREATMENTS TAB */}
                  {activeTab === "treatments" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Therapeutic Treatments</h2>
                        <button onClick={() => setTreatmentUpdateOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50">
                          <Pencil className="h-4 w-4" /> {treatmentData ? "Update" : "Add"}
                        </button>
                      </div>
                      {treatmentData ? (
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex justify-between"><p className="font-medium text-purple-800">{treatmentData.drugName}</p>{treatmentData.bloodLevel && <p className="text-sm font-medium">Level: {treatmentData.bloodLevel}</p>}</div>
                          <p className="text-sm">{treatmentData.dosage} {treatmentData.dosageUnit} - {treatmentData.route}</p>
                          <p className="text-xs text-gray-500">From {formatDate(treatmentData.startDate)} {treatmentData.endDate ? `to ${formatDate(treatmentData.endDate)}` : "(ongoing)"}</p>
                          {treatmentData.interpretation && <p className="text-sm text-gray-600 mt-2">{treatmentData.interpretation}</p>}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <Pill className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No treatment recorded yet</p>
                          <button onClick={() => setTreatmentUpdateOpen(true)} className="mt-2 text-teal-600 text-sm hover:underline">Click here to add treatment</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* IMMUNOSUPPRESSION TAB */}
                  {activeTab === "immunosuppression" && (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Immunosuppression Regimen</h2>
                        <button onClick={() => setImmunosuppressionUpdateOpen(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50">
                          <Pencil className="h-4 w-4" /> {immunosuppressionData ? "Update" : "Add"}
                        </button>
                      </div>
                      {immunosuppressionData ? (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="grid grid-cols-2 gap-4 mb-4 pb-3 border-b border-blue-200">
                            <div><p className="text-xs text-gray-500">Start Date</p><p className="text-sm font-medium">{formatDate(immunosuppressionData.startDate)}</p></div>
                            <div><p className="text-xs text-gray-500">End Date</p><p className="text-sm font-medium">{immunosuppressionData.endDate ? formatDate(immunosuppressionData.endDate) : "Ongoing"}</p></div>
                          </div>
                          <div><p className="text-xs text-gray-500 mb-2">Medications</p><div className="flex flex-wrap gap-2">{immunosuppressionData.corticosteroids && <span className="px-2 py-1 bg-white rounded-md text-xs font-medium shadow-sm">Corticosteroids</span>}{immunosuppressionData.tacrolimus && <span className="px-2 py-1 bg-white rounded-md text-xs font-medium shadow-sm">Tacrolimus</span>}{immunosuppressionData.ciclosporine && <span className="px-2 py-1 bg-white rounded-md text-xs font-medium shadow-sm">Ciclosporine</span>}{immunosuppressionData.mmf && <span className="px-2 py-1 bg-white rounded-md text-xs font-medium shadow-sm">MMF</span>}{immunosuppressionData.azathioprine && <span className="px-2 py-1 bg-white rounded-md text-xs font-medium shadow-sm">Azathioprine</span>}{immunosuppressionData.sirolimus && <span className="px-2 py-1 bg-white rounded-md text-xs font-medium shadow-sm">Sirolimus</span>}</div></div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                          <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No immunosuppression regimen recorded yet</p>
                          <button onClick={() => setImmunosuppressionUpdateOpen(true)} className="mt-2 text-teal-600 text-sm hover:underline">Click here to add regimen</button>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CREATE MODALS */}
        <CreateAdverseEventModal isOpen={adverseEventOpen} onClose={() => setAdverseEventOpen(false)} onCreated={() => fetchFollowUpData(currentFollowUpId)} treatmentId={selectedTreatmentId} showToast={showToast} />
        <CreateFollowUpModal
          isOpen={createFollowUpOpen}
          onClose={() => setCreateFollowUpOpen(false)}
          onCreated={() => {
            if (transplantationId) {
              fetchAllFollowUps(transplantationId)
            }
            showToast("New follow-up created successfully")
          }}
          showToast={showToast}
          preSelectedTransplantationId={transplantationId}
        />

        {/* UPDATE MODALS */}
        {vitalSignsData !== undefined && (
          <UpdateVitalSignsModal isOpen={vitalSignsUpdateOpen} onClose={() => setVitalSignsUpdateOpen(false)} onUpdated={() => fetchFollowUpData(currentFollowUpId)} vitalSigns={vitalSignsData} followUpId={currentFollowUpId} showToast={showToast} />
        )}
        {biologicalData !== undefined && (
          <UpdateBiologicalModal isOpen={biologicalUpdateOpen} onClose={() => setBiologicalUpdateOpen(false)} onUpdated={() => fetchFollowUpData(currentFollowUpId)} biological={biologicalData} followUpId={currentFollowUpId} showToast={showToast} />
        )}
        {immunologicalData !== undefined && (
          <UpdateImmunologicalModal isOpen={immunologicalUpdateOpen} onClose={() => setImmunologicalUpdateOpen(false)} onUpdated={() => fetchFollowUpData(currentFollowUpId)} marker={immunologicalData} followUpId={currentFollowUpId} showToast={showToast} />
        )}
        {rejectionData !== undefined && (
          <UpdateRejectionModal isOpen={rejectionUpdateOpen} onClose={() => setRejectionUpdateOpen(false)} onUpdated={() => fetchFollowUpData(currentFollowUpId)} rejection={rejectionData} followUpId={currentFollowUpId} showToast={showToast} />
        )}
        {adherenceData !== undefined && (
          <UpdateAdherenceModal isOpen={adherenceUpdateOpen} onClose={() => setAdherenceUpdateOpen(false)} onUpdated={() => fetchFollowUpData(currentFollowUpId)} adherence={adherenceData} followUpId={currentFollowUpId} showToast={showToast} />
        )}
        {treatmentData !== undefined && (
          <UpdateTreatmentModal isOpen={treatmentUpdateOpen} onClose={() => setTreatmentUpdateOpen(false)} onUpdated={() => fetchFollowUpData(currentFollowUpId)} treatment={treatmentData} followUpId={currentFollowUpId} showToast={showToast} />
        )}
        {immunosuppressionData !== undefined && (
          <UpdateImmunosuppressionModal isOpen={immunosuppressionUpdateOpen} onClose={() => setImmunosuppressionUpdateOpen(false)} onUpdated={() => fetchFollowUpData(currentFollowUpId)} regimen={immunosuppressionData} followUpId={currentFollowUpId} showToast={showToast} />
        )}
        
        {/* FOLLOW-UP MODALS */}
        <UpdateFollowUpModal isOpen={updateOpen} onClose={() => setUpdateOpen(false)} followUp={followUp} onUpdated={() => fetchFollowUpData(currentFollowUpId)} showToast={showToast} />
        <DeleteFollowUpModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} followUpId={currentFollowUpId} onDeleted={() => { showToast("Follow-up deleted"); setTimeout(() => router.push("/followups"), 1000); }} showToast={showToast} />

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}