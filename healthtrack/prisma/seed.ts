import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Hash password for demo users
  const passwordHash = await bcrypt.hash('Demo123!@#', 12)

  // Create demo users
  console.log('👤 Creating demo users...')
  const demoPatient = await prisma.user.upsert({
    where: { email: 'demo@healthtrack.com' },
    update: {},
    create: {
      email: 'demo@healthtrack.com',
      passwordHash,
      name: 'Demo Patient',
      role: 'PATIENT',
      emailVerified: new Date(),
      isActive: true,
    },
  })

  const demoProvider = await prisma.user.upsert({
    where: { email: 'doctor@healthtrack.com' },
    update: {},
    create: {
      email: 'doctor@healthtrack.com',
      passwordHash,
      name: 'Dr. Sarah Johnson',
      role: 'PROVIDER',
      emailVerified: new Date(),
      isActive: true,
    },
  })

  console.log(`✅ Created users: ${demoPatient.email}, ${demoProvider.email}`)

  // Create patient profile
  console.log('📋 Creating patient profile...')
  const profile = await prisma.patientProfile.upsert({
    where: { userId: demoPatient.id },
    update: {},
    create: {
      userId: demoPatient.id,
      dateOfBirth: new Date('1985-06-15'),
      gender: 'male',
      bloodType: 'A+',
      height: 175, // cm
      weight: 80, // kg
      phone: '+1-555-0100',
      address: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      country: 'USA',
      smokingStatus: 'never',
      alcoholUse: 'occasional',
      exerciseLevel: 'moderate',
    },
  })

  // Create health metrics
  console.log('📊 Creating health metrics...')
  const metrics = [
    // Blood Pressure readings over 6 months
    { type: 'blood_pressure_systolic', value: 125, date: new Date('2024-05-01') },
    { type: 'blood_pressure_diastolic', value: 82, date: new Date('2024-05-01') },
    { type: 'blood_pressure_systolic', value: 122, date: new Date('2024-06-01') },
    { type: 'blood_pressure_diastolic', value: 80, date: new Date('2024-06-01') },
    { type: 'blood_pressure_systolic', value: 120, date: new Date('2024-07-01') },
    { type: 'blood_pressure_diastolic', value: 78, date: new Date('2024-07-01') },
    { type: 'blood_pressure_systolic', value: 118, date: new Date('2024-08-01') },
    { type: 'blood_pressure_diastolic', value: 76, date: new Date('2024-08-01') },

    // Glucose readings
    { type: 'glucose', value: 105, date: new Date('2024-05-01'), notes: 'Fasting' },
    { type: 'glucose', value: 98, date: new Date('2024-06-15'), notes: 'Fasting' },
    { type: 'glucose', value: 92, date: new Date('2024-08-01'), notes: 'Fasting' },

    // Weight/BMI trends
    { type: 'weight', value: 85, date: new Date('2024-05-01') },
    { type: 'weight', value: 83, date: new Date('2024-06-01') },
    { type: 'weight', value: 81, date: new Date('2024-07-01') },
    { type: 'weight', value: 80, date: new Date('2024-08-01') },

    // Cholesterol panel
    { type: 'cholesterol_total', value: 195, date: new Date('2024-06-01') },
    { type: 'cholesterol_ldl', value: 115, date: new Date('2024-06-01') },
    { type: 'cholesterol_hdl', value: 58, date: new Date('2024-06-01') },
    { type: 'triglycerides', value: 142, date: new Date('2024-06-01') },

    // HbA1c
    { type: 'hba1c', value: 6.2, date: new Date('2024-05-01') },
    { type: 'hba1c', value: 5.9, date: new Date('2024-08-01') },
  ]

  for (const metric of metrics) {
    await prisma.healthMetric.create({
      data: {
        userId: demoPatient.id,
        type: metric.type,
        value: metric.value,
        unit: getUnitForType(metric.type),
        date: metric.date,
        notes: metric.notes,
      },
    })
  }
  console.log(`✅ Created ${metrics.length} health metrics`)

  // Create medications
  console.log('💊 Creating medications...')
  await prisma.medication.create({
    data: {
      userId: demoPatient.id,
      name: 'Metformin',
      genericName: 'Metformin Hydrochloride',
      dosage: '500mg',
      frequency: 'Twice daily',
      route: 'Oral',
      startDate: new Date('2024-01-01'),
      prescribedBy: 'Dr. Sarah Johnson',
      purpose: 'Type 2 Diabetes Management',
      sideEffects: ['Nausea', 'Diarrhea'],
      instructions: 'Take with meals',
      isActive: true,
    },
  })

  // Create allergies
  console.log('🤧 Creating allergies...')
  await prisma.allergy.createMany({
    data: [
      {
        userId: demoPatient.id,
        allergen: 'Penicillin',
        type: 'drug',
        reaction: ['Rash', 'Hives'],
        severity: 'moderate',
        isActive: true,
      },
      {
        userId: demoPatient.id,
        allergen: 'Peanuts',
        type: 'food',
        reaction: ['Anaphylaxis'],
        severity: 'severe',
        isActive: true,
      },
    ],
  })

  // Create conditions
  console.log('🏥 Creating medical conditions...')
  await prisma.condition.createMany({
    data: [
      {
        userId: demoPatient.id,
        name: 'Type 2 Diabetes',
        icdCode: 'E11',
        diagnosedDate: new Date('2023-06-15'),
        status: 'active',
        severity: 'moderate',
        diagnosedBy: 'Dr. Sarah Johnson',
      },
      {
        userId: demoPatient.id,
        name: 'Hypertension',
        icdCode: 'I10',
        diagnosedDate: new Date('2023-03-20'),
        status: 'active',
        severity: 'mild',
        diagnosedBy: 'Dr. Sarah Johnson',
      },
    ],
  })

  // Create lab result
  console.log('🔬 Creating lab results...')
  await prisma.labResult.createMany({
    data: [
      {
        userId: demoPatient.id,
        testName: 'Glucose',
        value: 92,
        unit: 'mg/dL',
        referenceRangeLow: 70,
        referenceRangeHigh: 100,
        status: 'normal',
        date: new Date('2024-08-01'),
        orderedBy: 'Dr. Sarah Johnson',
        performedBy: 'Quest Diagnostics',
      },
      {
        userId: demoPatient.id,
        testName: 'HbA1c',
        value: 5.9,
        unit: '%',
        referenceRangeLow: 4.0,
        referenceRangeHigh: 5.6,
        status: 'normal',
        date: new Date('2024-08-01'),
        orderedBy: 'Dr. Sarah Johnson',
        performedBy: 'Quest Diagnostics',
      },
      {
        userId: demoPatient.id,
        testName: 'Total Cholesterol',
        value: 195,
        unit: 'mg/dL',
        referenceRangeLow: 125,
        referenceRangeHigh: 200,
        status: 'normal',
        date: new Date('2024-06-01'),
        orderedBy: 'Dr. Sarah Johnson',
        performedBy: 'Quest Diagnostics',
      },
    ],
  })

  // Create appointments
  console.log('📅 Creating appointments...')
  await prisma.appointment.createMany({
    data: [
      {
        userId: demoPatient.id,
        title: 'Annual Physical',
        provider: 'Dr. Sarah Johnson',
        specialty: 'Primary Care',
        location: 'Main Street Clinic',
        date: new Date('2024-09-15T10:00:00'),
        duration: 60,
        type: 'in-person',
        status: 'completed',
        reason: 'Annual check-up',
      },
      {
        userId: demoPatient.id,
        title: 'Follow-up: Diabetes',
        provider: 'Dr. Sarah Johnson',
        specialty: 'Endocrinology',
        location: 'Main Street Clinic',
        date: new Date('2024-12-15T14:00:00'),
        duration: 30,
        type: 'in-person',
        status: 'scheduled',
        reason: 'Review diabetes management',
      },
    ],
  })

  // Create immunizations
  console.log('💉 Creating immunizations...')
  await prisma.immunization.createMany({
    data: [
      {
        userId: demoPatient.id,
        vaccineName: 'COVID-19 Vaccine',
        cvxCode: '208',
        date: new Date('2024-01-15'),
        provider: 'CVS Pharmacy',
        lotNumber: 'AB12345',
        site: 'Left arm',
        route: 'Intramuscular',
        doseNumber: 3,
      },
      {
        userId: demoPatient.id,
        vaccineName: 'Influenza Vaccine',
        cvxCode: '141',
        date: new Date('2024-10-01'),
        provider: 'Main Street Clinic',
        lotNumber: 'FLU2024',
        site: 'Left arm',
        route: 'Intramuscular',
        doseNumber: 1,
      },
    ],
  })

  // Create emergency contact
  console.log('🚨 Creating emergency contact...')
  await prisma.emergencyContact.create({
    data: {
      userId: demoPatient.id,
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1-555-0101',
      email: 'jane.doe@example.com',
      address: '123 Main Street, San Francisco, CA 94102',
      isPrimary: true,
    },
  })

  // Create care team member
  console.log('👨‍⚕️ Creating care team...')
  await prisma.careTeamMember.createMany({
    data: [
      {
        userId: demoPatient.id,
        name: 'Dr. Sarah Johnson',
        role: 'Primary Care Physician',
        specialty: 'Family Medicine',
        phone: '+1-555-0200',
        email: 'sjohnson@clinic.com',
        facility: 'Main Street Clinic',
        address: '456 Main Street, San Francisco, CA',
      },
      {
        userId: demoPatient.id,
        name: 'Dr. Michael Chen',
        role: 'Endocrinologist',
        specialty: 'Endocrinology',
        phone: '+1-555-0201',
        email: 'mchen@clinic.com',
        facility: 'Diabetes Center',
        address: '789 Health Ave, San Francisco, CA',
      },
    ],
  })

  // Create health goal
  console.log('🎯 Creating health goals...')
  await prisma.healthGoal.create({
    data: {
      userId: demoPatient.id,
      title: 'Lose 10 kg',
      description: 'Achieve healthy weight through diet and exercise',
      category: 'weight',
      targetValue: 70,
      currentValue: 80,
      unit: 'kg',
      startDate: new Date('2024-05-01'),
      targetDate: new Date('2024-12-31'),
      status: 'active',
      progress: 50,
    },
  })

  // Create mood entries
  console.log('😊 Creating mood entries...')
  await prisma.moodEntry.createMany({
    data: [
      {
        userId: demoPatient.id,
        date: new Date('2024-08-01'),
        mood: 'good',
        sleepQuality: 'good',
        sleepHours: 7.5,
        stressLevel: 'low',
        energy: 8,
        anxiety: 2,
        activities: ['Exercise', 'Meditation'],
        triggers: [],
      },
      {
        userId: demoPatient.id,
        date: new Date('2024-08-02'),
        mood: 'excellent',
        sleepQuality: 'excellent',
        sleepHours: 8,
        stressLevel: 'low',
        energy: 9,
        anxiety: 1,
        activities: ['Exercise', 'Social'],
        triggers: [],
      },
    ],
  })

  // Create notifications
  console.log('🔔 Creating notifications...')
  await prisma.notification.createMany({
    data: [
      {
        userId: demoPatient.id,
        type: 'appointment_reminder',
        title: 'Upcoming Appointment',
        message: 'You have an appointment with Dr. Sarah Johnson tomorrow at 2:00 PM',
        read: false,
      },
      {
        userId: demoPatient.id,
        type: 'medication_reminder',
        title: 'Time to Take Medication',
        message: 'Take your Metformin 500mg',
        read: false,
      },
    ],
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📧 Demo Login Credentials:')
  console.log('   Email: demo@healthtrack.com')
  console.log('   Password: Demo123!@#')
  console.log('\n🌐 Start the app with: npm run dev')
}

function getUnitForType(type: string): string {
  const units: Record<string, string> = {
    blood_pressure_systolic: 'mmHg',
    blood_pressure_diastolic: 'mmHg',
    heart_rate: 'bpm',
    glucose: 'mg/dL',
    hba1c: '%',
    cholesterol_total: 'mg/dL',
    cholesterol_ldl: 'mg/dL',
    cholesterol_hdl: 'mg/dL',
    triglycerides: 'mg/dL',
    weight: 'kg',
    bmi: 'kg/m²',
    temperature: '°C',
    oxygen_saturation: '%',
  }
  return units[type] || ''
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
