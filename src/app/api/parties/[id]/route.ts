import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { user_id } = body

  const { data: party } = await supabase
    .from('deal_parties')
    .select('deal_id, id')
    .eq('id', id)
    .single()

  if (!party) return NextResponse.json({ error: 'Party not found' }, { status: 404 })

  const { data: deal } = await supabase
    .from('deals')
    .select('created_by')
    .eq('id', party.deal_id)
    .single()

  const isCreator = deal?.created_by === user.id
  const isSelfLinking = user_id === user.id

  if (!isCreator && !isSelfLinking) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('deal_parties')
    .update({ user_id: user_id ?? null })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
