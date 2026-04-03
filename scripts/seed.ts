import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const TEST_USERS = [
  { email: 'test@signnest.local', name: 'Dev User', role: 'realtor', phone: '+2348012345678' },
  { email: 'landlord@signnest.local', name: 'Mrs Adebayo', role: 'landlord', phone: '+2348023456789' },
  { email: 'tenant@signnest.local', name: 'Chinedu Okafor', role: 'tenant', phone: '+2348034567890' },
  { email: 'lawyer@signnest.local', name: 'Barrister Eze', role: 'lawyer', phone: '+2348045678901' },
  { email: 'admin@signnest.local', name: 'Admin User', role: 'admin', phone: '+2348056789012' },
]

async function main() {
  const password = 'password123'
  const hashed = await hash(password, 10)

  for (const u of TEST_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })
    if (existing) {
      console.log('  exists:', u.email, `(${u.role})`)
      continue
    }

    const user = await prisma.user.create({
      data: {
        email: u.email,
        name: u.name,
        password: hashed,
        phone: u.phone,
      },
    })

    await prisma.profile.create({
      data: {
        id: user.id,
        fullName: u.name,
        email: u.email,
        phone: u.phone,
        role: u.role,
      },
    })

    console.log('  created:', u.email, `(${u.role})`)
  }

  console.log('\nAll test users ready. Password for all: password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
