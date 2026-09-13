import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from './config/env';

// Load all mock dummy data bundled from Frontend/src/mock/mockData.ts
const mock = require('./mockDataBundle.cjs');

export async function transferAllDataToDatabase() {
  console.log('===============================================================');
  console.log('🔄 Starting Full Dummy Data Transfer to Local MongoDB...');
  console.log('📍 Connection string:', env.DATABASE_URL);
  console.log('===============================================================');

  await mongoose.connect(env.DATABASE_URL);
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error('Database connection failed');
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. USERS
  console.log('👤 Transferring 100% of Demo Users...');
  const usersCollection = db.collection('users');
  await usersCollection.deleteMany({});
  const rawUsers = Object.values(mock.DEMO_USERS) as any[];
  const usersToInsert = rawUsers.map((u) => ({
    userId: u.id,
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    password: hashedPassword,
    role: u.role,
    staffSubType: u.staffSubType,
    district: u.district || 'Gandhinagar',
    facilityId: u.facilityId || 'fac_civil_01',
    facilityName: u.facilityName || 'Gandhinagar Civil Hospital',
    abhaId: u.abhaId || '14-8921-3409-7721',
    age: u.age || 40,
    gender: u.gender || 'M',
    avatar: u.avatar,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await usersCollection.insertMany(usersToInsert);
  console.log(`✅ Users transferred: ${usersToInsert.length}`);

  // 2. FACILITIES & HOSPITALS
  console.log('🏥 Transferring Facilities and Hospitals...');
  const facilitiesCollection = db.collection('facilities');
  const hospitalsCollection = db.collection('hospitals');
  await facilitiesCollection.deleteMany({});
  await hospitalsCollection.deleteMany({});
  const facilitiesToInsert = (mock.INITIAL_FACILITIES as any[]).map((f) => ({
    ...f,
    facilityId: f.id,
    phone: f.contactNumber,
    contactPhone: f.contactNumber,
    emergencyPhone: f.emergencyNumber,
    latitude: f.coordinates?.lat || 23.2238,
    longitude: f.coordinates?.lng || 72.6492,
    location: {
      type: 'Point',
      coordinates: [f.coordinates?.lng || 72.6492, f.coordinates?.lat || 23.2238],
    },
    openingTime: '08:00 AM',
    closingTime: '08:00 PM',
    emergencyAvailable: f.emergencyAvailable !== false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await facilitiesCollection.insertMany(facilitiesToInsert);
  await hospitalsCollection.insertMany(facilitiesToInsert);
  console.log(`✅ Facilities/Hospitals transferred: ${facilitiesToInsert.length}`);

  // 3. DOCTORS
  console.log('🩺 Transferring Doctors...');
  const doctorsCollection = db.collection('doctors');
  await doctorsCollection.deleteMany({});
  const doctorsToInsert = [
    {
      doctorId: 'usr_doc_01',
      id: 'usr_doc_01',
      hospitalId: 'fac_civil_01',
      facilityId: 'fac_civil_01',
      name: 'Dr. Arvind Patel',
      specialization: 'Cardiology',
      qualification: 'MD (Cardiology), MBBS',
      department: 'General Medicine OPD',
      phone: '9876505678',
      consultationStart: '09:00 AM',
      consultationEnd: '05:00 PM',
      opdRoom: 'Room 4',
      availabilityStatus: 'AVAILABLE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      doctorId: 'usr_doc_02',
      id: 'usr_doc_02',
      hospitalId: 'fac_civil_01',
      facilityId: 'fac_civil_01',
      name: 'Dr. Rajesh Shah',
      specialization: 'Emergency & Trauma',
      qualification: 'MS (Orthopedics), MBBS',
      department: 'Emergency & Trauma',
      phone: '9876505679',
      consultationStart: '08:00 AM',
      consultationEnd: '08:00 PM',
      opdRoom: 'Red Triage Bay',
      availabilityStatus: 'AVAILABLE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      doctorId: 'usr_doc_03',
      id: 'usr_doc_03',
      hospitalId: 'fac_civil_01',
      facilityId: 'fac_civil_01',
      name: 'Dr. Meera Desai',
      specialization: 'Obstetrics & Gynecology',
      qualification: 'MS (OBG), DGO',
      department: 'Obstetrics',
      phone: '9876505680',
      consultationStart: '09:00 AM',
      consultationEnd: '04:00 PM',
      opdRoom: 'MCH Room 2',
      availabilityStatus: 'AVAILABLE',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  await doctorsCollection.insertMany(doctorsToInsert);
  console.log(`✅ Doctors transferred: ${doctorsToInsert.length}`);

  // 4. TOKENS & QUEUES
  console.log('🎫 Transferring Live Queue Tokens...');
  const tokensCollection = db.collection('tokens');
  await tokensCollection.deleteMany({});
  const tokensToInsert = (mock.INITIAL_LIVE_QUEUE.tokens as any[]).map((t) => ({
    ...t,
    tokenId: t.id,
    queueDate: new Date().toISOString().split('T')[0],
    createdAt: new Date(t.createdAt || Date.now()),
    updatedAt: new Date(),
  }));
  await tokensCollection.insertMany(tokensToInsert);
  console.log(`✅ Tokens transferred: ${tokensToInsert.length}`);

  // 5. REGISTERED PATIENTS
  console.log('🧑‍🤝‍🧑 Transferring Registered Patients...');
  const patientsCollection = db.collection('registeredpatients');
  await patientsCollection.deleteMany({});
  const patientsToInsert = (mock.INITIAL_PATIENTS as any[]).map((p) => ({
    ...p,
    uhid: p.id,
    registeredByFacility: 'fac_civil_01',
    emergencyContactName: p.emergencyContact?.name || 'Family',
    emergencyContactPhone: p.emergencyContact?.phone || '9825000000',
    category: p.category || 'GENERAL',
    createdAt: new Date(p.registeredAt || Date.now()),
    updatedAt: new Date(),
  }));
  await patientsCollection.insertMany(patientsToInsert);
  console.log(`✅ Registered Patients transferred: ${patientsToInsert.length}`);

  // 6. APPOINTMENTS
  console.log('📅 Transferring Appointments...');
  const appointmentsCollection = db.collection('appointments');
  await appointmentsCollection.deleteMany({});
  const appointmentsToInsert = (mock.INITIAL_APPOINTMENTS as any[]).map((a) => ({
    ...a,
    appointmentId: a.id,
    appointmentDate: a.date,
    reason: a.reasonForVisit,
    createdAt: new Date(a.createdAt || Date.now()),
    updatedAt: new Date(),
  }));
  await appointmentsCollection.insertMany(appointmentsToInsert);
  console.log(`✅ Appointments transferred: ${appointmentsToInsert.length}`);

  // 7. PRESCRIPTIONS
  console.log('📋 Transferring Prescriptions...');
  const prescriptionsCollection = db.collection('prescriptions');
  await prescriptionsCollection.deleteMany({});
  const prescriptionsToInsert = (mock.INITIAL_PRESCRIPTIONS as any[]).map((rx) => {
    const rawItems = rx.items || rx.medications || [];
    return {
      ...rx,
      prescriptionId: rx.id,
      diagnosisSummary: rx.diagnosisSummary || rx.diagnosis,
      items: rawItems.map((m: any) => ({
        id: m.id,
        medicineName: m.medicineName || m.name,
        genericName: m.genericName || m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        route: m.route || 'Oral',
        totalQuantity: m.totalQuantity || m.quantity || 1,
        dispensedQuantity: m.dispensedQuantity || (m.dispensed ? m.quantity : 0),
        dispensedStatus: m.dispensedStatus || (m.dispensed ? 'DISPENSED' : 'PENDING'),
        instructions: m.instructions,
      })),
      createdAt: new Date(rx.issuedAt || rx.prescribedAt || Date.now()),
      updatedAt: new Date(),
    };
  });
  await prescriptionsCollection.insertMany(prescriptionsToInsert);
  console.log(`✅ Prescriptions transferred: ${prescriptionsToInsert.length}`);

  // 8. DIAGNOSTIC ORDERS
  console.log('🔬 Transferring Diagnostic Orders...');
  const diagnosticsCollection = db.collection('diagnosticorders');
  await diagnosticsCollection.deleteMany({});
  const diagnosticsToInsert = (mock.INITIAL_DIAGNOSTIC_ORDERS as any[]).map((d) => ({
    ...d,
    orderId: d.id,
    orderedBy: d.orderedBy || d.doctorName || 'Dr. Arvind Patel',
    parameters: d.parameters || (d.results ? d.results.map((r: any) => ({
      name: r.parameter || r.name,
      value: r.value,
      unit: r.unit,
      referenceRange: r.referenceRange,
      status: r.isAbnormal ? 'ABNORMAL' : 'NORMAL',
    })) : []),
    createdAt: new Date(d.orderedAt || Date.now()),
    updatedAt: new Date(),
  }));
  await diagnosticsCollection.insertMany(diagnosticsToInsert);
  console.log(`✅ Diagnostic Orders transferred: ${diagnosticsToInsert.length}`);

  // 9. MEDICINES & INVENTORY
  console.log('💊 Transferring Medicines & Inventory...');
  const medicinesCollection = db.collection('medicines');
  await medicinesCollection.deleteMany({});
  const medicinesToInsert = (mock.INITIAL_MEDICINES as any[]).map((m) => ({
    ...m,
    medicineId: m.id,
    name: m.medicineName || m.name,
    dosageForm: m.dosageForm || 'TABLET',
    strength: m.strength || m.unit || '',
    expiryDate: m.expiryDate ? new Date(m.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await medicinesCollection.insertMany(medicinesToInsert);
  console.log(`✅ Medicines transferred: ${medicinesToInsert.length}`);

  // 10. DISPENSING RECORDS
  console.log('📦 Transferring Dispensing Records...');
  const dispensingCollection = db.collection('dispensingrecords');
  await dispensingCollection.deleteMany({});
  const dispensingToInsert = (mock.INITIAL_DISPENSING_HISTORY as any[]).map((d) => ({
    ...d,
    recordId: d.id,
    createdAt: new Date(d.dispensedAt || Date.now()),
    updatedAt: new Date(),
  }));
  await dispensingCollection.insertMany(dispensingToInsert);
  console.log(`✅ Dispensing History transferred: ${dispensingToInsert.length}`);

  // 11. REFERRALS
  console.log('🔀 Transferring Referrals...');
  const referralsCollection = db.collection('referrals');
  await referralsCollection.deleteMany({});
  const referralsToInsert = (mock.INITIAL_REFERRALS as any[]).map((r) => ({
    ...r,
    referralId: r.id,
    createdAt: new Date(r.createdAt || Date.now()),
    updatedAt: new Date(),
  }));
  await referralsCollection.insertMany(referralsToInsert);
  console.log(`✅ Referrals transferred: ${referralsToInsert.length}`);

  // 12. AMBULANCES
  console.log('🚑 Transferring Ambulances...');
  const ambulancesCollection = db.collection('ambulances');
  await ambulancesCollection.deleteMany({});
  const ambulancesToInsert = (mock.INITIAL_AMBULANCES as any[]).map((a) => ({
    ...a,
    vehicleNumber: a.vehicleNumber || 'GJ-18-GA-1081',
    driverName: a.driverName || 'Pilot',
    driverPhone: a.driverPhone || '9876509905',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await ambulancesCollection.insertMany(ambulancesToInsert);
  console.log(`✅ Ambulances transferred: ${ambulancesToInsert.length}`);

  // 13. EQUIPMENT
  console.log('⚙️ Transferring Equipment...');
  const equipmentCollection = db.collection('equipment');
  await equipmentCollection.deleteMany({});
  const equipmentToInsert = (mock.INITIAL_EQUIPMENT as any[]).map((eq) => ({
    ...eq,
    equipmentId: eq.id,
    equipmentName: eq.name,
    facilityId: eq.facilityId || 'fac_civil_01',
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await equipmentCollection.insertMany(equipmentToInsert);
  console.log(`✅ Equipment transferred: ${equipmentToInsert.length}`);

  // 14. ASHA WORKFLOWS
  console.log('🏘️ Transferring ASHA Workflows (Patients, Visits, Tasks, Referrals)...');
  const ashaPatientsCollection = db.collection('ashapatients');
  const ashaVisitsCollection = db.collection('ashavisits');
  const ashaTasksCollection = db.collection('followuptasks');
  const frontlineReferralsCollection = db.collection('frontlinereferrals');

  await ashaPatientsCollection.deleteMany({});
  await ashaVisitsCollection.deleteMany({});
  await ashaTasksCollection.deleteMany({});
  await frontlineReferralsCollection.deleteMany({});

  await ashaPatientsCollection.insertMany(
    (mock.INITIAL_ASHA_PATIENTS as any[]).map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt || Date.now()),
      updatedAt: new Date(),
    }))
  );
  await ashaVisitsCollection.insertMany(
    (mock.INITIAL_ASHA_VISITS as any[]).map((v) => ({
      ...v,
      createdAt: new Date(v.visitDate || Date.now()),
      updatedAt: new Date(),
    }))
  );
  await ashaTasksCollection.insertMany(
    (mock.INITIAL_ASHA_TASKS as any[]).map((t) => ({
      ...t,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );
  await frontlineReferralsCollection.insertMany(
    (mock.INITIAL_FRONTLINE_REFERRALS as any[]).map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt || Date.now()),
      updatedAt: new Date(),
    }))
  );
  console.log(
    `✅ ASHA Patients: ${mock.INITIAL_ASHA_PATIENTS.length}, Visits: ${mock.INITIAL_ASHA_VISITS.length}, Tasks: ${mock.INITIAL_ASHA_TASKS.length}, Frontline Referrals: ${mock.INITIAL_FRONTLINE_REFERRALS.length}`
  );

  // 15. OPERATIONAL WORKFLOWS
  console.log('🏢 Transferring Facility Operations (Services, Announcements, Issues, Staff Duty)...');
  const opServicesCollection = db.collection('operationalservices');
  const opAnnouncementsCollection = db.collection('operationalannouncements');
  const opIssuesCollection = db.collection('operationalissues');
  const staffDutyCollection = db.collection('staffduties');

  await opServicesCollection.deleteMany({});
  await opAnnouncementsCollection.deleteMany({});
  await opIssuesCollection.deleteMany({});
  await staffDutyCollection.deleteMany({});

  await opServicesCollection.insertMany(
    (mock.INITIAL_OPERATIONAL_SERVICES as any[]).map((s) => ({
      ...s,
      serviceId: s.id,
      facilityId: 'fac_civil_01',
      category: s.category === 'EMERGENCY' ? 'EMERGENCY_ICU' : s.category === 'OUTPATIENT' ? 'CLINICAL_OPD' : s.category,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );
  await opAnnouncementsCollection.insertMany(
    (mock.INITIAL_OPERATIONAL_ANNOUNCEMENTS as any[]).map((a) => ({
      ...a,
      announcementId: a.id,
      facilityId: 'fac_civil_01',
      createdAt: new Date(a.createdAt || Date.now()),
      updatedAt: new Date(),
    }))
  );
  await opIssuesCollection.insertMany(
    (mock.INITIAL_OPERATIONAL_ISSUES as any[]).map((i) => ({
      ...i,
      issueId: i.id,
      facilityId: 'fac_civil_01',
      createdAt: new Date(i.timestamp || Date.now()),
      updatedAt: new Date(),
    }))
  );
  await staffDutyCollection.insertMany(
    (mock.INITIAL_STAFF_DUTY as any[]).map((st) => ({
      ...st,
      dutyId: st.id,
      facilityId: 'fac_civil_01',
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );
  console.log(
    `✅ Operations Services: ${mock.INITIAL_OPERATIONAL_SERVICES.length}, Announcements: ${mock.INITIAL_OPERATIONAL_ANNOUNCEMENTS.length}, Issues: ${mock.INITIAL_OPERATIONAL_ISSUES.length}, Staff Duty: ${mock.INITIAL_STAFF_DUTY.length}`
  );

  // 16. BLOOD INVENTORY & BEDS
  console.log('🩸 Transferring Blood Inventory and Bed Capacity...');
  const bloodCollection = db.collection('bloodinventories');
  const bedsCollection = db.collection('beds');
  const bedSummariesCollection = db.collection('bedsummaries');
  await bloodCollection.deleteMany({});
  await bedsCollection.deleteMany({});
  await bedSummariesCollection.deleteMany({});

  const stockList = mock.INITIAL_BLOOD_INVENTORY?.stock || [];
  const bloodToInsert = stockList.map((item: any) => ({
    hospitalId: mock.INITIAL_BLOOD_INVENTORY?.facilityId || 'fac_civil_01',
    facilityId: mock.INITIAL_BLOOD_INVENTORY?.facilityId || 'fac_civil_01',
    bloodGroup: item.bloodGroup,
    availableUnits: item.unitsAvailable,
    unitsAvailable: item.unitsAvailable,
    minimumThreshold: item.minimumThreshold,
    status: item.status || 'AVAILABLE',
    expiringIn7Days: item.expiringIn7Days,
    lastUpdated: new Date(item.lastUpdated || Date.now()),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  await bloodCollection.insertMany(bloodToInsert);

  const bedsToInsert = [
    { hospitalId: 'fac_civil_01', bedNumber: 'ICU-01', wardName: 'Cardio-Thoracic ICU', type: 'ICU', status: 'AVAILABLE' },
    { hospitalId: 'fac_civil_01', bedNumber: 'ICU-02', wardName: 'Cardio-Thoracic ICU', type: 'ICU', status: 'AVAILABLE' },
    { hospitalId: 'fac_civil_01', bedNumber: 'GEN-W1-01', wardName: 'General Male Ward', type: 'GENERAL', status: 'AVAILABLE' },
    { hospitalId: 'fac_civil_01', bedNumber: 'GEN-W1-02', wardName: 'General Male Ward', type: 'GENERAL', status: 'AVAILABLE' },
    { hospitalId: 'fac_civil_01', bedNumber: 'MAT-W2-01', wardName: 'Maternity Ward', type: 'MATERNITY', status: 'AVAILABLE' },
  ];
  await bedsCollection.insertMany(bedsToInsert);

  if (mock.INITIAL_BED_SUMMARY) {
    await bedSummariesCollection.insertOne({
      ...mock.INITIAL_BED_SUMMARY,
      createdAt: new Date(),
    });
  }
  console.log(`✅ Blood Inventory items: ${bloodToInsert.length}, Beds: ${bedsToInsert.length}, Bed Summary: 1`);

  // 17. CLINICAL HEALTH RECORDS & ROLE PERMISSIONS
  console.log('📂 Transferring Clinical Health Records & Permissions...');
  const healthRecordsCollection = db.collection('healthrecords');
  const rolePermissionsCollection = db.collection('rolepermissions');
  await healthRecordsCollection.deleteMany({});
  await rolePermissionsCollection.deleteMany({});

  if (mock.INITIAL_HEALTH_RECORD) {
    await healthRecordsCollection.insertOne({
      ...mock.INITIAL_HEALTH_RECORD,
      createdAt: new Date(),
    });
  }
  if (mock.INITIAL_PERMISSION_MATRIX) {
    await rolePermissionsCollection.insertMany(
      (mock.INITIAL_PERMISSION_MATRIX as any[]).map((p) => ({
        ...p,
        createdAt: new Date(),
      }))
    );
  }
  console.log(`✅ Health Records transferred: 1, Role Permissions: ${mock.INITIAL_PERMISSION_MATRIX?.length || 0}`);

  // 18. AI MODELS, AI SUMMARY, SYSTEM HEALTH & AUDIT LOGS
  console.log('🤖 Transferring AI Models, AI Summary, Audit Logs & System Governance...');
  const aiModelsCollection = db.collection('aimodels');
  const aiSummariesCollection = db.collection('aisummaries');
  const auditLogsCollection = db.collection('auditlogs');
  const systemHealthCollection = db.collection('systemhealth');

  await aiModelsCollection.deleteMany({});
  await aiSummariesCollection.deleteMany({});
  await auditLogsCollection.deleteMany({});
  await systemHealthCollection.deleteMany({});

  await aiModelsCollection.insertMany(
    (mock.INITIAL_AI_MODELS as any[]).map((ai) => ({ ...ai, modelId: ai.id, createdAt: new Date() }))
  );
  if (mock.INITIAL_AI_SUMMARY) {
    await aiSummariesCollection.insertOne({
      ...mock.INITIAL_AI_SUMMARY,
      createdAt: new Date(),
    });
  }
  await auditLogsCollection.insertMany(
    (mock.INITIAL_AUDIT_LOGS as any[]).map((log) => ({ ...log, logId: log.id, createdAt: new Date(log.timestamp || Date.now()) }))
  );
  await systemHealthCollection.insertOne({
    ...mock.INITIAL_SYSTEM_HEALTH,
    createdAt: new Date(),
  });
  console.log(`✅ AI Models: ${mock.INITIAL_AI_MODELS.length}, AI Summary: 1, Audit Logs: ${mock.INITIAL_AUDIT_LOGS.length}`);

  console.log('===============================================================');
  console.log('🎉 100% OF ALL DUMMY DATA TRANSFERRED SUCCESSFULLY TO MONGODB!');
  console.log('===============================================================');
  await mongoose.disconnect();
}

if (require.main === module) {
  transferAllDataToDatabase().catch((err) => {
    console.error('❌ Data transfer failed:', err);
    process.exit(1);
  });
}
