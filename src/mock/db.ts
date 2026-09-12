import {
  DEMO_USERS,
  INITIAL_FACILITIES,
  INITIAL_LIVE_QUEUE,
  INITIAL_HEALTH_RECORD,
  INITIAL_PRESCRIPTIONS,
  INITIAL_DIAGNOSTIC_ORDERS,
  INITIAL_REFERRALS,
  INITIAL_BED_SUMMARY,
  INITIAL_BLOOD_INVENTORY,
  INITIAL_AMBULANCES,
  INITIAL_MEDICINES,
  INITIAL_DISPENSING_HISTORY,
  INITIAL_EQUIPMENT,
  INITIAL_ASHA_PATIENTS,
  INITIAL_ASHA_VISITS,
  INITIAL_ASHA_TASKS,
  INITIAL_FRONTLINE_REFERRALS,
  INITIAL_AI_SUMMARY,
  INITIAL_SYSTEM_HEALTH,
  INITIAL_PERMISSION_MATRIX,
  INITIAL_AI_MODELS,
  INITIAL_AUDIT_LOGS,
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_OPERATIONAL_SERVICES,
  INITIAL_OPERATIONAL_ANNOUNCEMENTS,
  INITIAL_STAFF_DUTY,
  INITIAL_OPERATIONAL_ISSUES,
  INITIAL_DISTRICT_ADMINS,
  INITIAL_DISTRICT_DOCTORS,
  INITIAL_BLOOD_CENTRES,
} from './mockData';
import { Facility, FacilityMatchRequest, FacilityMatchResult } from '@/types/facility';
import { Token, LiveQueueState, Appointment, RegisteredPatient } from '@/types/queue';
import { Referral, CreateReferralRequest } from '@/types/referral';
import { Vitals, Diagnosis, Prescription, DiagnosticOrder, PatientHealthRecord, LabResultParameter } from '@/types/clinical';
import { BedSummary, BloodInventory, Ambulance, MedicineInventoryItem, EquipmentItem, DispensingRecord } from '@/types/resources';
import { AshaPatient, AshaVisit, ScreeningSession, FollowUpTask, FrontlineReferral } from '@/types/asha';
import { AiDemandIntelligenceSummary } from '@/types/ai';
import { SystemHealthOverview, PermissionMatrixItem, AiModelRegistryItem, AuditLog, DistrictAdminProfile, DistrictDoctor, BloodCenter } from '@/types/admin';
import { User } from '@/types/auth';
import {
  OperationalService,
  OperationalAnnouncement,
  StaffDutyItem,
  OperationalIssue,
  FacilityOperationalStatus,
  FacilityOperationsSummary,
  ServiceOperationalStatus,
} from '@/types/operations';

