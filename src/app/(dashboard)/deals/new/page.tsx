'use client'

import { CreateDealWizard } from '@/components/deals/CreateDealWizard'
import { PageHeader } from '@/components/layout/PageHeader'

export default function NewDealPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Create Deal" description="Set up a new transaction room" />
      <CreateDealWizard />
    </div>
  )
}
