import { PrismaClient, Role, HospitalType, DoctorAvailabilityStatus, MedicineAvailabilityStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function cleanCollection(modelName: string) {
  try {
    const items = await (prisma as any)[modelName].findMany({ select: { id: true } });
    for (const item of items) {
      await (prisma as any)[modelName].delete({ where: { id: item.id } });
    }
  } catch (err) {
    // collection might be empty or missing
  }
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data individually to support standalone local MongoDB without replica set
  await cleanCollection('hospitalMedicine');
  await cleanCollection('hospitalService');
  await cleanCollection('doctor');
  await cleanCollection('medicine');
  await cleanCollection('hospital');
  await cleanCollection('user');

  // 1. Create Users
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@healthcare.gov.in',
      name: 'System Admin',
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff.gondal@healthcare.gov.in',
      name: 'Staff Gondal PHC',
      password: hashedPassword,
      role: Role.HOSPITAL_STAFF,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'Ramesh Patel',
      password: hashedPassword,
      role: Role.USER,
    },
  });

  console.log('✅ Created initial users (Admin, Staff, Patient).');

  // 2. Create Hospitals
  const hospGondal = await prisma.hospital.create({
    data: {
      name: 'PHC Gondal Central',
      type: HospitalType.PHC,
      address: 'Near Station Road, Gondal',
      district: 'Rajkot',
      state: 'Gujarat',
      pincode: '360311',
      latitude: 22.3039,
      longitude: 70.8022,
      phone: '+91 2825 220011',
      email: 'phc.gondal@gujarat.gov.in',
      openingTime: '08:00 AM',
      closingTime: '08:00 PM',
      emergencyAvailable: true,
      isActive: true,
    },
  });

  const hospJetpur = await prisma.hospital.create({
    data: {
      name: 'CHC Jetpur Community Center',
      type: HospitalType.CHC,
      address: 'Navagadh Road, Jetpur',
      district: 'Rajkot',
      state: 'Gujarat',
      pincode: '360370',
      latitude: 22.3585,
      longitude: 70.7481,
      phone: '+91 2823 221122',
      email: 'chc.jetpur@gujarat.gov.in',
      openingTime: '08:00 AM',
      closingTime: '09:00 PM',
      emergencyAvailable: true,
      isActive: true,
    },
  });

  const hospCivilRajkot = await prisma.hospital.create({
    data: {
      name: 'PDU District Government Hospital Rajkot',
      type: HospitalType.DISTRICT_HOSPITAL,
      address: 'Jamnagar Road, Rajkot',
      district: 'Rajkot',
      state: 'Gujarat',
      pincode: '360001',
      latitude: 22.3000,
      longitude: 70.7833,
      phone: '+91 281 2444101',
      email: 'civil.rajkot@gujarat.gov.in',
      openingTime: '24 Hours',
      closingTime: '24 Hours',
      emergencyAvailable: true,
      isActive: true,
    },
  });

  const hospMavdi = await prisma.hospital.create({
    data: {
      name: 'Sub Center Mavdi Village',
      type: HospitalType.SUB_CENTER,
      address: 'Mavdi Main Bazaar, Rajkot',
      district: 'Rajkot',
      state: 'Gujarat',
      pincode: '360004',
      latitude: 22.2700,
      longitude: 70.7700,
      phone: '+91 281 2555666',
      openingTime: '09:00 AM',
      closingTime: '05:00 PM',
      emergencyAvailable: false,
      isActive: true,
    },
  });

  console.log('✅ Created 4 representative hospitals in Rajkot district.');

  // 3. Create Doctors
  const doctorsData = [
    {
      hospitalId: hospGondal.id,
      name: 'Dr. Rajesh Shah',
      specialization: 'General Physician',
      qualification: 'MBBS',
      phone: '+91 98765 43210',
      consultationStart: '09:00 AM',
      consultationEnd: '02:00 PM',
      availabilityStatus: DoctorAvailabilityStatus.AVAILABLE,
    },
    {
      hospitalId: hospGondal.id,
      name: 'Dr. Priya Varma',
      specialization: 'Gynecologist',
      qualification: 'MBBS, DGO',
      phone: '+91 98765 43211',
      consultationStart: '10:00 AM',
      consultationEnd: '04:00 PM',
      availabilityStatus: DoctorAvailabilityStatus.AVAILABLE,
    },
    {
      hospitalId: hospJetpur.id,
      name: 'Dr. Suresh Patel',
      specialization: 'Pediatrician',
      qualification: 'MBBS, MD (Pediatrics)',
      phone: '+91 98765 43212',
      consultationStart: '09:00 AM',
      consultationEnd: '01:00 PM',
      availabilityStatus: DoctorAvailabilityStatus.AVAILABLE,
    },
    {
      hospitalId: hospJetpur.id,
      name: 'Dr. Anita Desai',
      specialization: 'General Physician',
      qualification: 'MBBS',
      phone: '+91 98765 43213',
      consultationStart: '02:00 PM',
      consultationEnd: '07:00 PM',
      availabilityStatus: DoctorAvailabilityStatus.ON_LEAVE,
    },
    {
      hospitalId: hospCivilRajkot.id,
      name: 'Dr. K. M. Mehta',
      specialization: 'Orthopedic Surgeon',
      qualification: 'MS (Orthopedics)',
      phone: '+91 98765 43214',
      consultationStart: '09:00 AM',
      consultationEnd: '05:00 PM',
      availabilityStatus: DoctorAvailabilityStatus.AVAILABLE,
    },
    {
      hospitalId: hospCivilRajkot.id,
      name: 'Dr. Sunita Rao',
      specialization: 'Gynecologist',
      qualification: 'MD (OBGYN)',
      phone: '+91 98765 43215',
      consultationStart: '09:00 AM',
      consultationEnd: '05:00 PM',
      availabilityStatus: DoctorAvailabilityStatus.AVAILABLE,
    },
  ];

  for (const doc of doctorsData) {
    await prisma.doctor.create({ data: doc });
  }

  console.log('✅ Created doctor records linked to hospitals.');

  // 4. Create Medicines
  const medParacetamol = await prisma.medicine.create({
    data: {
      name: 'Paracetamol 500mg',
      genericName: 'Paracetamol',
      category: 'Analgesic / Antipyretic',
      unit: 'Tablet',
      description: 'Used to treat fever and mild to moderate pain.',
    },
  });

  const medORS = await prisma.medicine.create({
    data: {
      name: 'ORS Electrolyte Powder',
      genericName: 'Oral Rehydration Salts',
      category: 'Rehydration',
      unit: 'Sachet',
      description: 'Used to prevent and treat dehydration caused by diarrhea.',
    },
  });

  const medAmoxicillin = await prisma.medicine.create({
    data: {
      name: 'Amoxicillin 500mg',
      genericName: 'Amoxicillin',
      category: 'Antibiotic',
      unit: 'Capsule',
      description: 'Penicillin-type antibiotic used to treat bacterial infections.',
    },
  });

  const medMetformin = await prisma.medicine.create({
    data: {
      name: 'Metformin 500mg',
      genericName: 'Metformin Hydrochloride',
      category: 'Anti-Diabetic',
      unit: 'Tablet',
      description: 'First-line medication for the treatment of type 2 diabetes.',
    },
  });

  console.log('✅ Created medicine master data.');

  // 5. Create Hospital Medicines (Stock)
  const stockData = [
    {
      hospitalId: hospGondal.id,
      medicineId: medParacetamol.id,
      quantity: 120,
      availabilityStatus: MedicineAvailabilityStatus.AVAILABLE,
      lastUpdated: new Date(),
    },
    {
      hospitalId: hospGondal.id,
      medicineId: medORS.id,
      quantity: 80,
      availabilityStatus: MedicineAvailabilityStatus.AVAILABLE,
      lastUpdated: new Date(),
    },
    {
      hospitalId: hospGondal.id,
      medicineId: medAmoxicillin.id,
      quantity: 0,
      availabilityStatus: MedicineAvailabilityStatus.OUT_OF_STOCK,
      lastUpdated: new Date(),
    },
    {
      hospitalId: hospJetpur.id,
      medicineId: medParacetamol.id,
      quantity: 65,
      availabilityStatus: MedicineAvailabilityStatus.AVAILABLE,
      lastUpdated: new Date(),
    },
    {
      hospitalId: hospJetpur.id,
      medicineId: medAmoxicillin.id,
      quantity: 25,
      availabilityStatus: MedicineAvailabilityStatus.LIMITED,
      lastUpdated: new Date(),
    },
    {
      hospitalId: hospCivilRajkot.id,
      medicineId: medParacetamol.id,
      quantity: 500,
      availabilityStatus: MedicineAvailabilityStatus.AVAILABLE,
      lastUpdated: new Date(),
    },
    {
      hospitalId: hospCivilRajkot.id,
      medicineId: medMetformin.id,
      quantity: 200,
      availabilityStatus: MedicineAvailabilityStatus.AVAILABLE,
      lastUpdated: new Date(),
    },
  ];

  for (const stock of stockData) {
    await prisma.hospitalMedicine.create({ data: stock });
  }

  console.log('✅ Created hospital medicine availability mapping.');

  // 6. Create Hospital Services
  const servicesData = [
    {
      hospitalId: hospGondal.id,
      serviceName: 'General OPD',
      isAvailable: true,
      description: 'Outpatient consultation for general illnesses',
    },
    {
      hospitalId: hospGondal.id,
      serviceName: 'Maternal Care',
      isAvailable: true,
      description: 'Antenatal checkups and maternal health care',
    },
    {
      hospitalId: hospGondal.id,
      serviceName: 'Gynecology',
      isAvailable: true,
      description: 'Specialized women health and gynecology services',
    },
    {
      hospitalId: hospGondal.id,
      serviceName: 'Immunization',
      isAvailable: true,
      description: 'Routine childhood vaccination',
    },
    {
      hospitalId: hospGondal.id,
      serviceName: 'X-Ray',
      isAvailable: false,
      description: 'Radiology imaging services',
    },
    {
      hospitalId: hospJetpur.id,
      serviceName: 'General OPD',
      isAvailable: true,
    },
    {
      hospitalId: hospJetpur.id,
      serviceName: 'Child Care',
      isAvailable: true,
    },
    {
      hospitalId: hospCivilRajkot.id,
      serviceName: 'Emergency',
      isAvailable: true,
      description: '24/7 Trauma and emergency care',
    },
    {
      hospitalId: hospCivilRajkot.id,
      serviceName: 'Gynecology',
      isAvailable: true,
    },
    {
      hospitalId: hospCivilRajkot.id,
      serviceName: 'X-Ray',
      isAvailable: true,
    },
    {
      hospitalId: hospCivilRajkot.id,
      serviceName: 'ICU',
      isAvailable: true,
    },
    {
      hospitalId: hospMavdi.id,
      serviceName: 'Immunization',
      isAvailable: true,
    },
  ];

  for (const srv of servicesData) {
    await prisma.hospitalService.create({ data: srv });
  }

  console.log('✅ Created hospital services.');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
