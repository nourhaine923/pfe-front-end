"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/features/auth/context"
import { useRouter } from "next/navigation"
import { Plus,Edit2,Trash2, Loader2,ChevronDown,ChevronUp,Settings,Zap,Target,Activity,Search,AlertCircle} from "lucide-react"
import api from "@/services/api"
import Toast from "@/components/ui/Toast"
import BaremModal from "@/components/admin/BaremModal"
import { getAttributesByScore } from "./attributes"
// Types
interface Barem {
  _id: string
  score: string
  key: string
  values: any[]
}
export default function BaremManagementPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [barems, setBarems] = useState<Barem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedScore, setSelectedScore] = useState<string>("SCORE_1")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBarem, setEditingBarem] = useState<Barem | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [toast, setToast] = useState<{ message: string; type?: string } | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (authLoading) return
    if (user?.role !== "ADMIN") {
      router.replace("/not-authorized")
      return
    }
    fetchBarems()
  }, [authLoading, user, router])

  const fetchBarems = async () => {
    try {
      setLoading(true)
      const res = await api.get("/barems")
      setBarems(res.data || [])
    } catch (err) {
      console.error("Error fetching barems:", err)
      showToast("Failed to load scoring rules", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, key: string) => {
    if (!confirm(`Are you sure you want to delete the rule for "${key}"?`)) return
    try {
      await api.delete(`/barems/${id}`)
      showToast(`Rule "${key}" deleted successfully`, "success")
      fetchBarems()
    } catch (err) {
      console.error("Error deleting barem:", err)
      showToast("Failed to delete rule", "error")
    }
  }

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedKeys)
    if (newExpanded.has(key)) {
      newExpanded.delete(key)
    } else {
      newExpanded.add(key)
    }
    setExpandedKeys(newExpanded)
  }

  const filteredBarems = barems
    .filter(b => b.score === selectedScore)
    .filter(b => b.key.toLowerCase().includes(searchTerm.toLowerCase()))

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
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Settings className="h-8 w-8 text-teal-600" />
                <h1 className="text-3xl font-bold text-gray-800">Scoring Rules Management</h1>
              </div>
              <p className="text-gray-500">Configure risk assessment scoring rules and thresholds</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add New Rule
            </button>
          </div>
        </div>

        {/* Score Type Tabs  */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex gap-1 px-4">
              <button
                onClick={() => setSelectedScore("SCORE_1")}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedScore === "SCORE_1" ? "border-orange-600 text-orange-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Zap className="h-4 w-4" /> SCORE 1 - Transplant Urgency
              </button>
              <button
                onClick={() => setSelectedScore("SCORE_2")}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedScore === "SCORE_2" ? "border-purple-600 text-purple-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Activity className="h-4 w-4" /> SCORE 2 - Post-Transplant Risk
              </button>
              <button
                onClick={() => setSelectedScore("SCORE_3")}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedScore === "SCORE_3" ? "border-teal-600 text-teal-600" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Target className="h-4 w-4" /> SCORE 3 - Success Probability
              </button>
            </nav>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search rules by attribute name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          {filteredBarems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No rules defined for {selectedScore}</p>
              <button onClick={() => setShowCreateModal(true)} className="mt-4 text-teal-600 hover:underline">
                Create your first rule
              </button>
            </div>
          ) : (
            filteredBarems.map((barem) => {
              const attributeInfo = getAttributesByScore(selectedScore).find(a => a.key === barem.key)
              const isExpanded = expandedKeys.has(barem.key)
              
              return (
                <div key={barem._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div 
                    className="px-5 py-4 bg-gray-50 border-b flex items-center justify-between cursor-pointer hover:bg-gray-100"
                    onClick={() => toggleExpand(barem.key)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg p-2 ${selectedScore === "SCORE_1" ? "bg-orange-100" : selectedScore === "SCORE_2" ? "bg-purple-100" : "bg-teal-100"}`}>
                        <Settings className={`h-5 w-5 ${selectedScore === "SCORE_1" ? "text-orange-600" : selectedScore === "SCORE_2" ? "text-purple-600" : "text-teal-600"}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{barem.key.replace(/_/g, " ").toUpperCase()}</h3>
                        {attributeInfo && <p className="text-xs text-gray-500">{attributeInfo.description}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{barem.values.length} rule(s)</span>
                      <button onClick={(e) => { e.stopPropagation(); setEditingBarem(barem); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(barem._id, barem.key); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-5">
                      <div className="space-y-3">
                        {barem.values.map((rule, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${rule.type === "boolean" ? "bg-blue-100 text-blue-700" : rule.type === "categorical" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>
                                {rule.type}
                              </span>
                              <span className="text-xs text-gray-400">Rule #{idx + 1}</span>
                            </div>
                            <div className="space-y-2">
                              {rule.conditions.map((cond: any, condIdx: number) => (
                                <div key={condIdx} className="flex items-center gap-2 text-sm">
                                  {condIdx > 0 && <span className="text-xs text-gray-400 w-8">{cond.operator || "AND"}</span>}
                                  <span className="text-gray-600">
                                    {cond.operator ? `${cond.operator} ` : ""}
                                    {typeof cond.value === "boolean" ? (cond.value ? "True" : "False") : Array.isArray(cond.value) ? `${cond.value[0]} - ${cond.value[1]}` : cond.value}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                  <span className={`font-bold ${cond.impact >= 0 ? "text-green-600" : "text-red-600"}`}>
                                    {cond.impact > 0 ? "+" : ""}{cond.impact} points
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Modals */}
        {(showCreateModal || editingBarem) && (
          <BaremModal
            barem={editingBarem}
            score={selectedScore}
            attributes={getAttributesByScore(selectedScore)}
            onClose={() => { setShowCreateModal(false); setEditingBarem(null); }}
            onSave={() => { fetchBarems(); showToast(editingBarem ? "Rule updated" : "Rule created", "success"); setShowCreateModal(false); setEditingBarem(null); }}
            showToast={showToast}
          />
        )}

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}