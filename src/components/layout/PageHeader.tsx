import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, action, className }: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)}>
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-600">{title}</h1>
        {description && <p className="mt-1 text-sm text-navy-400">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
