// components/admin/RuleBuilder.tsx
//the page for creation of rules 
"use client"

import { Plus, Trash2 } from "lucide-react"
import ConditionBuilder from "./ConditionBuilder"
import HelpTooltip from "./HelpTooltip"

interface Condition {
  operator: string | null
  value: any
  impact: number
}

interface RuleBuilderProps {
  rule: {
    type: string
    conditions: Condition[]
  }
  index: number
  attributeInfo?: any
  onUpdate: (updated: any) => void
  onRemove: () => void
}

export default function RuleBuilder({ rule, index, attributeInfo, onUpdate, onRemove }: RuleBuilderProps) {
  const ruleTypes = [
    { value: "boolean", label: "Boolean" },
    { value: "categorical", label: "Categorical" },
    { value: "conditional", label: "Conditional" },
  ]

  const addCondition = () => {
    let defaultValue: any = ""
    if (rule.type === "boolean") defaultValue = false
    if (rule.type === "categorical") defaultValue = ""
    if (rule.type === "conditional") defaultValue = 0
    
    onUpdate({
      ...rule,
      conditions: [...rule.conditions, { operator: null, value: defaultValue, impact: 0 }]
    })
  }

  const handleTypeChange = (newType: string) => {
    let defaultValue: any = ""
    if (newType === "boolean") defaultValue = false
    if (newType === "categorical") defaultValue = ""
    if (newType === "conditional") defaultValue = 0
    
    onUpdate({
      type: newType,
      conditions: [{ operator: null, value: defaultValue, impact: 0 }]
    })
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <select
            value={rule.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm"
          >
            {ruleTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <span className="text-xs text-gray-500">Rule #{index + 1}</span>
          {attributeInfo && (
            <HelpTooltip 
              guidance={attributeInfo.guidance}
              example={attributeInfo.example}
              validRange={attributeInfo.validRange}
              possibleValues={attributeInfo.possibleValues || attributeInfo.options}
              expectedFormat={attributeInfo.expectedFormat}
            />
          )}
        </div>
        <button
          onClick={onRemove}
          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        {rule.conditions.map((condition: Condition, condIdx: number) => (
          <ConditionBuilder
            key={condIdx}
            condition={condition}
            ruleType={rule.type}
            attributeInfo={attributeInfo}
            onUpdate={(updated) => {
              const newConditions = [...rule.conditions]
              newConditions[condIdx] = updated
              onUpdate({ ...rule, conditions: newConditions })
            }}
            onRemove={() => {
              const newConditions = rule.conditions.filter((_: any, i: number) => i !== condIdx)
              onUpdate({ ...rule, conditions: newConditions })
            }}
            showOperator={condIdx > 0}
          />
        ))}
      </div>
      
      <button
        onClick={addCondition}
        className="mt-3 text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
      >
        <Plus className="h-3 w-3" />
        Add Condition
      </button>
    </div>
  )
}