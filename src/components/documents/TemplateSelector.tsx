'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { TemplateField } from '@/lib/templates'

interface TemplateMeta {
  id: string
  name: string
  category: string
  description: string
  dealType: 'rent' | 'sale' | 'both'
  fields: TemplateField[]
}

interface TemplateSelectorProps {
  dealId: string
  dealType: 'rent' | 'sale'
  onGenerated: () => void
  onClose: () => void
}

const CATEGORY_ICONS: Record<string, string> = {
  agreement: '📄',
  checklist: '✅',
  receipt: '🧾',
}

export function TemplateSelector({ dealId, dealType, onGenerated, onClose }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<TemplateMeta | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.json())
      .then(({ data }) => {
        const filtered = (data as TemplateMeta[]).filter(
          (t) => t.dealType === 'both' || t.dealType === dealType
        )
        setTemplates(filtered)
      })
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false))
  }, [dealType])

  const handleSelect = (template: TemplateMeta) => {
    setSelected(template)
    setError(null)
    const init: Record<string, string> = {}
    for (const f of template.fields) {
      init[f.key] = ''
    }
    setValues(init)
  }

  const handleFieldChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleGenerate = async () => {
    if (!selected) return
    setError(null)
    setGenerating(true)

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: selected.id, dealId, values }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Generation failed')
        return
      }

      onGenerated()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    )
  }

  if (selected) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-sm font-medium text-warm-600 hover:text-warm-800 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to templates
        </button>

        <div>
          <h3 className="font-display text-lg font-bold text-warm-900">{selected.name}</h3>
          <p className="mt-1 text-sm text-warm-500">{selected.description}</p>
        </div>

        <div className="space-y-4">
          {selected.fields.map((field) => (
            <div key={field.key}>
              <label htmlFor={field.key} className="mb-1.5 block text-sm font-medium text-warm-700">
                {field.label}
                {field.required && <span className="ml-0.5 text-coral-500">*</span>}
              </label>
              <input
                id={field.key}
                type={field.type === 'date' ? 'date' : field.type === 'number' || field.type === 'currency' ? 'text' : 'text'}
                inputMode={field.type === 'currency' || field.type === 'number' ? 'numeric' : undefined}
                placeholder={field.placeholder}
                value={values[field.key] || ''}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
                className="w-full rounded-xl border border-warm-200 bg-warm-50/50 px-4 py-2.5 text-sm text-warm-900 placeholder:text-warm-400 focus:border-coral-400 focus:outline-none focus:ring-2 focus:ring-coral-500/20 transition-colors"
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleGenerate} isLoading={generating} className="flex-1">
            Generate Document
          </Button>
          <Button variant="outline" onClick={onClose} disabled={generating}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  if (templates.length === 0) {
    return (
      <div className="py-12 text-center text-warm-500">
        No templates available for this deal type.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-warm-500">
        Choose a template to auto-generate a document for this deal.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleSelect(t)}
            className="group flex flex-col rounded-2xl border border-warm-200 bg-white p-4 text-left transition-all hover:border-coral-300 hover:shadow-md hover:shadow-coral-500/5"
          >
            <div className="flex items-start justify-between">
              <span className="text-2xl">{CATEGORY_ICONS[t.category] || '📋'}</span>
              <span className="rounded-full bg-warm-100 px-2.5 py-0.5 text-xs font-medium text-warm-600">
                {t.category}
              </span>
            </div>
            <h4 className="mt-3 font-display text-[15px] font-bold text-warm-900 group-hover:text-coral-600 transition-colors">
              {t.name}
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-warm-500">{t.description}</p>
            <div className="mt-3 flex items-center text-xs text-warm-400">
              <span>{t.fields.length} fields</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
