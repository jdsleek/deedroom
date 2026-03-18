'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

export interface ToastItem {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastProps {
  message?: string
  type?: 'success' | 'error' | 'info'
  onClose?: () => void
  className?: string
}

interface ToastListProps {
  toasts: ToastItem[]
  onClose: (id: string) => void
}

function ToastSingle({ message, type = 'info', onClose, className }: ToastProps) {
  return (
    <div
      className={cn(
        'px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 animate-slide-down min-w-[280px] max-w-[90vw]',
        type === 'success' && 'bg-teal-500 text-white',
        type === 'error' && 'bg-red-500 text-white',
        type === 'info' && 'bg-warm-900 text-white',
        className
      )}
      role="alert"
    >
      <span className="text-sm font-medium flex-1">{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-1 opacity-70 hover:opacity-100 text-lg"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  )
}

export function Toast({ message, type = 'info', onClose, className }: ToastProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <ToastSingle message={message} type={type} onClose={onClose} className={className} />
    </div>
  )
}

export function ToastContainer({ toasts, onClose }: ToastListProps) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 items-center">
      {toasts.map((t) => (
        <ToastSingle key={t.id} message={t.message} type={t.type} onClose={() => onClose(t.id)} />
      ))}
    </div>
  )
}

let toastId = 0
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const addToast = useCallback((item: { type: 'success' | 'error' | 'info'; message: string }) => {
    const id = `toast-${++toastId}`
    setToasts((prev) => [...prev, { ...item, id }])
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)) }, 4000)
  }, [])
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])
  return { toasts, addToast, removeToast }
}
