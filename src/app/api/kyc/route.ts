import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { saveFile } from '@/lib/storage'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
    select: { kycStatus: true, kycData: true },
  })

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({
    data: {
      kyc_status: profile.kycStatus,
      kyc_data: profile.kycData,
    },
  })
}

const VALID_ID_TYPES = ['nin', 'voters_card', 'drivers_license', 'international_passport'] as const

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  const formData = await request.formData()
  const idType = formData.get('id_type') as string | null
  const idNumber = formData.get('id_number') as string | null
  const idDocument = formData.get('id_document') as File | null
  const selfie = formData.get('selfie') as File | null
  const companyName = formData.get('company_name') as string | null
  const companyRcNumber = formData.get('company_rc_number') as string | null

  if (!idType || !VALID_ID_TYPES.includes(idType as typeof VALID_ID_TYPES[number])) {
    return NextResponse.json({ error: 'Invalid or missing id_type' }, { status: 400 })
  }
  if (!idNumber?.trim()) {
    return NextResponse.json({ error: 'id_number is required' }, { status: 400 })
  }
  if (!idDocument) {
    return NextResponse.json({ error: 'id_document file is required' }, { status: 400 })
  }
  if (!selfie) {
    return NextResponse.json({ error: 'selfie file is required' }, { status: 400 })
  }

  const ext = (f: File) => f.name.split('.').pop()?.toLowerCase() ?? 'bin'
  const ts = Date.now()

  const idDocPath = `kyc/${userId}/id_document_${ts}.${ext(idDocument)}`
  await saveFile(idDocPath, await idDocument.arrayBuffer())

  const selfiePath = `kyc/${userId}/selfie_${ts}.${ext(selfie)}`
  await saveFile(selfiePath, await selfie.arrayBuffer())

  const kycData = {
    id_type: idType,
    id_number: idNumber.trim(),
    id_document_path: idDocPath,
    selfie_path: selfiePath,
    company_name: companyName?.trim() || null,
    company_rc_number: companyRcNumber?.trim() || null,
    submitted_at: new Date().toISOString(),
  }

  const updated = await prisma.profile.update({
    where: { id: userId },
    data: {
      kycData,
      kycStatus: 'submitted',
    },
    select: { kycStatus: true, kycData: true },
  })

  return NextResponse.json({
    data: {
      kyc_status: updated.kycStatus,
      kyc_data: updated.kycData,
    },
  })
}
