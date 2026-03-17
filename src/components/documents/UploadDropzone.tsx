'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Upload, FileText, X } from 'lucide-react'
import type { DocCategory } from '@/types'

const ACCEPTED_TYPES = {
  'application/pdf': ['.pdf'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
}

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

const DOC_CATEGORIES: { value: DocCategory; label: string }[] = [
  { value: 'id', label: 'ID Document' },
  { value: 'cac', label: 'CAC' },
  { value: 'survey', label: 'Survey' },
  { value: 'agreement', label: 'Agreement' },
  { value: 'receipt', label: 'Receipt' },
  { value: 'checklist', label: 'Checklist' },
  { value: 'approval', label: 'Approval' },
  { value: 'other', label: 'Other' },
]

export interface UploadConfig {
  category: DocCategory
  permission: 'view_only' | 'download'
  watermark: boolean
  expiresAt?: string
}

interface UploadDropzoneProps {
  onFileSelect: (file: File, config: UploadConfig) => void
  config: UploadConfig
  onConfigChange: (config: UploadConfig) => void
  disabled?: boolean
  className?: string
}

export function UploadDropzone({
  onFileSelect,
  config,
  onConfigChange,
  disabled,
  className,
}: UploadDropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) onFileSelect(file, config)
    },
    [config, onFileSelect]
  )

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    maxFiles: 1,
    disabled,
  })

  const selectedFile = acceptedFiles[0]

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
          isDragActive ? 'border-gold-400 bg-gold-50' : 'border-navy-200 bg-cream-100 hover:border-navy-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto size-10 text-navy-400 mb-2" />
        <p className="text-navy-600 font-medium">
          {isDragActive ? 'Drop your file here' : 'Drag & drop or click to upload'}
        </p>
        <p className="text-sm text-navy-400 mt-1">
          PDF, DOCX, JPG, PNG, WEBP — max 20MB
        </p>
      </div>

      {selectedFile && (
        <div className="flex items-center gap-3 p-3 bg-cream-200 rounded-lg">
          <FileText className="size-5 text-navy-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-navy-800 truncate">{selectedFile.name}</p>
            <p className="text-sm text-navy-400">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Category</label>
          <select
            value={config.category}
            onChange={(e) => onConfigChange({ ...config, category: e.target.value as DocCategory })}
            className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-navy-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          >
            {DOC_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">Permission</label>
          <select
            value={config.permission}
            onChange={(e) => onConfigChange({ ...config, permission: e.target.value as 'view_only' | 'download' })}
            className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-navy-800 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          >
            <option value="view_only">View only</option>
            <option value="download">Download</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.watermark}
              onChange={(e) => onConfigChange({ ...config, watermark: e.target.checked })}
              className="rounded border-navy-300 text-gold-600 focus:ring-gold-500"
            />
            <span className="text-sm font-medium text-navy-700">Apply DRAFT watermark</span>
          </label>
        </div>
      </div>
    </div>
  )
}
