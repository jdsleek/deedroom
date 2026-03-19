import Image from 'next/image'
import { cn } from '@/lib/utils'

/** Client-approved asset: house + check + SignNest wordmark on black */
const LOGO_SRC = '/brand/signnest-logo.png'
const INTRINSIC_W = 645
const INTRINSIC_H = 1024

export type SignNestLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero'

const heightClass: Record<SignNestLogoSize, string> = {
  xs: 'h-6',
  sm: 'h-7',
  md: 'h-9',
  lg: 'h-11',
  xl: 'h-14',
  hero: 'h-16 sm:h-20',
}

/**
 * Approved SignNest brand logo (PNG). Use on dark backgrounds for correct contrast.
 */
export function SignNestLogo({
  size = 'md',
  className,
  priority = false,
}: {
  size?: SignNestLogoSize
  className?: string
  priority?: boolean
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt="SignNest"
      width={INTRINSIC_W}
      height={INTRINSIC_H}
      priority={priority}
      className={cn('w-auto max-w-[min(100%,280px)] object-contain object-left', heightClass[size], className)}
    />
  )
}
