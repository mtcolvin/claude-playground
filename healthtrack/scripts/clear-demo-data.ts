/**
 * Script to clear demo data for testing
 * Run with: npx tsx scripts/clear-demo-data.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDemoData() {
  try {
    console.log('🗑️  Clearing demo data...')

    // Find Walt Disney user (or the demo user)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'walt' } },
          { name: { contains: 'Walt Disney' } }
        ]
      }
    })

    if (!user) {
      console.log('❌ Demo user not found')
      return
    }

    console.log(`Found user: ${user.name} (${user.email})`)
    console.log(`User ID: ${user.id}`)

    // Delete all health metrics
    const metricsDeleted = await prisma.healthMetric.deleteMany({
      where: { userId: user.id }
    })
    console.log(`✅ Deleted ${metricsDeleted.count} health metrics`)

    // Delete all medical files
    const filesDeleted = await prisma.medicalFile.deleteMany({
      where: { userId: user.id }
    })
    console.log(`✅ Deleted ${filesDeleted.count} medical files`)

    // Delete all lab results
    const labsDeleted = await prisma.labResult.deleteMany({
      where: { userId: user.id }
    })
    console.log(`✅ Deleted ${labsDeleted.count} lab results`)

    // Delete all medications
    const medsDeleted = await prisma.medication.deleteMany({
      where: { userId: user.id }
    })
    console.log(`✅ Deleted ${medsDeleted.count} medications`)

    // Delete all appointments
    const appointmentsDeleted = await prisma.appointment.deleteMany({
      where: { userId: user.id }
    })
    console.log(`✅ Deleted ${appointmentsDeleted.count} appointments`)

    // Delete all health goals
    const goalsDeleted = await prisma.healthGoal.deleteMany({
      where: { userId: user.id }
    })
    console.log(`✅ Deleted ${goalsDeleted.count} health goals`)

    console.log('\n✨ Demo data cleared successfully!')
  } catch (error) {
    console.error('❌ Error clearing demo data:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

clearDemoData()
