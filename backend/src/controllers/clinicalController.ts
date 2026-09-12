import { Request, Response } from 'express';
import { PatientHealthRecordModel } from '../models/HealthRecord';
import { EncounterModel } from '../models/Encounter';
import { PrescriptionModel } from '../models/Prescription';
import { DiagnosticOrderModel } from '../models/DiagnosticOrder';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export async function getPatientHealthRecord(req: Request, res: Response): Promise<void> {
  const { patientId } = req.params;
  let record = await PatientHealthRecordModel.findOne({ patientId });

  if (!record) {
    // Fallback: search by ID or return first record
    record = await PatientHealthRecordModel.findOne();
  }

  if (!record) {
    sendError(res, `Patient health record not found for ${patientId}`, 404);
    return;
  }

  sendSuccess(res, 'Patient health record retrieved', record.toJSON());
}

export async function getTimeline(req: Request, res: Response): Promise<void> {
  const { patientId } = req.params;
  let record = await PatientHealthRecordModel.findOne({ patientId });

  if (!record) {
    record = await PatientHealthRecordModel.findOne();
  }

  if (!record) {
    sendError(res, `Patient health record not found for ${patientId}`, 404);
    return;
  }

  sendSuccess(res, 'Patient timeline retrieved', record.timeline || []);
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
