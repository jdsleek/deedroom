import { LoginForm } from './LoginForm'

function firstParam(v: string | string[] | undefined): string | null {
  if (v == null) return null
  return Array.isArray(v) ? v[0] ?? null : v
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string | string[]; error?: string | string[] }>
}) {
  const params = await searchParams
  const redirectTo = firstParam(params.redirectTo) ?? '/dashboard'
  const errorParam = firstParam(params.error)

  return <LoginForm redirectTo={redirectTo} errorParam={errorParam} />
}
