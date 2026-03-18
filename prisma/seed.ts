import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'test@deedroom.local'
  const password = 'password123'
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('Seed user already exists:', email)
    return
  }
  const hashed = await hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      name: 'Dev User',
      password: hashed,
    },
  })
  await prisma.profile.create({
    data: {
      id: user.id,
      fullName: 'Dev User',
      email,
    },
  })
  console.log('Created dev user:', email, '| password:', password)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
