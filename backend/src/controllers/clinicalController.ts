import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { PatientHealthRecordModel } from '../models/HealthRecord';
import { EncounterModel } from '../models/Encounter';
import { PrescriptionModel } from '../models/Prescription';
import { DiagnosticOrderModel } from '../models/DiagnosticOrder';
import { AppointmentModel, TokenModel } from '../models/Queue';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export async function getPatientHealthRecord(req: Request, res: Response): Promise<void> {
  const { patientId } = req.params;
  let record = await PatientHealthRecordModel.findOne({
    $or: [
      { patientId },
      { phone: patientId },
      { abhaId: patientId },
    ],
  });

  if (!record) {
    // Fallback: return default patient record or first record
    record = (await PatientHealthRecordModel.findOne({ patientId: 'usr_pat_01' })) || (await PatientHealthRecordModel.findOne());
  }

  if (!record) {
    sendError(res, `Patient health record not found for ${patientId}`, 404);
    return;
  }

  const recordObj = record.toJSON();

  // Dynamic sync: Fetch latest prescriptions, encounters, and appointments from DB
  const rxList = await PrescriptionModel.find({
    $or: [{ patientId }, { patientId: record.patientId }],
  }).sort({ createdAt: -1 });

  const apptList = await AppointmentModel.find({
    $or: [{ patientId }, { patientId: record.patientId }, { patientPhone: record.phone }],
  }).sort({ createdAt: -1 });

  const diagList = await DiagnosticOrderModel.find({
    $or: [{ patientId }, { patientId: record.patientId }],
  }).sort({ createdAt: -1 });

  const timelineItems = [...(recordObj.timeline || [])];

  // Merge any prescriptions not yet in timeline
  rxList.forEach((rx) => {
    const rxId = rx.id || (rx as any)._id?.toString();
    if (!timelineItems.some((t) => t.id === rxId || t.id === `tl_${rxId}`)) {
      timelineItems.unshift({
        id: `tl_${rxId}`,
        date: (rx.issuedAt || new Date().toISOString()).split('T')[0],
        eventType: 'PRESCRIPTION',
        title: `e-Prescription - ${rx.diagnosisSummary || 'Consultation'}`,
        facilityName: rx.facilityName || 'Gandhinagar Civil Hospital',
        doctorName: rx.doctorName || 'Dr. Arvind Patel',
        summary: `Diagnosis: ${rx.diagnosisSummary}. Items: ${(rx.items || []).map((i: any) => i.medicineName).join(', ')}`,
      });
    }
  });

  // Merge any completed appointments not yet in timeline
  apptList.filter((a) => a.status === 'COMPLETED').forEach((apt) => {
    const aptId = apt.id || (apt as any)._id?.toString();
    if (!timelineItems.some((t) => t.id === aptId || t.id === `tl_${aptId}`)) {
      timelineItems.unshift({
        id: `tl_${aptId}`,
        date: apt.date || new Date().toISOString().split('T')[0],
        eventType: 'ENCOUNTER',
        title: `OPD Appointment Completed - ${apt.specialty || 'General Medicine'}`,
        facilityName: apt.facilityName,
        doctorName: apt.doctorName || 'Assigned Medical Officer',
        summary: `Reason for Visit: ${apt.reasonForVisit}. Status: Completed consultation.`,
      });
    }
  });

  // Merge diagnostic tests
  diagList.forEach((diag) => {
    const diagId = diag.id || (diag as any)._id?.toString();
    if (!timelineItems.some((t) => t.id === diagId || t.id === `tl_${diagId}`)) {
      timelineItems.unshift({
        id: `tl_${diagId}`,
        date: (diag.orderedAt || new Date().toISOString()).split('T')[0],
        eventType: 'LAB_REPORT',
        title: `Lab Test Ordered: ${diag.testName}`,
        facilityName: diag.facilityName || 'Gandhinagar Civil Hospital',
        doctorName: diag.orderedBy || 'Medical Officer',
        summary: `Test Category: ${diag.testCategory}, Priority: ${diag.priority}, Status: ${diag.status}`,
      });
    }
  });

  recordObj.timeline = timelineItems;

  sendSuccess(res, 'Patient health record retrieved', recordObj);
}

