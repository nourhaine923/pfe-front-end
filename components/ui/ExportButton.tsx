// components/ui/ExportButton.tsx
"use client"

import { useState } from "react"
import { Loader2, FileText } from "lucide-react"
import api from "@/services/api"

interface ExportButtonProps {
  type: "transplantation" | "followup"
  id: string
  filename?: string
  buttonText?: string
  variant?: "primary" | "secondary" | "outline"
  size?: "sm" | "md" | "lg"
  showToast?: (message: string, type: "success" | "error" | "warning") => void
}

export default function ExportButton({ 
  type,
  id,
  filename,
  buttonText = "Export PDF", 
  variant = "outline",
  size = "md",
  showToast
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      const response = await api.get(`/export/${type}/${id}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${filename || type}_${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      showToast?.("PDF exported successfully!", "success")
    } catch (error) {
      console.error("Export error:", error)
      showToast?.("Failed to export PDF", "error")
    } finally {
      setIsExporting(false)
    }
  }

  const getButtonStyles = () => {
    const baseStyles = "inline-flex items-center gap-2 rounded-lg transition-all duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
    
    const sizeStyles = {
      sm: "px-2.5 py-1.5 text-xs",
      md: "px-3.5 py-2 text-sm",
      lg: "px-5 py-2.5 text-base"
    }
    
    const variantStyles = {
      primary: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-sm",
      secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-sm",
      outline: "text-teal-700 bg-teal-50 hover:bg-teal-100 border border-gray-50 focus:ring-teal-500"
    }
    
    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={getButtonStyles()}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileText className="h-4 w-4" />
      )}
      {isExporting ? "Generating..." : buttonText}
    </button>
  )
}