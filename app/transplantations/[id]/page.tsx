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
  Printer
} from "lucide-react"
import api from "@/services/api"
import Toast from "@/components/ui/Toast"
import DeleteTransplantationModal from "@/components/modals/DeleteTransplantationModal"
import UpdateTransplantationModal from "@/components/modals/UpdateTransplantationModal"
import CreateCrossmatchModal from "@/components/modals/CreateCrossmatchModal"
import CreateOutcomeModal from "@/components/modals/CreateOutcomeModal"

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
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [crossmatchOpen, setCrossmatchOpen] = useState(false)
  const [outcomeOpen, setOutcomeOpen] = useState(false)

  useEffect(() => {
    if (id) {
      fetchTransplantation()
      fetchCrossmatchTests()
      fetchOutcome()
    }
  }, [id])

  const fetchTransplantation = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/transplantations/${id}`)
      setTransplantation(res.data)
    } catch (err) {
      console.error("Error fetching transplantation:", err)
      showToast("Failed to load transplantation details", "error")
    } finally {
      setLoading(false)
    }
  }

  const fetchCrossmatchTests = async () => {
    try {
      const res = await api.get(`/crossmatch-tests/by-transplantation/${id}`)
      setCrossmatchTests(res.data)
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

  // Export to PDF function
  const handleExportPDF = () => {
    const printContent = document.getElementById('transplantation-print-content')
    if (!printContent) return
    
    const originalTitle = document.title
    document.title = `Transplantation_${transplantation?.transplantNumber || transplantation?._id?.slice(-6)}`
    
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      showToast("Please allow popups to print/export", "error")
      return
    }
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transplantation Report - ${transplantation?.transplantNumber || ''}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #333; }
          .header h1 { margin: 0; color: #2563eb; }
          .patient-info { background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section-title { font-size: 18px; font-weight: bold; color: #2563eb; border-bottom: 1px solid #d1d5db; padding-bottom: 8px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
          th, td { border: 1px solid #d1d5db; padding: 8px 12px; text-align: left; }
          th { background: #f3f4f6; font-weight: bold; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db; font-size: 12px; color: #6b7280; }
          @media print { body { margin: 0; padding: 0; } }
        </style>
      </head>
      <body>
        ${printContent.innerHTML}
        <div class="footer"><p>Generated on ${new Date().toLocaleString()} | Kidney Transplant Management System</p></div>
      </body>
      </html>
    `)
    
    printWindow.document.close()
    printWindow.print()
    printWindow.onafterprint = () => {
      document.title = originalTitle
      printWindow.close()
    }
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

  const getOutcomeBadge = () => {
    if (!outcome) return null
    if (outcome.aliveWithFunctioningGraft) return { text: "Alive with Functioning Graft", color: "bg-green-100 text-green-800", icon: Heart }
    if (outcome.returnToDialysis) return { text: "Return to Dialysis", color: "bg-yellow-100 text-yellow-800", icon: Droplet }
    if (outcome.deathWithFunctioningGraft) return { text: "Death with Functioning Graft", color: "bg-red-100 text-red-800", icon: AlertCircle }
    if (outcome.lostToFollowUp) return { text: "Lost to Follow Up", color: "bg-gray-100 text-gray-800", icon: User }
    return null
  }

  const InfoRow = ({ label, value, icon: Icon, color = "text-gray-600" }: any) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className={`mt-0.5 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <div className="text-gray-900 font-medium mt-1 break-words">{value || "—"}</div>
      </div>
    </div>
  )

  const SectionTitle = ({ title, icon: Icon }: any) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
      {Icon && <Icon className="h-5 w-5 text-blue-600" />}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
  )

  const Badge = ({ text, type = "info" }: { text: string; type?: "success" | "warning" | "info" | "danger" }) => {
    const colors = { success: "bg-green-100 text-green-800", warning: "bg-yellow-100 text-yellow-800", info: "bg-blue-100 text-blue-800", danger: "bg-red-100 text-red-800" }
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[type]}`}>{text}</span>
  }

  const handleDelete = () => setDeleteOpen(true)
  const handleUpdate = () => setUpdateOpen(true)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading transplantation details...</p>
        </div>
      </div>
    )
  }

  if (!transplantation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Transplantation Not Found</h2>
          <p className="text-gray-600 mb-4">The requested transplantation could not be found.</p>
          <button onClick={() => router.push("/transplantations")} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Back to Transplantations</button>
        </div>
      </div>
    )
  }

  const outcomeBadge = getOutcomeBadge()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header with navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <button onClick={() => router.push("/transplantations")} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              Back to Transplantations
            </button>
            <div className="flex gap-2">
              <button onClick={handleExportPDF} className="inline-flex items-center gap-2 px-4 py-2 text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors">
                <Download className="h-4 w-4" />
                Export PDF
              </button>
              <button onClick={() => setCrossmatchOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Syringe className="h-4 w-4" />
                Add Crossmatch
              </button>
              {/* Only show Record Outcome button if status is NOT REJECTED */}
              {transplantation.status !== "REJECTED" && (
                <button onClick={() => setOutcomeOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <Activity className="h-4 w-4" />
                  Record Outcome
                </button>
              )}
              <button onClick={handleUpdate} className="inline-flex items-center gap-2 px-4 py-2 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Edit2 className="h-4 w-4" />
                Update
              </button>
              <button onClick={handleDelete} className="inline-flex items-center gap-2 px-4 py-2 text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Print Content Container */}
        <div id="transplantation-print-content">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-6">
              {/* Header */}
              <div className="pb-4 mb-4 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="h-10 w-10 text-blue-600" />
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">Transplantation {transplantation.transplantNumber || `#${transplantation._id?.slice(-6)}`}</h1>
                        <p className="text-sm text-gray-500">ID: {transplantation._id}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(transplantation.status)}`}>
                        {getStatusIcon(transplantation.status)}
                        <span className="text-sm font-medium">{transplantation.status || "PENDING"}</span>
                      </div>
                      {outcomeBadge && (
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${outcomeBadge.color}`}>
                          <outcomeBadge.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{outcomeBadge.text}</span>
                        </div>
                      )}
                      {outcome?.delayedGraftFunction && <Badge text="Delayed Graft Function" type="warning" />}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Created on</p>
                    <p className="font-medium">{formatDate(transplantation.createdAt)}</p>
                  </div>
                </div>
              </div>

              {/* BALANCED TWO COLUMN LAYOUT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* LEFT COLUMN - Donor + Recipient + Procedure Details + Ischemia Times */}
                <div className="space-y-6">
                  
                  {/* Donor Information */}
                  <div>
                    <SectionTitle title="Donor Information" icon={User} />
                    <div className="grid grid-cols-1 gap-3">
                      <InfoRow label="Full Name" value={`${transplantation.donor?.firstName} ${transplantation.donor?.lastName}`} icon={User} />
                      <InfoRow label="Medical Record Number" value={transplantation.donor?.medicalRecordNumber} icon={FileText} />
                      <InfoRow label="Blood Group" value={transplantation.donor?.bloodGroup} icon={Droplet} color="text-red-600" />
                      {transplantation.donor?.sex && <InfoRow label="Sex" value={transplantation.donor?.sex} icon={User} />}
                      {transplantation.donor?.birthDate && <InfoRow label="Birth Date" value={formatDate(transplantation.donor?.birthDate)} icon={Calendar} />}
                    </div>
                  </div>

                  {/* Recipient Information */}
                  <div>
                    <SectionTitle title="Recipient Information" icon={User} />
                    <div className="grid grid-cols-1 gap-3">
                      <InfoRow label="Full Name" value={`${transplantation.recipient?.firstName} ${transplantation.recipient?.lastName}`} icon={User} />
                      <InfoRow label="Medical Record Number" value={transplantation.recipient?.medicalRecordNumber} icon={FileText} />
                      <InfoRow label="Blood Group" value={transplantation.recipient?.bloodGroup} icon={Droplet} color="text-red-600" />
                      {transplantation.recipient?.sex && <InfoRow label="Sex" value={transplantation.recipient?.sex} icon={User} />}
                      {transplantation.recipient?.birthDate && <InfoRow label="Birth Date" value={formatDate(transplantation.recipient?.birthDate)} icon={Calendar} />}
                    </div>
                  </div>

                  {/* Procedure Details */}
                  <div>
                    <SectionTitle title="Procedure Details" icon={Hospital} />
                    <div className="grid grid-cols-1 gap-3">
                      <InfoRow label="Transplant Number" value={transplantation.transplantNumber} icon={FileText} />
                      <InfoRow label="Transplant Date" value={formatDate(transplantation.transplantDate)} icon={Calendar} />
                      <InfoRow label="Location" value={transplantation.transplantLocation} icon={MapPin} />
                      <InfoRow label="Service Origin" value={transplantation.serviceOrigin?.replace("_", " ")} icon={Hospital} />
                    </div>
                  </div>

                  {/* Ischemia Times */}
                  <div>
                    <SectionTitle title="Ischemia Times" icon={Clock} />
                    <div className="grid grid-cols-2 gap-3">
                      <InfoRow label="Cold Ischemia" value={`${transplantation.coldIschemiaHours} hours`} icon={Clock} />
                      <InfoRow label="Warm Ischemia" value={`${transplantation.warmIschemiaMinutes} minutes`} icon={Clock} />
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN - Pre-Transplant Assessment + Crossmatch Tests + Outcome */}
                <div className="space-y-6">

                  {/* Pre-Transplant Assessment */}
                  {transplantation.preTransplantAssessment && (
                    <div>
                      <SectionTitle title="Pre-Transplant Assessment" icon={Stethoscope} />
                      <div className="grid grid-cols-1 gap-3">
                        <InfoRow label="Age at Transplant" value={`${transplantation.preTransplantAssessment.ageAtTransplant} years`} icon={Calendar} />
                        <InfoRow label="Number of Previous Transplants" value={transplantation.preTransplantAssessment.numberOfPreviousTransplants || "0"} icon={Activity} />
                        <InfoRow label="Serum Creatinine" value={`${transplantation.preTransplantAssessment.serumCreatinine || "—"} mg/dL`} icon={Droplet} />
                        <InfoRow 
                          label="Medical Conditions" 
                          value={
                            <div className="flex flex-wrap gap-2 mt-1">
                              {transplantation.preTransplantAssessment.diabetes && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Diabetes</span>}
                              {transplantation.preTransplantAssessment.hypertension && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Hypertension</span>}
                              {transplantation.preTransplantAssessment.hbsAg && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">HBsAg+</span>}
                              {transplantation.preTransplantAssessment.antiHCV && <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Anti-HCV+</span>}
                            </div>
                          } 
                          icon={Activity}
                        />
                        <InfoRow label="Nephropathy Type" value={transplantation.preTransplantAssessment.nephropathyType} icon={FileText} />
                        <InfoRow label="Etiology IRC" value={transplantation.preTransplantAssessment.etiologyIRC} icon={AlertCircle} />
                        <InfoRow label="EER Modality" value={transplantation.preTransplantAssessment.eerModality} icon={Syringe} />
                        <InfoRow label="EER Start Date" value={formatDate(transplantation.preTransplantAssessment.eerStartDate)} icon={Calendar} />
                        <InfoRow label="Transplant Delay" value={`${transplantation.preTransplantAssessment.trDelayMonths} months`} icon={Clock} />
                      </div>
                    </div>
                  )}

                  {/* Crossmatch Tests */}
                  {crossmatchTests.length > 0 && (
                    <div>
                      <SectionTitle title="Crossmatch Tests" icon={Syringe} />
                      <div className="space-y-3">
                        {crossmatchTests.map((test, index) => (
                          <div key={test._id} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-medium text-gray-900">Test #{index + 1} - {formatDate(test.testDate)}</p>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${test.result === "Positive" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                                {test.result}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">Method: {test.methode}</p>
                            {test.comment && <p className="text-sm text-gray-500 mt-2">Comment: {test.comment}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Outcome Details */}
                  {outcome && (
                    <div>
                      <SectionTitle title="Outcome" icon={Activity} />
                      <div className="bg-gray-50 rounded-lg p-4">
                        <InfoRow label="Last News Date" value={formatDate(outcome.lastNewsDate)} icon={Calendar} />
                        <InfoRow 
                          label="Patient Status" 
                          value={outcome.aliveWithFunctioningGraft ? "Alive with Functioning Graft" : outcome.returnToDialysis ? "Return to Dialysis" : outcome.deathWithFunctioningGraft ? "Death with Functioning Graft" : outcome.lostToFollowUp ? "Lost to Follow Up" : "Unknown"}
                          icon={Heart}
                        />
                        {outcome.delayedGraftFunction && <InfoRow label="Delayed Graft Function" value="Yes" icon={Clock} color="text-yellow-600" />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <DeleteTransplantationModal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} transplantationId={transplantation._id} onDeleted={() => { showToast("Transplantation deleted successfully"); setTimeout(() => router.push("/transplantations"), 1000); }} showToast={showToast} />
        <UpdateTransplantationModal isOpen={updateOpen} onClose={() => setUpdateOpen(false)} transplantation={transplantation} onUpdated={() => { fetchTransplantation(); showToast("Transplantation updated successfully", "success"); }} showToast={showToast} />
        <CreateCrossmatchModal isOpen={crossmatchOpen} onClose={() => setCrossmatchOpen(false)} onCreated={() => { fetchCrossmatchTests(); showToast("Crossmatch test added successfully", "success"); }} transplantationId={transplantation._id} transplantInfo={{ transplantNumber: transplantation.transplantNumber, donorName: `${transplantation.donor?.firstName} ${transplantation.donor?.lastName}`, recipientName: `${transplantation.recipient?.firstName} ${transplantation.recipient?.lastName}` }} showToast={showToast} />
        
        {/* Only show CreateOutcomeModal if status is NOT REJECTED */}
        {transplantation.status !== "REJECTED" && (
          <CreateOutcomeModal isOpen={outcomeOpen} onClose={() => setOutcomeOpen(false)} onCreated={() => { fetchOutcome(); showToast("Outcome recorded successfully", "success"); }} transplantationId={transplantation._id} transplantInfo={{ transplantNumber: transplantation.transplantNumber, donorName: `${transplantation.donor?.firstName} ${transplantation.donor?.lastName}`, recipientName: `${transplantation.recipient?.firstName} ${transplantation.recipient?.lastName}` }} showToast={showToast} />
        )}

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}