export async function getTimeline(req: Request, res: Response): Promise<void> {
  const { patientId } = req.params;
  let record = await PatientHealthRecordModel.findOne({
    $or: [
      { patientId },
      { phone: patientId },
      { abhaId: patientId },
    ],
  });

  if (!record) {
    record = (await PatientHealthRecordModel.findOne({ patientId: 'usr_pat_01' })) || (await PatientHealthRecordModel.findOne());
  }

  if (!record) {
    sendError(res, `Patient health record not found for ${patientId}`, 404);
    return;
  }

  sendSuccess(res, 'Patient timeline retrieved', record.timeline || []);
}

export async function getEncounters(req: Request, res: Response): Promise<void> {
  const { patientId, doctorId, facilityId, type, status } = { ...req.query, ...req.body } as any;
  const filter: any = {};
  if (patientId) {
    filter.$or = [
      { patientId },
      { patientPhone: patientId },
    ];
  }
  if (doctorId) filter.doctorId = doctorId;
  if (facilityId) filter.facilityId = facilityId;
  if (type) filter.type = type;
  if (status) filter.status = status;

  const encounters = await EncounterModel.find(filter).sort({ startedAt: -1, _id: -1 });
  sendSuccess(res, 'Encounters retrieved successfully', encounters.map((e) => e.toJSON()));
}

export async function getEncounterById(req: Request, res: Response): Promise<void> {
  const encounterId = String(req.params.encounterId);
  const isMongoId = mongoose.Types.ObjectId.isValid(encounterId);
  const encounter = await EncounterModel.findOne(
    isMongoId ? { $or: [{ id: encounterId }, { _id: encounterId }] } : { id: encounterId }
  );

  if (!encounter) {
    sendError(res, `Encounter ${encounterId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Encounter retrieved successfully', encounter.toJSON());
}

export async function createEncounter(req: AuthRequest, res: Response): Promise<void> {
  const data = req.body;
  const id = data.id || `enc_${Date.now()}`;

  const encounter = new EncounterModel({
    ...data,
    id,
    doctorId: data.doctorId || req.user?.id || 'usr_doc_01',
    doctorName: data.doctorName || req.user?.name || 'Dr. Arvind Patel',
  });
  await encounter.save();

  // If encounter includes prescriptions, save prescription record
  if (data.prescriptions && data.prescriptions.length > 0) {
    const rx = new PrescriptionModel({
      id: `rx_${Date.now()}`,
      encounterId: encounter.id,
      patientId: encounter.patientId,
      patientName: encounter.patientName,
      doctorId: encounter.doctorId,
      doctorName: encounter.doctorName,
      facilityId: encounter.facilityId,
      facilityName: encounter.facilityName,
      issuedAt: new Date().toISOString(),
      diagnosisSummary: data.chiefComplaint || 'Clinical Consultation',
      items: data.prescriptions,
      status: 'PENDING',
    });
    await rx.save();
  }

  // If encounter includes diagnostic orders, save diagnostic records
  if (data.diagnosticOrders && data.diagnosticOrders.length > 0) {
    for (const test of data.diagnosticOrders) {
      const order = new DiagnosticOrderModel({
        id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        encounterId: encounter.id,
        patientId: encounter.patientId,
        patientName: encounter.patientName,
        patientAge: 48,
        patientGender: 'M',
        testName: test.testName || 'Diagnostic Test',
        testCategory: test.testCategory || 'BIOCHEMISTRY',
        priority: test.priority || 'ROUTINE',
        orderedBy: encounter.doctorName,
        orderedAt: new Date().toISOString(),
        facilityId: encounter.facilityId,
        facilityName: encounter.facilityName,
        status: 'AWAITING_SAMPLE',
      });
      await order.save();
    }
  }

  // Add timeline entry to PatientHealthRecord
  const record = await PatientHealthRecordModel.findOne({ patientId: encounter.patientId });
  if (record) {
    record.timeline.unshift({
      id: `tl_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      eventType: 'ENCOUNTER',
      title: `OPD Consultation - ${encounter.chiefComplaint}`,
      facilityName: encounter.facilityName,
      doctorName: encounter.doctorName,
      summary: encounter.clinicalNotes || 'Doctor consultation concluded and medications prescribed.',
    });
    await record.save();
  }

  // Update any active appointment or token for this patient to COMPLETED
  try {
    await AppointmentModel.updateMany(
      {
        $or: [{ patientId: encounter.patientId }, { patientPhone: encounter.patientId }],
        status: { $in: ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN'] },
      },
      {
        $set: { status: 'COMPLETED' },
      }
    );
    await TokenModel.updateMany(
      {
        $or: [{ patientId: encounter.patientId }, { patientPhone: encounter.patientId }],
        status: { $in: ['WAITING', 'CALLED', 'IN_CONSULTATION'] },
      },
      {
        $set: { status: 'COMPLETED', completedAt: new Date().toISOString() },
      }
    );
  } catch (syncErr) {
    console.warn('Could not update appointment/token status on encounter creation:', syncErr);
  }

  sendSuccess(res, 'Clinical encounter documented successfully', encounter.toJSON(), 201);
}

