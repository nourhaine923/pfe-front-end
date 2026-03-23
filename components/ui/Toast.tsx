"use client"
import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning'
}

export default function Toast({ message, type = 'error' }: ToastProps) {
  // Define colors based on type
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
      default:
        return 'bg-red-500'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'warning':
        return '⚠'
      case 'error':
      default:
        return '✗'
    }
  }

  return (
    <div className={`${getBgColor()} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-fade-in`}>
      <span className="text-lg font-bold">{getIcon()}</span>
      <span>{message}</span>
    </div>
  )
}