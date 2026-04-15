// components/admin/AttributeSelector.tsx
"use client"

import { Info } from "lucide-react"

interface AttributeSelectorProps {
  barem: any
  selectedKey: string
  attributes: any[]
  onSelect: (key: string) => void
}

export default function AttributeSelector({ barem, selectedKey, attributes, onSelect }: AttributeSelectorProps) {
  const selectedAttribute = attributes.find(a => a.key === selectedKey)

  if (barem) {
    return (
      <div className="p-3 bg-gray-100 rounded-lg">
        <p className="font-medium">{barem.key.replace(/_/g, " ").toUpperCase()}</p>
        <p className="text-xs text-gray-500 mt-1">Cannot change attribute after creation</p>
      </div>
    )
  }

  return (
    <div>
      <select
        value={selectedKey}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
      >
        <option value="">Select an attribute</option>
        {attributes.map((attr: any) => (
          <option key={attr.key} value={attr.key}>
            {attr.label} ({attr.type}{attr.unit ? `, ${attr.unit}` : ""})
          </option>
        ))}
      </select>
      
      {selectedAttribute && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">{selectedAttribute.description}</p>
              {selectedAttribute.guidance && (
                <p className="text-xs text-blue-600 mt-1">💡 {selectedAttribute.guidance}</p>
              )}
              {selectedAttribute.example && (
                <p className="text-xs text-blue-600 mt-1">📝 Example: {selectedAttribute.example}</p>
              )}
              {selectedAttribute.validRange && (
                <p className="text-xs text-blue-600 mt-1">📊 Valid range: {selectedAttribute.validRange}</p>
              )}
              {selectedAttribute.options && selectedAttribute.options.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">🔽 Options: {selectedAttribute.options.join(", ")}</p>
              )}
              {selectedAttribute.possibleValues && (
                <p className="text-xs text-blue-600 mt-1">📋 Possible values: {selectedAttribute.possibleValues.join(", ")}</p>
              )}
              {selectedAttribute.expectedFormat && (
                <p className="text-xs text-blue-600 mt-1">📐 Format: {selectedAttribute.expectedFormat}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}