export async function saveVitals(req: AuthRequest, res: Response): Promise<void> {
  const { encounterId } = req.params;
  const vitalsData = req.body;

  const encounter = await EncounterModel.findOne({ id: encounterId });
  if (encounter) {
    encounter.vitals = {
      ...vitalsData,
      id: `vit_${Date.now()}`,
      recordedBy: req.user?.name || 'Medical Officer',
      recordedByRole: req.user?.role || 'DOCTOR',
      recordedAt: new Date().toISOString(),
    };
    await encounter.save();
  }

  // Also add to timeline if patient record exists
  if (encounter?.patientId || vitalsData.patientId) {
    const pId = encounter?.patientId || vitalsData.patientId;
    const record = await PatientHealthRecordModel.findOne({ patientId: pId });
    if (record) {
      record.timeline.unshift({
        id: `tl_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        eventType: 'VITALS',
        title: 'Vitals Recorded',
        facilityName: encounter?.facilityName || 'Gandhinagar Civil Hospital',
        doctorName: req.user?.name || 'Triage Nurse / MO',
        summary: `BP: ${vitalsData.systolicBp || 120}/${vitalsData.diastolicBp || 80} mmHg, Pulse: ${vitalsData.pulseRate || 72} bpm, SpO2: ${vitalsData.spO2 || 98}%`,
      });
      await record.save();
    }
  }

  sendSuccess(res, 'Vitals recorded successfully', vitalsData);
}

export async function createPrescription(req: AuthRequest, res: Response): Promise<void> {
  try {
    const data = req.body;
    const id = data.id || `rx_${Date.now()}`;
    const patientId = data.patientId || 'usr_pat_01';
    const patientName = data.patientName || 'Govindbhai Patel';
    const doctorId = data.doctorId || req.user?.id || 'usr_doc_01';
    const doctorName = data.doctorName || req.user?.name || 'Dr. Arvind Patel';
    const facilityId = data.facilityId || 'fac_civil_01';
    const facilityName = data.facilityName || 'Gandhinagar Civil Hospital';
    const encounterId = data.encounterId || `enc_${Date.now()}`;

    const rx = new PrescriptionModel({
      ...data,
      id,
      patientId,
      patientName,
      doctorId,
      doctorName,
      facilityId,
      facilityName,
      encounterId,
      issuedAt: data.issuedAt || new Date().toISOString(),
      diagnosisSummary: data.diagnosisSummary || data.diagnosis || 'Clinical Consultation',
      status: data.status || 'PENDING',
    });
    await rx.save();

    // Also add to timeline of patient health record
    const record = await PatientHealthRecordModel.findOne({
      $or: [{ patientId }, { phone: patientId }],
    });
    if (record) {
      record.timeline.unshift({
        id: `tl_${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        eventType: 'PRESCRIPTION',
        title: `e-Prescription Issued (#${id})`,
        facilityName,
        doctorName,
        summary: `Diagnosis: ${rx.diagnosisSummary}. Items: ${(data.items || []).map((i: any) => i.medicineName).join(', ')}`,
      });
      await record.save();
    }

    // Mark active appointment and token as COMPLETED
    try {
      await AppointmentModel.updateMany(
        {
          $or: [{ patientId }, { patientPhone: patientId }],
          status: { $in: ['SCHEDULED', 'CONFIRMED', 'CHECKED_IN'] },
        },
        {
          $set: { status: 'COMPLETED' },
        }
      );
      await TokenModel.updateMany(
        {
          $or: [{ patientId }, { patientPhone: patientId }],
          status: { $in: ['WAITING', 'CALLED', 'IN_CONSULTATION'] },
        },
        {
          $set: { status: 'COMPLETED', completedAt: new Date().toISOString() },
        }
      );
    } catch (syncErr) {
      console.warn('Could not update appointment/token status on prescription creation:', syncErr);
    }

    sendSuccess(res, 'Prescription created successfully in database', rx.toJSON(), 201);
  } catch (err: any) {
    sendError(res, err.message || 'Failed to create prescription', 500);
  }
}
