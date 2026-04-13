// components/ExportDropdown.tsx

"use client"

import { useState } from "react"
import { Download } from "lucide-react"

interface Props {
  onExportPDF: () => void
  onExportCSV: () => void
}

export default function ExportDropdown({ onExportPDF, onExportCSV }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 border rounded-lg hover:bg-gray-50"
      >
        <Download className="h-4 w-4" />
        Export
      </button>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
            <button
              onClick={() => {
                onExportPDF()
                setIsOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
            >
              Export as PDF
            </button>
            <button
              onClick={() => {
                onExportCSV()
                setIsOpen(false)
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
            >
              Export as CSV
            </button>
          </div>
        </>
      )}
    </div>
  )
}