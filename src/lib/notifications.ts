import { prisma } from '@/lib/db'

type CreateNotificationInput = {
  userId: string
  type: string
  title: string
  message: string
  link?: string
}

export async function notify(input: CreateNotificationInput) {
  try {
    await prisma.notification.create({ data: input })
  } catch (e) {
    console.error('[Notification]', e)
  }
}

export async function notifyMany(inputs: CreateNotificationInput[]) {
  if (inputs.length === 0) return
  try {
    await prisma.notification.createMany({ data: inputs })
  } catch (e) {
    console.error('[Notification]', e)
  }
}
