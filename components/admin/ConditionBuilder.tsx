// components/admin/ConditionBuilder.tsx
"use client"

import { X } from "lucide-react"
import HelpTooltip from "./HelpTooltip"

interface Condition {
  operator: string | null
  value: any
  impact: number
}

interface ConditionBuilderProps {
  condition: Condition
  ruleType: string
  attributeInfo?: any
  onUpdate: (updated: Condition) => void
  onRemove: () => void
  showOperator: boolean
}

export default function ConditionBuilder({ 
  condition, 
  ruleType, 
  attributeInfo,
  onUpdate, 
  onRemove, 
  showOperator 
}: ConditionBuilderProps) {
  const operators = [
    { value: "less_than", label: "<" },
    { value: "greater_than", label: ">" },
    { value: "equal", label: "=" },
    { value: "between", label: "between" },
  ]

  const handleValueChange = (val: any) => {
    onUpdate({ ...condition, value: val })
  }

  const handleImpactChange = (val: number) => {
    onUpdate({ ...condition, impact: val })
  }

  const handleOperatorChange = (op: string) => {
    onUpdate({ ...condition, operator: op })
  }

  const renderValueInput = () => {
    // Boolean type - dropdown
    if (ruleType === "boolean") {
      return (
        <select
          value={condition.value === true ? "true" : "false"}
          onChange={(e) => handleValueChange(e.target.value === "true")}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
        >
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      )
    }

    // Categorical type - could be dropdown or text
    if (ruleType === "categorical") {
      if (attributeInfo?.options && attributeInfo.options.length > 0) {
        return (
          <select
            value={condition.value || ""}
            onChange={(e) => handleValueChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">Select value...</option>
            {attributeInfo.options.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )
      }
      return (
        <input
          type="text"
          value={condition.value || ""}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={attributeInfo?.example ? `e.g., ${attributeInfo.example}` : "Enter value"}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
        />
      )
    }

    // Conditional/Numeric type with between operator
    if (condition.operator === "between") {
      const [low, high] = Array.isArray(condition.value) ? condition.value : [0, 0]
      return (
        <div className="flex gap-2 flex-1">
          <input
            type="number"
            step="any"
            value={low}
            onChange={(e) => handleValueChange([parseFloat(e.target.value) || 0, high])}
            placeholder="Min"
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <span className="text-gray-400">to</span>
          <input
            type="number"
            step="any"
            value={high}
            onChange={(e) => handleValueChange([low, parseFloat(e.target.value) || 0])}
            placeholder="Max"
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      )
    }

    // Default numeric input
    return (
      <input
        type="number"
        step="any"
        value={condition.value || ""}
        onChange={(e) => handleValueChange(parseFloat(e.target.value) || 0)}
        placeholder={attributeInfo?.example ? `e.g., ${attributeInfo.example}` : "Enter value"}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
      />
    )
  }

  return (
    <div className="flex items-center gap-2 mb-2">
      {showOperator && (
        <select
          value={condition.operator || "equal"}
          onChange={(e) => handleOperatorChange(e.target.value)}
          className="w-28 px-2 py-2 border border-gray-300 rounded-lg text-sm bg-white"
        >
          {operators.map(op => (
            <option key={op.value} value={op.value}>{op.label}</option>
          ))}
        </select>
      )}
      {renderValueInput()}
      <input
        type="number"
        value={condition.impact}
        onChange={(e) => handleImpactChange(parseInt(e.target.value) || 0)}
        placeholder="Points"
        className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
      />
      <button
        onClick={onRemove}
        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}