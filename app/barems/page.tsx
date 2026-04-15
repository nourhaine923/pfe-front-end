// app/admin/barems/page.tsx - Barem Management (Admin only)
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/features/auth/context"
import { useRouter } from "next/navigation"
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Save,
  X,
  Settings,
} from "lucide-react"
import api from "@/services/api"
import Toast from "@/components/ui/Toast"

interface Condition {
  operator: string | null
  value: any
  impact: number
}

interface ValueRule {
  type: string
  conditions: Condition[]
}

interface Barem {
  _id: string
  score: string
  key: string
  values: ValueRule[]
}

export default function BaremManagementPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [barems, setBarems] = useState<Barem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedScore, setSelectedScore] = useState<string>("SCORE_1")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingBarem, setEditingBarem] = useState<Barem | null>(null)
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule? This may affect score calculations.")) return
    
    try {
      await api.delete(`/barems/${id}`)
      showToast("Rule deleted successfully", "success")
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

  const filteredBarems = barems.filter(b => b.score === selectedScore)

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin h-12 w-12 text-teal-600 mx-auto" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-teal-800">Scoring Rules Management</h1>
              <p className="text-gray-600 mt-1">Configure risk assessment scoring rules and thresholds</p>
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

        {/* Score Type Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex gap-1 px-4">
              {["SCORE_1", "SCORE_2", "SCORE_3"].map((score) => (
                <button
                  key={score}
                  onClick={() => setSelectedScore(score)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                    selectedScore === score
                      ? "border-teal-600 text-teal-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {score}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Rules List */}
        <div className="space-y-4">
          {filteredBarems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No rules defined for {selectedScore}</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 text-teal-600 hover:underline"
              >
                Create your first rule
              </button>
            </div>
          ) : (
            filteredBarems.map((barem) => (
              <div key={barem._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div 
                  className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleExpand(barem.key)}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-100 rounded-lg p-2">
                      <Settings className="h-5 w-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{barem.key.replace(/_/g, " ").toUpperCase()}</h3>
                      <p className="text-sm text-gray-500">
                        {barem.values.length} rule(s) configured
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingBarem(barem)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(barem._id)
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {expandedKeys.has(barem.key) ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedKeys.has(barem.key) && (
                  <div className="p-6">
                    <div className="space-y-3">
                      {barem.values.map((rule, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  rule.type === "conditional" ? "bg-blue-100 text-blue-700" :
                                  rule.type === "boolean" ? "bg-green-100 text-green-700" :
                                  "bg-purple-100 text-purple-700"
                                }`}>
                                  {rule.type}
                                </span>
                              </div>
                              <div className="space-y-2">
                                {rule.conditions.map((cond, condIdx) => (
                                  <div key={condIdx} className="text-sm">
                                    <span className="text-gray-600">
                                      {cond.operator ? `${cond.operator} ` : ""}
                                    </span>
                                    <span className="font-mono bg-white px-2 py-0.5 rounded border">
                                      {JSON.stringify(cond.value)}
                                    </span>
                                    <span className="text-gray-600 ml-2">
                                      → <span className={`font-bold ${cond.impact >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {cond.impact > 0 ? "+" : ""}{cond.impact} points
                                      </span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingBarem) && (
          <BaremModal
            barem={editingBarem}
            score={selectedScore}
            onClose={() => {
              setShowCreateModal(false)
              setEditingBarem(null)
            }}
            onSave={() => {
              fetchBarems()
              showToast(editingBarem ? "Rule updated successfully" : "Rule created successfully", "success")
              setShowCreateModal(false)
              setEditingBarem(null)
            }}
            showToast={showToast}
          />
        )}

        {toast && <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />}
      </div>
    </div>
  )
}

// Barem Modal Component
function BaremModal({ barem, score, onClose, onSave, showToast }: any) {
  const [form, setForm] = useState({
    key: barem?.key || "",
    values: barem?.values || [{ type: "boolean", conditions: [{ operator: null, value: true, impact: 0 }] }]
  })
  const [saving, setSaving] = useState(false)

  const attributeOptions = [
    "recipient_age",
    "donor_age",
    "cold_ischemia_time",
    "warm_ischemia_time",
    "previous_transplants",
    "diabetes",
    "hypertension",
    "hbsag_positive",
    "anti_hcv_positive",
    "creatinine_level",
    "gfr_value",
    "proteinuria",
    "dsa_present",
    "pra_percentage",
    "rejection_episode",
    "adherence_percentage",
    "infection_event"
  ]

  const handleSubmit = async () => {
    if (!form.key) {
      showToast("Please enter an attribute key", "error")
      return
    }

    try {
      setSaving(true)
      
      const payload = {
        score: score,
        key: form.key,
        values: form.values
      }
      
      if (barem?._id) {
        await api.put(`/barems/${barem._id}`, payload)
      } else {
        await api.post("/barems", payload)
      }
      
      onSave()
    } catch (err: any) {
      console.error("Error saving barem:", err)
      showToast(err.response?.data?.detail || "Failed to save rule", "error")
    } finally {
      setSaving(false)
    }
  }

  const addRule = () => {
    setForm(prev => ({
      ...prev,
      values: [...prev.values, { type: "boolean", conditions: [{ operator: null, value: true, impact: 0 }] }]
    }))
  }

  const removeRule = (idx: number) => {
    setForm(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== idx)
    }))
  }

  const updateRule = (idx: number, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      values: prev.values.map((rule, i) => 
        i === idx ? { ...rule, [field]: value } : rule
      )
    }))
  }

  const updateCondition = (ruleIdx: number, condIdx: number, field: string, value: any) => {
    setForm(prev => ({
      ...prev,
      values: prev.values.map((rule, i) => 
        i === ruleIdx ? {
          ...rule,
          conditions: rule.conditions.map((cond, j) =>
            j === condIdx ? { ...cond, [field]: value } : cond
          )
        } : rule
      )
    }))
  }

  const addCondition = (ruleIdx: number) => {
    setForm(prev => ({
      ...prev,
      values: prev.values.map((rule, i) =>
        i === ruleIdx ? {
          ...rule,
          conditions: [...rule.conditions, { operator: "and", value: true, impact: 0 }]
        } : rule
      )
    }))
  }

  const removeCondition = (ruleIdx: number, condIdx: number) => {
    setForm(prev => ({
      ...prev,
      values: prev.values.map((rule, i) =>
        i === ruleIdx ? {
          ...rule,
          conditions: rule.conditions.filter((_, j) => j !== condIdx)
        } : rule
      )
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              {barem ? "Edit Scoring Rule" : "Create New Scoring Rule"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Attribute Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attribute Key <span className="text-red-500">*</span>
            </label>
            {barem ? (
              <input
                type="text"
                value={form.key}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
              />
            ) : (
              <select
                value={form.key}
                onChange={(e) => setForm(prev => ({ ...prev, key: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select attribute</option>
                {attributeOptions.map(opt => (
                  <option key={opt} value={opt}>{opt.replace(/_/g, " ").toUpperCase()}</option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500 mt-1">
              This key must match the attribute resolver in the backend
            </p>
          </div>

          {/* Rules */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Scoring Rules</label>
              <button
                type="button"
                onClick={addRule}
                className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Rule
              </button>
            </div>
            
            <div className="space-y-4">
              {form.values.map((rule, ruleIdx) => (
                <div key={ruleIdx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <select
                      value={rule.type}
                      onChange={(e) => updateRule(ruleIdx, "type", e.target.value)}
                      className="px-2 py-1 text-sm border border-gray-300 rounded bg-white"
                    >
                      <option value="boolean">Boolean</option>
                      <option value="categorical">Categorical</option>
                      <option value="conditional">Conditional</option>
                    </select>
                    <button
                      onClick={() => removeRule(ruleIdx)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {rule.conditions.map((cond, condIdx) => (
                      <div key={condIdx} className="flex items-center gap-2">
                        {condIdx > 0 && (
                          <select
                            value={cond.operator || "and"}
                            onChange={(e) => updateCondition(ruleIdx, condIdx, "operator", e.target.value)}
                            className="px-2 py-1 text-sm border border-gray-300 rounded bg-white w-20"
                          >
                            <option value="and">AND</option>
                            <option value="or">OR</option>
                          </select>
                        )}
                        
                        <input
                          type="text"
                          value={JSON.stringify(cond.value)}
                          onChange={(e) => {
                            let value: any = e.target.value
                            if (value === "true") value = true
                            else if (value === "false") value = false
                            else if (!isNaN(Number(value)) && value !== "") value = Number(value)
                            updateCondition(ruleIdx, condIdx, "value", value)
                          }}
                          placeholder="Value"
                          className="flex-1 px-3 py-1 border border-gray-300 rounded"
                        />
                        
                        <input
                          type="number"
                          value={cond.impact}
                          onChange={(e) => updateCondition(ruleIdx, condIdx, "impact", Number(e.target.value))}
                          placeholder="Points"
                          className="w-24 px-3 py-1 border border-gray-300 rounded"
                        />
                        
                        {condIdx > 0 && (
                          <button
                            onClick={() => removeCondition(ruleIdx, condIdx)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => addCondition(ruleIdx)}
                    className="mt-3 text-xs text-teal-600 hover:text-teal-700"
                  >
                    + Add condition
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save Rule"}
          </button>
        </div>
      </div>
    </div>
  )
}