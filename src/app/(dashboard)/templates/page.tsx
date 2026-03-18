'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FileText, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const TEMPLATES = [
  { id: 'tenancy', name: 'Tenancy Agreement', desc: 'Standard residential tenancy agreement with customizable terms.' },
  { id: 'offer_lease', name: 'Offer to Lease', desc: 'Formal offer letter for leasing commercial or residential property.' },
  { id: 'inspection', name: 'Inspection Checklist', desc: 'Property condition checklist for move-in/move-out inspections.' },
  { id: 'payment_schedule', name: 'Payment Schedule', desc: 'Structured payment plan with milestones and due dates.' },
  { id: 'sales_offer', name: 'Sales Offer Letter', desc: 'Formal offer to purchase residential or commercial property.' },
  { id: 'deed_assignment', name: 'Deed of Assignment', desc: 'Transfer of property ownership from seller to buyer.' },
]

export default function TemplatesPage() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (templateId: string) => {
    setDownloading(templateId)
    try {
      const res = await fetch(`/api/templates?type=${templateId}`)
      if (res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${templateId}-template.pdf`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch { /* ignore */ }
    finally { setDownloading(null) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy-500">Document Templates</h1>
          <p className="text-warm-500 text-sm mt-1">Pre-built templates for common real estate documents</p>
        </div>
        <Link href="/deals/new">
          <Button variant="primary" className="rounded-xl">New Deal</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <div key={t.id} className="rounded-2xl border border-warm-200 bg-white p-5 shadow-xs hover:shadow-sm transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-coral-50 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-coral-500" />
            </div>
            <h3 className="font-display font-semibold text-navy-500">{t.name}</h3>
            <p className="text-sm text-warm-500 mt-1">{t.desc}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-1.5"
              isLoading={downloading === t.id}
              onClick={() => handleDownload(t.id)}
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
