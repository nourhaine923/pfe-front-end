"use client"
import { useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'warning'
  onClose?: () => void
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'error':
        return 'bg-red-500'  
      default:
        return 'bg-purple-600'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return ''
      case 'warning':
        return '⚠'
      case 'error':
        return ''
      default:
        return ''
    }
  }

  const toastContent = (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] animate-fade-in">
      <div className={`${getBgColor()} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm`}>
        <span className="font-bold">{getIcon()}</span>
        <span>{message}</span>
      </div>
    </div>
  )

  if (typeof document !== 'undefined') {
    return createPortal(toastContent, document.body)
  }

  return toastContent
}