// components/admin/HelpTooltip.tsx
"use client"

import { useState } from "react"
import { HelpCircle } from "lucide-react"

interface HelpTooltipProps {
  guidance?: string
  example?: string
  validRange?: string
  possibleValues?: string[]
  expectedFormat?: string
}

export default function HelpTooltip({ 
  guidance, 
  example, 
  validRange, 
  possibleValues, 
  expectedFormat 
}: HelpTooltipProps) {
  const [show, setShow] = useState(false)
  
  if (!guidance && !example && !validRange && !possibleValues && !expectedFormat) return null
  
  return (
    <div className="relative inline-block ml-1">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-gray-400 hover:text-teal-600 transition-colors"
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
      {show && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
          {guidance && <p className="mb-2">{guidance}</p>}
          {example && (
            <p className="text-gray-300">
              <span className="font-semibold">Example:</span> {example}
            </p>
          )}
          {validRange && (
            <p className="text-gray-300">
              <span className="font-semibold">Range:</span> {validRange}
            </p>
          )}
          {possibleValues && possibleValues.length > 0 && (
            <p className="text-gray-300">
              <span className="font-semibold">Possible values:</span> {possibleValues.join(", ")}
            </p>
          )}
          {expectedFormat && (
            <p className="text-gray-300">
              <span className="font-semibold">Format:</span> {expectedFormat}
            </p>
          )}
          <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  )
}