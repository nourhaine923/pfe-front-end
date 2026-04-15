// app/transplantations/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
  Calendar, 
  User, 
  Droplet, 
  Clock, 
  Stethoscope,
  Heart,
  Activity,
  AlertCircle,
  ArrowLeft,
  Edit2,
  Trash2,
  MapPin,
  Hospital,
  Syringe,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  Download,
  Printer,
  Zap,
  Target,
  Shield,
  Brain,
  Sparkles,
  TrendingUp
} from "lucide-react"
import api from "@/services/api"
import Toast from "@/components/ui/Toast"
import DeleteTransplantationModal from "@/components/modals/DeleteTransplantationModal"
import UpdateTransplantationModal from "@/components/modals/UpdateTransplantationModal"
import CreateCrossmatchModal from "@/components/modals/CreateCrossmatchModal"
import CreateOutcomeModal from "@/components/modals/CreateOutcomeModal"


// INDEPENDENT SCORE CARDS COMPONENT 
function ScoreCards({ transplantationId }: { transplantationId: string }) {
  const [scores, setScores] = useState<{ score1?: any; score3?: any }>({})
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null)

  // Fetch scores on mount and when transplantationId changes
  useEffect(() => {
    if (transplantationId) {
      fetchScores()
    }
  }, [transplantationId])

  const fetchScores = async () => {
    if (!transplantationId) return
    setLoading(true)
    try {
      const res = await api.get(`/scores/history/${transplantationId}`)
      const scoresData = res.data || []
      setScores({
        score1: scoresData.find((s: any) => s.score_type === "SCORE_1"),
        score3: scoresData.find((s: any) => s.score_type === "SCORE_3")
      })
    } catch (err) {
      console.error("Error fetching scores:", err)
    } finally {
      setLoading(false)
    }
  }

  const calculateScore = async (scoreType: string) => {
    if (!transplantationId) return
    
    setCalculating(scoreType)
    try {
      let endpoint = ""
      if (scoreType === "SCORE_1") {
        endpoint = `/scores/calculate-score-1/${transplantationId}`
      } else if (scoreType === "SCORE_3") {
        endpoint = `/scores/calculate-score-3/${transplantationId}`
      }
      
      const response = await api.post(endpoint)
      console.log(`${scoreType} response:`, response.data)
      
      // Create a new score object from response
      const newScore = {
        score_type: scoreType,
        value: response.data?.score || response.data?.value || 0,
        calculated_at: new Date().toISOString(),
        details: response.data?.used_attributes || response.data?.details || []
      }
      
      // Update only the specific score without refreshing the page
      setScores(prev => ({
        ...prev,
        [scoreType === "SCORE_1" ? "score1" : "score3"]: newScore
      }))
      
      showToast(`${scoreType} calculated successfully!`, "success")
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

  const urgencyScore = scores.score1?.value || 0
  const successScore = scores.score3?.value || 0

  const getUrgencyLevel = (score: number) => {
    if (score >= 80) return { label: "High Priority", color: "text-red-600", bg: "bg-red-100", icon: AlertCircle }
    if (score >= 60) return { label: "Medium Priority", color: "text-yellow-600", bg: "bg-yellow-100", icon: Activity }
    return { label: "Low Priority", color: "text-green-600", bg: "bg-green-100", icon: Shield }
  }

  const getSuccessLikelihood = (score: number) => {
    if (score >= 70) return { label: "High Likelihood", color: "text-green-600", bg: "bg-green-100" }
    if (score >= 50) return { label: "Moderate Likelihood", color: "text-yellow-600", bg: "bg-yellow-100" }
    return { label: "Low Likelihood", color: "text-red-600", bg: "bg-red-100" }
  }

  const urgency = getUrgencyLevel(urgencyScore)
  const success = getSuccessLikelihood(successScore)

  if (loading && !scores.score1 && !scores.score3) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Loader2 className="animate-spin h-8 w-8 text-teal-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Loading scores...</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <Loader2 className="animate-spin h-8 w-8 text-teal-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">Loading scores...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Transplant Urgency Card */}
        <div className="bg-gradient-to-br from-orange-50 to-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden transition-all hover:shadow-xl">
          <div className="px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-xl p-2">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg">Transplant Urgency</h3>
              </div>
              <button
                onClick={() => calculateScore("SCORE_1")}
                disabled={calculating === "SCORE_1"}
                className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm hover:bg-white/30 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {calculating === "SCORE_1" ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  scores.score1 ? "Recalculate" : "Calculate"
                )}
              </button>
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="relative inline-flex mb-4">
              <div className="w-32 h-32 rounded-full border-8 border-orange-200 flex items-center justify-center">
                <span className="text-4xl font-bold text-orange-600">{urgencyScore}</span>
              </div>
              <div 
                className="absolute inset-0 rounded-full border-8 border-orange-500 transition-all duration-500 ease-out"
                style={{ 
                  clipPath: `polygon(0 0, 100% 0, 100% ${100 - urgencyScore}%, 0 ${100 - urgencyScore}%)`,
                }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${urgency.bg}`}>
                <urgency.icon className={`h-4 w-4 ${urgency.color}`} />
                <span className={`text-sm font-semibold ${urgency.color}`}>{urgency.label}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Based on clinical deterioration risk assessment
            </p>
          </div>
        </div>
        
        {/* Success Probability Card */}
        <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden transition-all hover:shadow-xl">
          <div className="px-6 py-4 bg-gradient-to-r from-teal-500 to-teal-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-xl p-2">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg">Success Probability</h3>
              </div>
              <button
                onClick={() => calculateScore("SCORE_3")}
                disabled={calculating === "SCORE_3"}
                className="px-3 py-1.5 bg-white/20 rounded-lg text-white text-sm hover:bg-white/30 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {calculating === "SCORE_3" ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  scores.score3 ? "Recalculate" : "Calculate"
                )}
              </button>
            </div>
          </div>
          <div className="p-6 text-center">
            <div className="relative inline-flex mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="56" fill="none" stroke="#e6fffa" strokeWidth="8" />
                <circle 
                  cx="64" cy="64" r="56" fill="none" stroke="#14b8a6" strokeWidth="8" 
                  strokeDasharray="351.85" 
                  strokeDashoffset={351.85 - (successScore / 100) * 351.85}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-teal-600">{successScore}%</span>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-100">
              <span className={`text-sm font-semibold ${success.color}`}>{success.label}</span>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Graft survival & outcome prediction
            </p>
          </div>
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
    </>
  )
}

// ============================================
// MAIN PAGE COMPONENT
// ============================================
interface Transplantation {
  _id: string
  transplantNumber: string
  transplantDate: string
  transplantLocation: string
  serviceOrigin: string
  coldIschemiaHours: number
  warmIschemiaMinutes: number
  donor_id: string
  recipient_id: string
  donor?: {
    _id: string
    firstName: string
    lastName: string
    bloodGroup: string
    medicalRecordNumber: number
    sex?: string
    birthDate?: string
  }
  recipient?: {
    _id: string
    firstName: string
    lastName: string
    bloodGroup: string
    medicalRecordNumber: number
    birthDate?: string
    sex?: string
  }
  preTransplantAssessment?: {
    ageAtTransplant: number
    diabetes: boolean
    hypertension: boolean
    hbsAg: boolean
    antiHCV: boolean
    transfusion: boolean
    acc: boolean
    nephropathyType: string
    etiologyIRC: string
    eerModality: string
    eerStartDate: string
    trDelayMonths: number
    serumCreatinine?: number
    numberOfPreviousTransplants?: number
  }
  status?: "PENDING" | "APPROVED" | "REJECTED"
  createdAt?: string
}

interface CrossmatchTest {
  _id: string
  testDate: string
  methode: string
  result: string
  comment?: string
  createdAt?: string
}

interface Outcome {
  _id: string
  lastNewsDate: string
  aliveWithFunctioningGraft: boolean
  returnToDialysis: boolean
  deathWithFunctioningGraft: boolean
  lostToFollowUp: boolean
  delayedGraftFunction: boolean
}

export default function TransplantationDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [transplantation, setTransplantation] = useState<Transplantation | null>(null)
  const [crossmatchTests, setCrossmatchTests] = useState<CrossmatchTest[]>([])
  const [outcome, setOutcome] = useState<Outcome | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [crossmatchOpen, setCrossmatchOpen] = useState(false)
  const [outcomeOpen, setOutcomeOpen] = useState(false)

  useEffect(() => {
    if (id) {
      Promise.all([
        fetchTransplantation(),
        fetchCrossmatchTests(),
        fetchOutcome()
      ])
    }
  }, [id])

  const fetchTransplantation = async () => {
    try {
      const res = await api.get(`/transplantations/${id}`)
      setTransplantation(res.data)
      setError(null)
    } catch (err) {
      console.error("Error fetching transplantation:", err)
      setError("Failed to load transplantation details")
    } finally {
      setLoading(false)
    }
  }

  const fetchCrossmatchTests = async () => {
    try {
      const res = await api.get(`/crossmatch-tests/by-transplantation/${id}`)
      setCrossmatchTests(res.data || [])
    } catch (err) {
      console.error("Error fetching crossmatch tests:", err)
    }
  }

  const fetchOutcome = async () => {
    try {
      const res = await api.get(`/outcomes/by-transplantation/${id}`)
      setOutcome(res.data)
    } catch (err) {
      console.error("Error fetching outcome:", err)
    }
  }

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    })
  }

  const handleExportPDF = () => {
    const printContent = document.getElementById('transplantation-print-content')
    if (!printContent) return
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      showToast("Please allow popups to print/export", "error")
      return
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transplantation Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 18px; font-weight: bold; color: #2563eb; border-bottom: 1px solid #ddd; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f3f4f6; }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <div class="footer" style="text-align: center; margin-top: 40px; font-size: 12px;">
          Generated on ${new Date().toLocaleString()} | KTOuIP
        </div>
      </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
    printWindow.close()
  }

  const getStatusColor = (status?: string) => {
    switch(status) {
      case "APPROVED": return "bg-green-100 text-green-800"
      case "REJECTED": return "bg-red-100 text-red-800"
      default: return "bg-yellow-100 text-yellow-800"
    }
  }

  const getStatusIcon = (status?: string) => {
    switch(status) {
      case "APPROVED": return <Activity className="h-5 w-5 text-green-600" />
      case "REJECTED": return <AlertCircle className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-yellow-600" />
    }
  }

  const InfoRow = ({ label, value, icon: Icon, color = "text-gray-600" }: any) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className={`mt-0.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <div className="text-gray-900 font-medium mt-1">{value || "—"}</div>
      </div>
    </div>
  )

  const SectionTitle = ({ title, icon: Icon }: any) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
      {Icon && <Icon className="h-5 w-5 text-teal-600" />}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-teal-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading transplantation details...</p>
        </div>
      </div>
    )
  }

  if (error || !transplantation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error || "Transplantation not found"}</p>
          <button onClick={() => router.push("/transplantations")} className="px-4 py-2 bg-teal-600 text-white rounded-lg">
            Back to Transplantations
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <button onClick={() => router.push("/transplantations")} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleExportPDF} className="inline-flex items-center gap-2 px-4 py-2 text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
              <button onClick={() => setCrossmatchOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100">
                <Syringe className="h-4 w-4" />
                Add Crossmatch
              </button>
              <button onClick={() => setOutcomeOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100">
                <Activity className="h-4 w-4" />
                Record Outcome
              </button>
              <button onClick={() => setUpdateOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-green-700 bg-green-50 rounded-lg hover:bg-green-100">
                <Edit2 className="h-4 w-4" />
                Update
              </button>
              <button onClick={() => setDeleteOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-red-700 bg-red-50 rounded-lg hover:bg-red-100">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Score Cards */}
        <ScoreCards transplantationId={transplantation._id} />

        {/* Main Content */}
        <div id="transplantation-print-content">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-6">
              
              {/* Header Info */}
              <div className="pb-4 mb-4 border-b">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="h-10 w-10 text-teal-600" />
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                          Transplantation {transplantation.transplantNumber || `#${transplantation._id?.slice(-6)}`}
                        </h1>
                        <p className="text-sm text-gray-500">ID: {transplantation._id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(transplantation.status)}`}>
                        {getStatusIcon(transplantation.status)}
                        <span className="text-sm font-medium">{transplantation.status || "PENDING"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Created</p>
                    <p className="font-medium">{formatDate(transplantation.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <SectionTitle title="Donor Information" icon={User} />
                    <div className="space-y-3">
                      <InfoRow label="Full Name" value={`${transplantation.donor?.firstName} ${transplantation.donor?.lastName}`} icon={User} />
                      <InfoRow label="Medical Record Number" value={transplantation.donor?.medicalRecordNumber} icon={FileText} />
                      <InfoRow label="Blood Group" value={transplantation.donor?.bloodGroup} icon={Droplet} color="text-red-600" />
                    </div>
                  </div>

                  <div>
                    <SectionTitle title="Recipient Information" icon={User} />
                    <div className="space-y-3">
                      <InfoRow label="Full Name" value={`${transplantation.recipient?.firstName} ${transplantation.recipient?.lastName}`} icon={User} />
                      <InfoRow label="Medical Record Number" value={transplantation.recipient?.medicalRecordNumber} icon={FileText} />
                      <InfoRow label="Blood Group" value={transplantation.recipient?.bloodGroup} icon={Droplet} color="text-red-600" />
                    </div>
                  </div>

                  <div>
                    <SectionTitle title="Procedure Details" icon={Hospital} />
                    <div className="space-y-3">
                      <InfoRow label="Transplant Number" value={transplantation.transplantNumber} icon={FileText} />
                      <InfoRow label="Transplant Date" value={formatDate(transplantation.transplantDate)} icon={Calendar} />
                      <InfoRow label="Location" value={transplantation.transplantLocation} icon={MapPin} />
                      <InfoRow label="Cold Ischemia" value={`${transplantation.coldIschemiaHours} hours`} icon={Clock} />
                      <InfoRow label="Warm Ischemia" value={`${transplantation.warmIschemiaMinutes} minutes`} icon={Clock} />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {transplantation.preTransplantAssessment && (
                    <div>
                      <SectionTitle title="Pre-Transplant Assessment" icon={Stethoscope} />
                      <div className="space-y-3">
                        <InfoRow label="Age at Transplant" value={`${transplantation.preTransplantAssessment.ageAtTransplant} years`} icon={Calendar} />
                        <InfoRow label="Previous Transplants" value={transplantation.preTransplantAssessment.numberOfPreviousTransplants || "0"} icon={Activity} />
                        <InfoRow label="Nephropathy Type" value={transplantation.preTransplantAssessment.nephropathyType} icon={FileText} />
                        <InfoRow label="EER Modality" value={transplantation.preTransplantAssessment.eerModality} icon={Syringe} />
                        <InfoRow label="Transplant Delay" value={`${transplantation.preTransplantAssessment.trDelayMonths} months`} icon={Clock} />
                      </div>
                    </div>
                  )}

                  {crossmatchTests.length > 0 && (
                    <div>
                      <SectionTitle title="Crossmatch Tests" icon={Syringe} />
                      <div className="space-y-3">
                        {crossmatchTests.map((test) => (
                          <div key={test._id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">{formatDate(test.testDate)}</span>
                              <span className={`px-2 py-1 text-xs rounded-full ${test.result === "Positive" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                                {test.result}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">Method: {test.methode}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <DeleteTransplantationModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} transplantationId={transplantation._id} onDeleted={() => { showToast("Deleted"); router.push("/transplantations"); }} showToast={showToast} />
        <UpdateTransplantationModal isOpen={updateOpen} onClose={() => setUpdateOpen(false)} transplantation={transplantation} onUpdated={() => { fetchTransplantation(); showToast("Updated"); }} showToast={showToast} />
        <CreateCrossmatchModal isOpen={crossmatchOpen} onClose={() => setCrossmatchOpen(false)} onCreated={() => { fetchCrossmatchTests(); showToast("Crossmatch added"); }} transplantationId={transplantation._id} transplantInfo={{ transplantNumber: transplantation.transplantNumber, donorName: `${transplantation.donor?.firstName} ${transplantation.donor?.lastName}`, recipientName: `${transplantation.recipient?.firstName} ${transplantation.recipient?.lastName}` }} showToast={showToast} />
        <CreateOutcomeModal isOpen={outcomeOpen} onClose={() => setOutcomeOpen(false)} onCreated={() => { fetchOutcome(); showToast("Outcome recorded"); }} transplantationId={transplantation._id} transplantInfo={{ transplantNumber: transplantation.transplantNumber, donorName: `${transplantation.donor?.firstName} ${transplantation.donor?.lastName}`, recipientName: `${transplantation.recipient?.firstName} ${transplantation.recipient?.lastName}` }} showToast={showToast} />

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}