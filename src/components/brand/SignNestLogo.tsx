import Image from 'next/image'
import { cn } from '@/lib/utils'

const LOGO_SRC = '/brand/signnest-logo.png'
const INTRINSIC_W = 645
const INTRINSIC_H = 1024

export type SignNestLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero'

const sizeClass: Record<SignNestLogoSize, string> = {
  xs: 'h-6 w-24',
  sm: 'h-7 w-28',
  md: 'h-9 w-36',
  lg: 'h-11 w-44',
  xl: 'h-14 w-56',
  hero: 'h-16 w-64 sm:h-20 sm:w-80',
}

/**
 * Client-approved SignNest brand logo (PNG on black).
 * Uses object-cover to crop the vertical padding from the source image
 * so the house + wordmark fills the visible area.
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
      className={cn('object-cover object-[center_33%]', sizeClass[size], className)}
    />
  )
}
