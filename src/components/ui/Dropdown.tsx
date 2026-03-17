'use client'

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface DropdownProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  className?: string
}

export function Dropdown({ trigger, children, align = 'right', className }: DropdownProps) {
  return (
    <div className={cn('relative group', className)}>
      {trigger}
      <div
        className={cn(
          'absolute top-full mt-1 z-50 hidden group-hover:block group-focus-within:block',
          'min-w-[160px] py-1 bg-white rounded-lg shadow-raised border border-cream-200',
          align === 'right' ? 'right-0' : 'left-0'
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function DropdownItem({
  children,
  onClick,
  className,
}: {
  children: ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left px-4 py-2 text-sm text-navy-600 hover:bg-cream-100 transition-colors',
        className
      )}
    >
      {children}
    </button>
  )
}
