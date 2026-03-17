'use client'

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface SignaturePadProps {
  onSave: (dataUrl: string) => void
  savedData?: string
  className?: string
}

export function SignaturePad({ onSave, savedData, className }: SignaturePadProps) {
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

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="relative border-2 border-cream-300 rounded-lg overflow-hidden bg-cream-50">
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="text-sm text-navy-400 hover:text-navy-600"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasSignature}
          className="text-sm text-gold-600 hover:text-gold-700 font-medium disabled:opacity-50"
        >
          Use This Signature
        </button>
      </div>
    </div>
  )
}
