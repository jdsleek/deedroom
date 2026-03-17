import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const PROTECTED_PREFIXES = ['/dashboard', '/deals', '/settings']
const AUTH_ROUTES = ['/login', '/register']
const PUBLIC_PREFIXES = ['/invite', '/api/invites', '/api/auth']

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function isPublicRoute(pathname: string) {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  })
  const user = token
  const pathname = request.nextUrl.pathname

  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  if (isProtected(pathname) && !user) {
    const redirectTo = new URL('/login', request.url)
    redirectTo.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectTo)
  }

  if (isAuthRoute(pathname) && user) {
    const redirectTo = request.nextUrl.searchParams.get('redirectTo') || '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  }

  if (pathname === '/' && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (pathname === '/' && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
