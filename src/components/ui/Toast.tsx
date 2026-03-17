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
  const bgColor =
    type === 'success'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : type === 'error'
        ? 'bg-red-50 text-red-700 border-red-200'
        : 'bg-blue-50 text-blue-700 border-blue-200'

  return (
    <div
      className={cn(
        'fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg border shadow-raised flex items-center gap-3',
        bgColor,
        className
      )}
      role="alert"
    >
      <span>{message}</span>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 opacity-70 hover:opacity-100"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  )
}

export function Toast({ message, type = 'info', onClose, className }: ToastProps) {
  return <ToastSingle message={message} type={type} onClose={onClose} className={className} />
}

export function ToastContainer({ toasts, onClose }: ToastListProps) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <ToastSingle
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => onClose(t.id)}
          className={
            t.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : t.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
          }
        />
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
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, addToast, removeToast }
}
