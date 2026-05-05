// components/admin/BaremModal.tsx
"use client"

import { useState } from "react"
import { Loader2, Save, X, Plus } from "lucide-react"
import api from "@/services/api"
import AttributeSelector from "./AttributeSelector"
import RuleBuilder from "./RuleBuilder"

interface BaremModalProps {
  barem: any
  score: string
  attributes: any[]
  onClose: () => void
  onSave: () => void
  showToast: (message: string, type: "success" | "error" | "warning") => void
}

export default function BaremModal({ barem, score, attributes, onClose, onSave, showToast }: BaremModalProps) {
  const [form, setForm] = useState({
    key: barem?.key || "",
    values: barem?.values || [{ type: "conditional", conditions: [{ operator: null, value: 0, impact: 0 }] }]
  })
  const [saving, setSaving] = useState(false)

  const addRule = () => {
    setForm(prev => ({
      ...prev,
      values: [...prev.values, { type: "conditional", conditions: [{ operator: null, value: 0, impact: 0 }] }]
    }))
  }

  const removeRule = (idx: number) => {
    setForm(prev => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== idx)
    }))
  }

  const updateRule = (idx: number, updatedRule: any) => {
    setForm(prev => ({
      ...prev,
      values: prev.values.map((rule, i) => i === idx ? updatedRule : rule)
    }))
  }

  const handleSubmit = async () => {
    if (!form.key) {
      showToast("Please select an attribute", "error")
      return
    }

    // Validate rules have conditions
    for (let i = 0; i < form.values.length; i++) {
      const rule = form.values[i]
      if (rule.conditions.length === 0) {
        showToast(`Rule ${i + 1} must have at least one condition`, "error")
        return
      }
      for (let j = 0; j < rule.conditions.length; j++) {
        const cond = rule.conditions[j]
        if (cond.value === "" || cond.value === null) {
          showToast(`Rule ${i + 1}, Condition ${j + 1}: Value is required`, "error")
          return
        }
      }
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

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {barem ? "Edit Scoring Rule" : "Create New Scoring Rule"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {score} - Configure scoring logic for this attribute
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Attribute Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attribute <span className="text-red-500">*</span>
            </label>
            <AttributeSelector
              barem={barem}
              selectedKey={form.key}
              attributes={attributes}
              onSelect={(key) => setForm(prev => ({ ...prev, key }))}
            />
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
              {form.values.map((rule: any, ruleIdx: number) => (
                <RuleBuilder
                  key={ruleIdx}
                  rule={rule}
                  index={ruleIdx}
                  attributeInfo={attributes.find(a => a.key === form.key)}
                  onUpdate={(updated: any) => updateRule(ruleIdx, updated)}
                  onRemove={() => removeRule(ruleIdx)}
                />
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