'use client'

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface SignaturePadProps {
  onSave: (dataUrl: string) => void
  savedData?: string
  className?: string
  compact?: boolean
  label?: string
}

export function SignaturePad({ onSave, savedData, className, compact, label }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(!!savedData)

  const getCtx = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d')
  }, [])

  const getCoords = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    }
  }, [])

  const startDrawing = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      setIsDrawing(true)
      const ctx = getCtx()
      const { x, y } = getCoords(e)
      if (ctx) {
        ctx.beginPath()
        ctx.moveTo(x, y)
      }
    },
    [getCtx, getCoords]
  )

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!isDrawing) return
      const ctx = getCtx()
      const { x, y } = getCoords(e)
      if (ctx) {
        ctx.lineTo(x, y)
        ctx.stroke()
      }
    },
    [isDrawing, getCtx, getCoords]
  )

  const stopDrawing = useCallback(() => {
    setIsDrawing(false)
  }, [])

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    if (dataUrl && dataUrl !== 'data:,' && dataUrl.length > 100) {
      onSave(dataUrl)
      setHasSignature(true)
    }
  }, [onSave])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setHasSignature(false)
    }
  }, [])

  const canvasHeight = compact ? 80 : 200
  const displayLabel = label ?? (compact ? 'Draw your initials' : 'Draw your signature')

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {displayLabel && (
        <p className="text-sm font-medium text-warm-700">{displayLabel}</p>
      )}
      <div className="relative overflow-hidden rounded-2xl border-2 border-warm-200 bg-white">
        <canvas
          ref={canvasRef}
          width={500}
          height={canvasHeight}
          className="w-full max-w-md touch-none"
          style={{ touchAction: 'none' }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="rounded-xl border border-warm-200 px-4 py-2 text-sm font-medium text-warm-600 transition-colors hover:bg-warm-50 hover:border-warm-300"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasSignature}
          className="rounded-xl bg-coral-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-coral-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {compact ? 'Use These Initials' : 'Use This Signature'}
        </button>
      </div>
    </div>
  )
}