class MockHealthcareState {
  users: Record<string, User> = { ...DEMO_USERS };
  facilities: Facility[] = [...INITIAL_FACILITIES];
  liveQueue: LiveQueueState = JSON.parse(JSON.stringify(INITIAL_LIVE_QUEUE));
  healthRecords: Record<string, PatientHealthRecord> = {
    usr_pat_01: JSON.parse(JSON.stringify(INITIAL_HEALTH_RECORD)),
  };
  prescriptions: Prescription[] = JSON.parse(JSON.stringify(INITIAL_PRESCRIPTIONS));
  diagnosticOrders: DiagnosticOrder[] = JSON.parse(JSON.stringify(INITIAL_DIAGNOSTIC_ORDERS));
  referrals: Referral[] = JSON.parse(JSON.stringify(INITIAL_REFERRALS));
  bedSummary: BedSummary = JSON.parse(JSON.stringify(INITIAL_BED_SUMMARY));
  bloodInventory: BloodInventory = JSON.parse(JSON.stringify(INITIAL_BLOOD_INVENTORY));
  ambulances: Ambulance[] = JSON.parse(JSON.stringify(INITIAL_AMBULANCES));
  medicines: MedicineInventoryItem[] = JSON.parse(JSON.stringify(INITIAL_MEDICINES));
  dispensingHistory: DispensingRecord[] = JSON.parse(JSON.stringify(INITIAL_DISPENSING_HISTORY));
  equipment: EquipmentItem[] = JSON.parse(JSON.stringify(INITIAL_EQUIPMENT));
  ashaPatients: AshaPatient[] = JSON.parse(JSON.stringify(INITIAL_ASHA_PATIENTS));
  ashaVisits: AshaVisit[] = JSON.parse(JSON.stringify(INITIAL_ASHA_VISITS));
  ashaTasks: FollowUpTask[] = JSON.parse(JSON.stringify(INITIAL_ASHA_TASKS));
  frontlineReferrals: FrontlineReferral[] = JSON.parse(JSON.stringify(INITIAL_FRONTLINE_REFERRALS));
  screenings: ScreeningSession[] = [];
  aiSummary: AiDemandIntelligenceSummary = JSON.parse(JSON.stringify(INITIAL_AI_SUMMARY));
  systemHealth: SystemHealthOverview = JSON.parse(JSON.stringify(INITIAL_SYSTEM_HEALTH));
  permissions: PermissionMatrixItem[] = JSON.parse(JSON.stringify(INITIAL_PERMISSION_MATRIX));
  aiModels: AiModelRegistryItem[] = JSON.parse(JSON.stringify(INITIAL_AI_MODELS));
  auditLogs: AuditLog[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
  patients: RegisteredPatient[] = JSON.parse(JSON.stringify(INITIAL_PATIENTS));
  appointments: Appointment[] = JSON.parse(JSON.stringify(INITIAL_APPOINTMENTS));
  facilityStatus: Record<string, { status: FacilityOperationalStatus; reason?: string; lastUpdated: string; updatedBy: string }> = {
    fac_civil_01: {
      status: 'OPEN',
      reason: 'Full acute, emergency, and ambulatory care operating normally',
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Vikram Joshi (Operations Lead)',
    },
  };
  operationalServices: OperationalService[] = JSON.parse(JSON.stringify(INITIAL_OPERATIONAL_SERVICES));
  operationalAnnouncements: OperationalAnnouncement[] = JSON.parse(JSON.stringify(INITIAL_OPERATIONAL_ANNOUNCEMENTS));
  staffDuty: StaffDutyItem[] = JSON.parse(JSON.stringify(INITIAL_STAFF_DUTY));
  operationalIssues: OperationalIssue[] = JSON.parse(JSON.stringify(INITIAL_OPERATIONAL_ISSUES));
  doctors: DistrictDoctor[] = JSON.parse(JSON.stringify(INITIAL_DISTRICT_DOCTORS));
  bloodCenters: BloodCenter[] = JSON.parse(JSON.stringify(INITIAL_BLOOD_CENTRES));
  districtAdmins: DistrictAdminProfile[] = JSON.parse(JSON.stringify(INITIAL_DISTRICT_ADMINS));

  // Patient Registration & Duplicate Detection
  searchPatients(query: string): RegisteredPatient[] {
    const q = (query || '').trim().toLowerCase();
    if (!q) return this.patients;
    const cleanDigits = q.replace(/\D/g, '');
    return this.patients.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const abhaMatch = p.abhaId?.toLowerCase().includes(q) || (p.abhaId && p.abhaId.replace(/\D/g, '').includes(cleanDigits) && cleanDigits.length >= 4);
      const phoneMatch = p.phone.includes(cleanDigits) && cleanDigits.length >= 4;
      const idMatch = p.id.toLowerCase().includes(q);
      return nameMatch || abhaMatch || phoneMatch || idMatch;
    });
  }

  getPatientById(id: string): RegisteredPatient | null {
    return this.patients.find((p) => p.id === id) || null;
  }

  checkDuplicatePatient(phone: string, abhaId?: string, name?: string): RegisteredPatient | null {
    const cleanPhone = (phone || '').replace(/\D/g, '');
    const cleanAbha = (abhaId || '').replace(/\D/g, '');
    const cleanName = (name || '').trim().toLowerCase();

    for (const p of this.patients) {
      // 1. Exact phone match (10 digits)
      if (cleanPhone.length >= 10 && p.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10))) {
        return p;
      }
      // 2. Exact ABHA match (14 digits)
      if (cleanAbha.length >= 12 && p.abhaId && p.abhaId.replace(/\D/g, '') === cleanAbha) {
        return p;
      }
      // 3. Exact name and partial phone match
      if (cleanName && p.name.toLowerCase() === cleanName && cleanPhone && p.phone.includes(cleanPhone.slice(-5))) {
        return p;
      }
    }
    return null;
  }

  registerPatient(patientData: Omit<RegisteredPatient, 'id' | 'registeredAt'> & { id?: string }): RegisteredPatient {
    const newId = patientData.id || `usr_pat_${Date.now()}`;
    const newPatient: RegisteredPatient = {
      ...patientData,
      id: newId,
      registeredAt: new Date().toISOString(),
      lastVisitAt: new Date().toISOString(),
    };
    this.patients.unshift(newPatient);

    // Also register in users if not present
    if (!this.users[newId]) {
      this.users[newId] = {
        id: newId,
        name: newPatient.name,
        phone: newPatient.phone,
        role: 'PATIENT',
        age: newPatient.age,
        gender: newPatient.gender,
        abhaId: newPatient.abhaId,
        district: newPatient.district || 'Gandhinagar',
      };
    }

    return newPatient;
  }

  // Appointment Desk & Fast Check-In
  checkInAppointment(appointmentId: string): { appointment: Appointment; token: Token } {
    const apt = this.appointments.find((a) => a.id === appointmentId);
    if (!apt) {
      throw new Error(`Appointment with ID ${appointmentId} not found`);
    }

    // Determine department
    const facility = this.facilities.find((f) => f.id === apt.facilityId) || this.facilities[0];
    const dept = facility.departments[0] || { id: 'dep_med', name: 'General Medicine OPD' };

    // Generate token
    const token = this.generateToken(
      apt.patientName,
      apt.patientPhone,
      apt.facilityId,
      dept.id,
      'ROUTINE',
      apt.patientAge,
      apt.patientGender,
      apt.patientId
    );
    token.doctorId = apt.doctorId;
    token.doctorName = apt.doctorName;

    // Update appointment
    apt.status = 'CHECKED_IN';
    apt.tokenNumber = token.tokenNumber;
    apt.checkedInAt = new Date().toISOString();

    return { appointment: apt, token };
  }

  bookAppointment(data: Partial<Appointment>): Appointment {
    const newApt: Appointment = {
      id: `apt_${Date.now()}`,
      patientId: data.patientId || 'usr_pat_01',
      patientName: data.patientName || 'Patient',
      patientPhone: data.patientPhone || '9876543210',
      patientAge: data.patientAge || 35,
      patientGender: data.patientGender || 'M',
      facilityId: data.facilityId || 'fac_civil_01',
      facilityName: data.facilityName || 'Gandhinagar Civil Hospital',
      doctorId: data.doctorId || 'usr_doc_01',
      doctorName: data.doctorName || 'Dr. Arvind Patel',
      specialty: data.specialty || 'General Medicine',
      date: data.date || new Date().toISOString().split('T')[0],
      timeSlot: data.timeSlot || '11:00 AM',
      status: 'CONFIRMED',
      type: data.type || 'IN_PERSON',
      reasonForVisit: data.reasonForVisit || 'General Consultation',
      createdAt: new Date().toISOString(),
    };
    this.appointments.unshift(newApt);
    return newApt;
  }

  // Token & Queue operations
  generateToken(
    patientName: string,
    patientPhone: string,
    facilityId: string,
    departmentId: string,
    priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY' = 'ROUTINE',
    patientAge: number = 45,
    patientGender: 'M' | 'F' | 'Other' = 'M',
    patientId: string = 'usr_pat_01'
  ): Token {
    const facility = this.facilities.find((f) => f.id === facilityId) || this.facilities[0];
    const dept = facility.departments.find((d) => d.id === departmentId) || facility.departments[0];
    const num = Math.floor(Math.random() * 50) + 40;
    const tokenNumber = `A-0${num}`;

    const newToken: Token = {
      id: `tok_${Date.now()}`,
      tokenNumber,
      patientId,
      patientName,
      patientAge,
      patientGender,
      patientPhone,
      facilityId: facility.id,
      facilityName: facility.name,
      departmentId: dept.id,
      departmentName: dept.name,
      roomNumber: 'Room 4',
      status: 'WAITING',
      priority,
      positionInQueue: this.liveQueue.tokens.filter((t) => t.status === 'WAITING').length + 1,
      estimatedWaitMinutes: (this.liveQueue.tokens.filter((t) => t.status === 'WAITING').length + 1) * 6,
      createdAt: new Date().toISOString(),
    };

    this.liveQueue.tokens.push(newToken);
    this.liveQueue.totalWaiting += 1;
    return newToken;
  }

  callNextToken(): Token | null {
    const nextWaiting = this.liveQueue.tokens.find((t) => t.status === 'WAITING');
    if (!nextWaiting) return null;

    // Mark previous calling tokens as in consultation or completed
    this.liveQueue.tokens.forEach((t) => {
      if (t.status === 'CALLED') t.status = 'IN_CONSULTATION';
    });

    nextWaiting.status = 'CALLED';
    nextWaiting.calledAt = new Date().toISOString();
    this.liveQueue.currentTokenNumber = nextWaiting.tokenNumber;
    this.liveQueue.totalWaiting = Math.max(0, this.liveQueue.totalWaiting - 1);
    this.liveQueue.updatedAt = new Date().toISOString();

    // Recalculate remaining positions
    let pos = 1;
    this.liveQueue.tokens.forEach((t) => {
      if (t.status === 'WAITING') {
        t.positionInQueue = pos;
        t.estimatedWaitMinutes = pos * 6;
        pos++;
      }
    });

    return nextWaiting;
  }

  skipToken(tokenId: string): Token | null {
    const token = this.liveQueue.tokens.find((t) => t.id === tokenId);
    if (token) {
      token.status = 'SKIPPED';
      this.liveQueue.updatedAt = new Date().toISOString();
    }
    return token || null;
  }

  markTokenNoShow(tokenId: string): Token | null {
    const token = this.liveQueue.tokens.find((t) => t.id === tokenId);
    if (token) {
      token.status = 'NO_SHOW';
      this.liveQueue.updatedAt = new Date().toISOString();
    }
    return token || null;
  }

  // Referral operations with multi-criteria matching
  matchFacilities(request: FacilityMatchRequest): FacilityMatchResult[] {
    return this.facilities.map((fac) => {
      const hasSpecialty = fac.specialties.includes(request.specialty);
      const specialistAvail: 'AVAILABLE_NOW' | 'UNAVAILABLE' = hasSpecialty ? 'AVAILABLE_NOW' : 'UNAVAILABLE';
      const hasIcu = request.requiresIcu ? fac.icuBedsAvailable > 0 : true;
      const bedStatus: 'PLENTY' | 'LIMITED' | 'CRITICAL' = fac.availableBeds > 30 ? 'PLENTY' : fac.availableBeds > 5 ? 'LIMITED' : 'CRITICAL';
      const distance = fac.distanceKm || 5;

      let score = 50;
      const reasons: string[] = [];

      if (hasSpecialty) {
        score += 30;
        reasons.push(`Specialty department active (${request.specialty})`);
      }
      if (hasIcu) {
        score += 10;
        reasons.push(`${fac.icuBedsAvailable} ICU beds currently vacant`);
      }
      if (fac.emergencyAvailable) {
        score += 5;
        reasons.push('24/7 Emergency & Trauma Unit operational');
      }
      if (distance < 10) {
        score += 5;
        reasons.push(`Nearby facility (${distance} km distance)`);
      }

      return {
        facility: fac,
        suitabilityScore: Math.min(score, 98),
        clinicalMatchPercent: hasSpecialty ? 95 : 40,
        specialistAvailability: specialistAvail,
        equipmentSuitability: true,
        bedAvailabilityStatus: bedStatus,
        distanceKm: distance,
        estimatedTransitTimeMins: Math.round(distance * 2.2),
        matchReasons: reasons,
      };
    }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
  }

  createReferral(req: CreateReferralRequest): Referral {
    const destFacility = this.facilities.find((f) => f.id === req.toFacilityId) || this.facilities[0];
    const newRef: Referral = {
      id: `ref_${Date.now()}`,
      referralCode: `REF-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: req.patientId,
      patientName: 'Rameshwar Sharma',
      patientAge: 48,
      patientGender: 'Male',
      patientPhone: '9876543210',
      abhaId: '14-8921-3409-7721',
      fromFacilityId: 'fac_pet_04',
      fromFacilityName: 'Pethapur Primary Health Centre',
      fromDoctorId: 'usr_doc_pet',
      fromDoctorName: 'Dr. Neha Vaghela',
      toFacilityId: destFacility.id,
      toFacilityName: destFacility.name,
      toSpecialty: req.toSpecialty,
      reasonForReferral: req.reasonForReferral,
      clinicalSummary: req.clinicalSummary,
      priority: req.priority,
      requiredEquipment: req.requiredEquipment,
      requiredIcu: req.requiredIcu,
      status: 'CREATED',
      slaDeadline: new Date(Date.now() + (req.priority === 'EMERGENCY' ? 4 : 48) * 3600000).toISOString(),
      slaBreached: false,
      events: [
        {
          id: `ev_${Date.now()}`,
          status: 'CREATED',
          timestamp: new Date().toISOString(),
          actorName: 'Dr. Arvind Patel',
          actorRole: 'Senior Medical Officer',
          facilityName: 'Pethapur PHC',
          notes: 'Referral generated with clinical suitability matching.',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.referrals.unshift(newRef);
    return newRef;
  }

  // Pharmacy & Resource mutations
  dispensePrescription(prescriptionId: string, pharmacistName?: string, notes?: string): Prescription | null {
    const rx = this.prescriptions.find((p) => p.id === prescriptionId);
    if (!rx) return null;

    // Double-dispense protection
    if (rx.status === 'DISPENSED') {
      return rx;
    }

    const dispensedItemsSummary: Array<{
      medicineName: string;
      genericName?: string;
      batchNumber: string;
      quantity: number;
      unit: string;
      dosageInstructions: string;
    }> = [];

    // Deduct stock for each prescribed item
    rx.items.forEach((item) => {
      item.dispensedStatus = 'DISPENSED';
      item.dispensedQuantity = item.totalQuantity;

      // Find best-matching medicine in inventory
      const genNorm = (item.genericName || '').toLowerCase().trim();
      const nameNorm = item.medicineName.toLowerCase().trim();

      const matchedMed = this.medicines.find((m) => {
        const mGen = m.genericName.toLowerCase().trim();
        const mName = m.medicineName.toLowerCase().trim();
        if (genNorm && (mGen.includes(genNorm) || genNorm.includes(mGen))) return true;
        if (mName.includes(nameNorm) || nameNorm.includes(mName)) return true;
        return false;
      });

      if (matchedMed) {
        // Safe authoritative stock deduction
        matchedMed.availableQuantity = Math.max(0, matchedMed.availableQuantity - item.totalQuantity);
        if (matchedMed.availableQuantity === 0) {
          matchedMed.status = 'OUT_OF_STOCK';
        } else if (matchedMed.availableQuantity <= matchedMed.minimumStockThreshold) {
          matchedMed.status = 'LOW_STOCK';
        }
        matchedMed.lastUpdated = new Date().toISOString();

        dispensedItemsSummary.push({
          medicineName: matchedMed.medicineName,
          genericName: matchedMed.genericName,
          batchNumber: matchedMed.batchNumber,
          quantity: item.totalQuantity,
          unit: matchedMed.unit,
          dosageInstructions: `${item.frequency} • ${item.instructions || ''}`.trim(),
        });
      } else {
        dispensedItemsSummary.push({
          medicineName: item.medicineName,
          genericName: item.genericName,
          batchNumber: 'GEN-2026-DISP',
          quantity: item.totalQuantity,
          unit: 'Units',
          dosageInstructions: `${item.frequency} • ${item.instructions || ''}`.trim(),
        });
      }
    });

    rx.status = 'DISPENSED';
    rx.pharmacyNotes = notes;

    // Record authoritative audit trail
    const auditRecord: DispensingRecord = {
      id: `disp_${Date.now()}`,
      prescriptionId: rx.id,
      patientId: rx.patientId,
      patientName: rx.patientName,
      patientAge: 48,
      patientGender: 'M',
      doctorId: rx.doctorId,
      doctorName: rx.doctorName,
      facilityId: rx.facilityId,
      facilityName: rx.facilityName,
      dispensedBy: pharmacistName || 'Priya Nair (Pharmacist)',
      dispensedAt: new Date().toISOString(),
      items: dispensedItemsSummary,
      notes: notes || 'Verified with patient identity. Full course dispensed.',
    };

    this.dispensingHistory.unshift(auditRecord);
    return rx;
  }

  quarantineBatch(medicineId: string, reason: string): MedicineInventoryItem | null {
    const med = this.medicines.find((m) => m.id === medicineId);
    if (med) {
      med.status = 'QUARANTINED';
      med.quarantineReason = reason;
      med.lastUpdated = new Date().toISOString();
    }
    return med || null;
  }

  adjustMedicineStock(medicineId: string, delta: number, reason: string): MedicineInventoryItem | null {
    const med = this.medicines.find((m) => m.id === medicineId);
    if (med) {
      med.availableQuantity = Math.max(0, med.availableQuantity + delta);
      if (med.status !== 'QUARANTINED') {
        if (med.availableQuantity === 0) {
          med.status = 'OUT_OF_STOCK';
        } else if (med.availableQuantity <= med.minimumStockThreshold) {
          med.status = 'LOW_STOCK';
        } else {
          med.status = 'IN_STOCK';
        }
      }
      med.lastUpdated = new Date().toISOString();
    }
    return med || null;
  }

  updateBedStatus(facilityId: string, category: string, available: number): BedSummary {
    const targetCat = this.bedSummary.categories.find((c) => c.type === category);
    if (targetCat) {
      targetCat.available = available;
      targetCat.occupied = targetCat.total - available;
      targetCat.lastUpdated = new Date().toISOString();
    }
    this.bedSummary.totalAvailable = this.bedSummary.categories.reduce((acc, c) => acc + c.available, 0);
    this.bedSummary.totalOccupied = this.bedSummary.totalBeds - this.bedSummary.totalAvailable;
    this.bedSummary.lastUpdated = new Date().toISOString();
    return this.bedSummary;
  }

  // --- LABORATORY / DIAGNOSTICS METHODS ---
  getDiagnosticOrders(filters?: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
  }): DiagnosticOrder[] {
    let list = [...this.diagnosticOrders];

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter((ord) => ord.status === filters.status);
    }
    if (filters?.category && filters.category !== 'ALL') {
      list = list.filter((ord) => ord.testCategory === filters.category);
    }
    if (filters?.priority && filters.priority !== 'ALL') {
      list = list.filter((ord) => ord.priority === filters.priority);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (ord) =>
          ord.id.toLowerCase().includes(q) ||
          ord.testName.toLowerCase().includes(q) ||
          ord.patientName.toLowerCase().includes(q) ||
          (ord.patientPhone && ord.patientPhone.includes(q)) ||
          (ord.patientAbha && ord.patientAbha.toLowerCase().includes(q)) ||
          (ord.sampleId && ord.sampleId.toLowerCase().includes(q)) ||
          (ord.barcodeNumber && ord.barcodeNumber.toLowerCase().includes(q))
      );
    }

    return list;
  }

  getDiagnosticOrderById(orderId: string): DiagnosticOrder | null {
    const ord = this.diagnosticOrders.find((o) => o.id === orderId);
    return ord || null;
  }

  collectSample(orderId: string, technicianName?: string, notes?: string): DiagnosticOrder | null {
    const ord = this.diagnosticOrders.find((o) => o.id === orderId);
    if (!ord) return null;

    ord.status = 'SAMPLE_COLLECTED';
    ord.sampleCollectedAt = new Date().toISOString();
    ord.technicianName = technicianName || 'Ramesh Patel, MLT';
    if (!ord.sampleId) {
      ord.sampleId = `SMP-${Date.now().toString().slice(-6)}`;
    }
    if (!ord.barcodeNumber) {
      ord.barcodeNumber = `BC-${Date.now().toString().slice(-8)}`;
    }
    if (notes) {
      ord.notes = ord.notes ? `${ord.notes} | ${notes}` : notes;
    }

    this.syncOrderWithHealthRecord(ord);
    return ord;
  }

  receiveSample(orderId: string, technicianName?: string): DiagnosticOrder | null {
    const ord = this.diagnosticOrders.find((o) => o.id === orderId);
    if (!ord) return null;

    ord.status = 'SAMPLE_RECEIVED';
    ord.sampleReceivedAt = new Date().toISOString();
    ord.technicianName = technicianName || 'Ramesh Patel, MLT';

    this.syncOrderWithHealthRecord(ord);
    return ord;
  }

  rejectSample(orderId: string, reason: string, notes?: string, technicianName?: string): DiagnosticOrder | null {
    const ord = this.diagnosticOrders.find((o) => o.id === orderId);
    if (!ord) return null;

    ord.status = 'REJECTED';
    ord.rejectionReason = reason;
    ord.rejectionNotes = notes;
    ord.completedAt = new Date().toISOString();
    ord.technicianName = technicianName || 'Ramesh Patel, MLT';

    this.syncOrderWithHealthRecord(ord);
    return ord;
  }

  startProcessing(orderId: string, technicianName?: string): DiagnosticOrder | null {
    const ord = this.diagnosticOrders.find((o) => o.id === orderId);
    if (!ord) return null;

    ord.status = 'PROCESSING';
    ord.processedAt = new Date().toISOString();
    ord.technicianName = technicianName || 'Ramesh Patel, MLT';

    this.syncOrderWithHealthRecord(ord);
    return ord;
  }

  submitResult(
    orderId: string,
    parameters: LabResultParameter[],
    resultSummary?: string,
    technicianName?: string
  ): DiagnosticOrder | null {
    const ord = this.diagnosticOrders.find((o) => o.id === orderId);
    if (!ord) return null;

    ord.resultParameters = parameters;
    const hasAbnormal = parameters.some((p) => p.status === 'ABNORMAL' || p.status === 'CRITICAL');
    ord.isAbnormal = hasAbnormal;
    ord.resultSummary =
      resultSummary ||
      (hasAbnormal
        ? 'One or more parameters flagged outside biological reference range.'
        : 'All parameter values within expected biological reference range.');
    ord.status = 'REPORT_READY';
    ord.completedAt = new Date().toISOString();
    ord.technicianName = technicianName || 'Ramesh Patel, MLT';
    ord.reportFileUrl = `/reports/${ord.id}.pdf`;

    this.syncOrderWithHealthRecord(ord);
    return ord;
  }

  private syncOrderWithHealthRecord(updatedOrder: DiagnosticOrder): void {
    const patientRecord = this.healthRecords[updatedOrder.patientId];
    if (patientRecord && patientRecord.timeline) {
      const existingIdx = patientRecord.timeline.findIndex(
        (ev) => ev.details && (ev.details as any).orderId === updatedOrder.id
      );
      if (existingIdx !== -1) {
        patientRecord.timeline[existingIdx].summary = `${updatedOrder.testName}: ${updatedOrder.resultSummary || updatedOrder.status}`;
        patientRecord.timeline[existingIdx].details = { orderId: updatedOrder.id, ...updatedOrder } as Record<string, unknown>;
      } else if (updatedOrder.status === 'REPORT_READY' || updatedOrder.status === 'COMPLETED') {
        patientRecord.timeline.unshift({
          id: `tl_lab_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          eventType: 'LAB_REPORT',
          title: `Diagnostic Report: ${updatedOrder.testName}`,
          facilityName: updatedOrder.facilityName,
          doctorName: updatedOrder.orderedBy,
          summary: updatedOrder.resultSummary || 'Investigation completed and verified by laboratory.',
          details: { orderId: updatedOrder.id, ...updatedOrder } as Record<string, unknown>,
        });
      }
    }
  }

  // --- FACILITY OPERATIONS METHODS ---
  getFacilityOperationsSummary(facilityId: string = 'fac_civil_01'): FacilityOperationsSummary {
    const statusEntry = this.facilityStatus[facilityId] || {
      status: 'OPEN',
      reason: 'Normal acute and emergency healthcare operations active',
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Vikram Joshi (Operations Lead)',
    };

    const activeIssues = this.operationalIssues.filter((i) => !i.resolved);
    const criticalCount = activeIssues.filter((i) => i.severity === 'CRITICAL').length;
    const activeTokens = this.liveQueue.tokens.filter(
      (t) => t.status === 'WAITING' || t.status === 'CALLED'
    );
    const ambulancesReady = this.ambulances.filter((a) => a.status === 'AVAILABLE').length;
    const pendingIncoming = this.referrals.filter(
      (r) => r.toFacilityId === facilityId && (r.status === 'CREATED' || r.status === 'ACCEPTED')
    ).length;
    const staffOnDuty = this.staffDuty.filter((s) => s.status === 'ON_DUTY').length;

    return {
      facilityId,
      facilityName: 'Gandhinagar Civil Hospital & Medical College',
      operationalStatus: statusEntry.status,
      statusReason: statusEntry.reason,
      lastStatusUpdate: statusEntry.lastUpdated,
      updatedBy: statusEntry.updatedBy,
      totalActiveIssues: activeIssues.length,
      criticalIssuesCount: criticalCount,
      services: this.operationalServices,
      announcements: this.operationalAnnouncements.filter((a) => a.active),
      telemetry: {
        totalWaitingQueue: activeTokens.length,
        avgQueueWaitMinutes: this.liveQueue.averageConsultTimeMinutes || 20,
        bedsOccupied: this.bedSummary.totalOccupied,
        bedsTotal: this.bedSummary.totalBeds,
        bedsAvailable: this.bedSummary.totalAvailable,
        icuAvailable: this.bedSummary.icuAvailable,
        ambulancesReady,
        ambulancesTotal: this.ambulances.length,
        pendingIncomingReferrals: pendingIncoming,
        staffOnDutyCount: staffOnDuty,
      },
    };
  }

  updateFacilityStatus(
    facilityId: string = 'fac_civil_01',
    status: FacilityOperationalStatus,
    reason?: string,
    updatedBy?: string
  ): FacilityOperationsSummary {
    const actor = updatedBy || 'Vikram Joshi (Operations Lead)';
    this.facilityStatus[facilityId] = {
      status,
      reason: reason || (status === 'OPEN' ? 'Full healthcare services operating normally' : 'Operational status updated'),
      lastUpdated: new Date().toISOString(),
      updatedBy: actor,
    };

    const targetFac = this.facilities.find((f) => f.id === facilityId);
    if (targetFac) {
      targetFac.isOpen = status !== 'CLOSED';
      targetFac.emergencyAvailable = status !== 'CLOSED';
      targetFac.lastUpdated = new Date().toISOString();
    }

    // Register a priority announcement
    this.broadcastAnnouncement(
      `Hospital Operational Status Changed to ${status.replace(/_/g, ' ')}`,
      reason || `Operational status transition authorized by ${actor}.`,
      status === 'EMERGENCY_ONLY' || status === 'CLOSED' ? 'URGENT' : 'WARNING',
      actor
    );

    return this.getFacilityOperationsSummary(facilityId);
  }

  toggleServiceStatus(
    serviceId: string,
    status: ServiceOperationalStatus,
    reason?: string,
    notes?: string
  ): OperationalService | null {
    const serv = this.operationalServices.find((s) => s.id === serviceId);
    if (!serv) return null;

    serv.status = status;
    serv.statusReason = reason;
    if (notes) serv.notes = notes;
    serv.lastUpdated = new Date().toISOString();

    if (status === 'OFFLINE') {
      serv.currentWaitMinutes = 0;
    } else if (status === 'DEGRADED') {
      serv.currentWaitMinutes = Math.max(serv.currentWaitMinutes, 30);
    }

    return serv;
  }

  broadcastAnnouncement(
    title: string,
    message: string,
    severity: 'INFO' | 'WARNING' | 'URGENT' = 'INFO',
    author: string = 'Vikram Joshi (Operations Lead)'
  ): OperationalAnnouncement {
    const newAnnouncement: OperationalAnnouncement = {
      id: `ann_ops_${Date.now()}`,
      title,
      message,
      severity,
      createdAt: new Date().toISOString(),
      author,
      active: true,
    };
    this.operationalAnnouncements.unshift(newAnnouncement);
    return newAnnouncement;
  }

  resolveOperationalIssue(issueId: string, resolvedBy?: string): OperationalIssue | null {
    const issue = this.operationalIssues.find((i) => i.id === issueId);
    if (!issue) return null;

    issue.resolved = true;
    issue.resolvedAt = new Date().toISOString();
    issue.resolvedBy = resolvedBy || 'Vikram Joshi (Operations Lead)';
    return issue;
  }

  updateDepartmentQueueWait(departmentId: string, delayDeltaMinutes: number): void {
    const serv = this.operationalServices.find((s) => s.code.toLowerCase().includes(departmentId.toLowerCase()));
    if (serv) {
      serv.currentWaitMinutes = Math.max(0, serv.currentWaitMinutes + delayDeltaMinutes);
      serv.lastUpdated = new Date().toISOString();
    }
    if (this.liveQueue.averageConsultTimeMinutes) {
      this.liveQueue.averageConsultTimeMinutes = Math.max(
        5,
        this.liveQueue.averageConsultTimeMinutes + Math.round(delayDeltaMinutes / 2)
      );
    }
  }

  getStaffDuty(facilityId?: string): StaffDutyItem[] {
    return this.staffDuty;
  }

  // --- DISTRICT & STATE HEALTH INSTITUTION MANAGEMENT METHODS ---
  addFacility(data: Partial<Facility>, actor: string = 'District Health Admin'): Facility {
    const newFacility: Facility = {
      id: `fac_${Date.now()}`,
      name: data.name || 'Community Health Clinic',
      type: data.type || 'CHC',
      district: data.district || 'Gandhinagar',
      state: data.state || 'Gujarat',
      address: data.address || 'Civil Hospital Road',
      pincode: data.pincode || '382024',
      contactNumber: data.contactNumber || '+91 79 2322 0000',
      emergencyNumber: data.emergencyNumber || '108',
      totalBeds: data.totalBeds ?? 30,
      availableBeds: data.availableBeds ?? 20,
      icuBedsTotal: data.icuBedsTotal ?? 4,
      icuBedsAvailable: data.icuBedsAvailable ?? 2,
      oxygenAvailable: data.oxygenAvailable ?? true,
      bloodBankAvailable: data.bloodBankAvailable ?? false,
      ambulanceAvailable: data.ambulanceAvailable ?? true,
      emergencyAvailable: data.emergencyAvailable ?? true,
      isOpen: data.isOpen ?? true,
      isVerified: data.isVerified ?? true,
      currentWaitTimeMinutes: data.currentWaitTimeMinutes ?? 15,
      departments: data.departments || [
        { id: `dep_gm_${Date.now()}`, name: 'General Medicine', code: 'GEN', activeDoctors: 2, currentWaitMinutes: 15, opdOpen: true },
        { id: `dep_ped_${Date.now()}`, name: 'Pediatrics', code: 'PED', activeDoctors: 1, currentWaitMinutes: 20, opdOpen: true },
      ],
      specialties: data.specialties && data.specialties.length > 0 ? data.specialties : ['General Medicine', 'Pediatrics'],
      equipment: data.equipment || [],
      coordinates: data.coordinates || { lat: 23.2156 + (Math.random() - 0.5) * 0.05, lng: 72.6369 + (Math.random() - 0.5) * 0.05 },
      distanceKm: data.distanceKm || Math.round((Math.random() * 8 + 2) * 10) / 10,
      lastUpdated: new Date().toISOString(),
    };

    this.facilities.unshift(newFacility);

    // Audit log
    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: 'usr_dist_admin',
      actorName: actor,
      actorRole: 'DISTRICT_ADMIN',
      action: 'ADD_HEALTHCARE_FACILITY',
      resourceType: 'FACILITY',
      resourceId: newFacility.id,
      ipAddress: '10.14.0.1',
      userAgent: 'HealthConnect District Portal',
      status: 'SUCCESS',
      details: `Added new government facility: ${newFacility.name} (${newFacility.type}) in ${newFacility.district}`,
    });

    return newFacility;
  }

  addDoctor(data: Partial<DistrictDoctor>, actor: string = 'District Health Admin'): DistrictDoctor {
    const newDoc: DistrictDoctor = {
      id: `doc_${Date.now()}`,
      name: data.name || 'Dr. Medical Officer',
      qualification: data.qualification || 'MBBS',
      specialty: data.specialty || 'General Medicine',
      facilityId: data.facilityId || (this.facilities[0] ? this.facilities[0].id : 'fac_civil_01'),
      facilityName: data.facilityName || (this.facilities[0] ? this.facilities[0].name : 'Gandhinagar Civil Hospital'),
      status: data.status || 'ON_DUTY',
      phone: data.phone || '9876500000',
      email: data.email || 'doctor@gujarat.health.gov.in',
      opdSchedule: data.opdSchedule || '09:00 AM – 01:00 PM (Mon-Sat)',
      patientsToday: 0,
      teleconsultEnabled: data.teleconsultEnabled ?? true,
      district: data.district || 'Gandhinagar',
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: data.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    };

    this.doctors.unshift(newDoc);

    // Audit log
    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: 'usr_dist_admin',
      actorName: actor,
      actorRole: 'DISTRICT_ADMIN',
      action: 'REGISTER_DISTRICT_DOCTOR',
      resourceType: 'DOCTOR',
      resourceId: newDoc.id,
      ipAddress: '10.14.0.1',
      userAgent: 'HealthConnect District Portal',
      status: 'SUCCESS',
      details: `Registered ${newDoc.name} (${newDoc.specialty}) at ${newDoc.facilityName}`,
    });

    return newDoc;
  }

  updateDoctorStatus(doctorId: string, status: DistrictDoctor['status']): DistrictDoctor | null {
    const doc = this.doctors.find((d) => d.id === doctorId);
    if (doc) {
      doc.status = status;
    }
    return doc || null;
  }

  addBloodCenter(data: Partial<BloodCenter>, actor: string = 'District Health Admin'): BloodCenter {
    const newCenter: BloodCenter = {
      id: `bc_${Date.now()}`,
      name: data.name || 'District Blood Center',
      licenseNo: data.licenseNo || `GJ-BB-${Math.floor(1000 + Math.random() * 9000)}`,
      type: data.type || 'BLOOD_BANK',
      totalCapacity: data.totalCapacity || 200,
      currentStock: data.currentStock || 45,
      phone: data.phone || '079-2322-0000',
      location: data.location || 'Civil Hospital Complex',
      district: data.district || 'Gandhinagar',
      facilityId: data.facilityId,
      facilityName: data.facilityName,
      componentSeparation: data.componentSeparation ?? false,
      emergencyHotline: data.emergencyHotline || '108',
      lastInspectionDate: new Date().toISOString().split('T')[0],
    };

    this.bloodCenters.unshift(newCenter);

    // Audit log
    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: 'usr_dist_admin',
      actorName: actor,
      actorRole: 'DISTRICT_ADMIN',
      action: 'PROVISION_BLOOD_CENTER',
      resourceType: 'BLOOD_BANK',
      resourceId: newCenter.id,
      ipAddress: '10.14.0.1',
      userAgent: 'HealthConnect District Portal',
      status: 'SUCCESS',
      details: `Provisioned blood institution: ${newCenter.name} (${newCenter.type}) in ${newCenter.district}`,
    });

    return newCenter;
  }

  provisionDistrictAdmin(data: Partial<DistrictAdminProfile>, actor: string = 'Super Admin (State Health Authority)'): DistrictAdminProfile {
    const newAdmin: DistrictAdminProfile = {
      id: `usr_dist_${Date.now()}`,
      name: data.name || 'Dr. Appointed CDHO',
      designation: data.designation || 'Chief District Health Officer (CDHO)',
      district: data.district || 'Gandhinagar',
      state: 'Gujarat',
      email: data.email || `cdho.${(data.district || 'district').toLowerCase()}@gujarat.gov.in`,
      phone: data.phone || '9825000000',
      appointedAt: new Date().toISOString(),
      appointedBy: actor,
      status: data.status || 'ACTIVE',
      jurisdictionFacilitiesCount: this.facilities.filter((f) => f.district.toLowerCase() === (data.district || '').toLowerCase()).length || 4,
      jurisdictionPopulation: data.jurisdictionPopulation || 1500000,
      privileges: data.privileges || ['FACILITY_MANAGEMENT', 'DOCTOR_DEPLOYMENT', 'BLOOD_BANK_GOVERNANCE', 'EMERGENCY_BROADCAST'],
    };

    this.districtAdmins.unshift(newAdmin);

    // Register user account in users dictionary
    this.users[newAdmin.id] = {
      id: newAdmin.id,
      name: newAdmin.name,
      email: newAdmin.email,
      phone: newAdmin.phone,
      role: 'DISTRICT_ADMIN',
      district: newAdmin.district,
    };

    // Immutable Audit Log
    this.auditLogs.unshift({
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorId: 'usr_super_root',
      actorName: actor,
      actorRole: 'SUPER_ADMIN',
      action: 'APPOINT_DISTRICT_HEALTH_OFFICER',
      resourceType: 'USER_ROLE_ASSIGNMENT',
      resourceId: newAdmin.id,
      ipAddress: '127.0.0.1',
      userAgent: 'HealthConnect State Apex Governance Console',
      status: 'SUCCESS',
      details: `State Health Authority appointed ${newAdmin.name} (${newAdmin.designation}) for ${newAdmin.district} District jurisdiction.`,
    });

    return newAdmin;
  }

  updateDistrictAdminStatus(adminId: string, status: DistrictAdminProfile['status']): DistrictAdminProfile | null {
    const admin = this.districtAdmins.find((a) => a.id === adminId);
    if (admin) {
      admin.status = status;
      this.auditLogs.unshift({
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        actorId: 'usr_super_root',
        actorName: 'Super Admin (State Health Authority)',
        actorRole: 'SUPER_ADMIN',
        action: 'UPDATE_DISTRICT_ADMIN_STATUS',
        resourceType: 'USER_ROLE_ASSIGNMENT',
        resourceId: admin.id,
        ipAddress: '127.0.0.1',
        userAgent: 'HealthConnect State Apex Governance Console',
        status: 'SUCCESS',
        details: `District administrator ${admin.name} status updated to ${status}.`,
      });
    }
    return admin || null;
  }
}

export const mockState = new MockHealthcareState();
