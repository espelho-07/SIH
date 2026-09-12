import { Request, Response } from 'express';
import { MedicineModel } from '../models/Medicine';
import { DispensingRecordModel } from '../models/DispensingRecord';
import { PrescriptionModel } from '../models/Prescription';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export async function getMedicines(req: Request, res: Response): Promise<void> {
  const facilityId = req.query.facilityId || req.body.facilityId;
  const filter: any = {};
  if (facilityId) filter.facilityId = facilityId;

  const medicines = await MedicineModel.find(filter);
  sendSuccess(res, 'Medicine inventory retrieved', medicines.map((m) => m.toJSON()));
}

export async function getMedicineById(req: Request, res: Response): Promise<void> {
  const { medicineId } = req.params;
  const medicine = await MedicineModel.findOne({ id: medicineId });

  if (!medicine) {
    sendError(res, `Medicine with ID ${medicineId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Medicine details retrieved', medicine.toJSON());
}

export async function quarantineBatch(req: Request, res: Response): Promise<void> {
  const { medicineId } = req.params;
  const { reason } = req.body;

  const medicine = await MedicineModel.findOneAndUpdate(
    { id: medicineId },
    {
      status: 'QUARANTINED',
      quarantineReason: reason || 'Quarantined by Pharmacist for quality inspection',
      lastUpdated: new Date().toISOString(),
    },
    { new: true }
  );

  if (!medicine) {
    sendError(res, `Medicine with ID ${medicineId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Medicine batch quarantined successfully', medicine.toJSON());
}

export async function adjustMedicineStock(req: Request, res: Response): Promise<void> {
  const { medicineId } = req.params;
  const { delta = 0 } = req.body;

  const medicine = await MedicineModel.findOne({ id: medicineId });
  if (!medicine) {
    sendError(res, `Medicine with ID ${medicineId} not found`, 404);
    return;
  }

  const newQty = Math.max(0, medicine.availableQuantity + Number(delta));
  medicine.availableQuantity = newQty;
  medicine.status =
    newQty === 0 ? 'OUT_OF_STOCK' : newQty <= medicine.minimumStockThreshold ? 'LOW_STOCK' : 'IN_STOCK';
  medicine.lastUpdated = new Date().toISOString();
  await medicine.save();

  sendSuccess(res, 'Medicine stock level adjusted successfully', medicine.toJSON());
}

export async function getDispensingHistory(_req: Request, res: Response): Promise<void> {
  const records = await DispensingRecordModel.find().sort({ createdAt: -1 });
  sendSuccess(res, 'Chronological dispensing history records retrieved', records.map((r) => r.toJSON()));
}

export async function getPrescriptions(req: Request, res: Response): Promise<void> {
  const patientId = req.query.patientId || req.body.patientId;
  const filter: any = {};
  if (patientId) filter.patientId = patientId;

  const prescriptions = await PrescriptionModel.find(filter).sort({ issuedAt: -1 });
  sendSuccess(res, 'Prescriptions retrieved', prescriptions.map((p) => p.toJSON()));
}

export async function getPrescriptionById(req: Request, res: Response): Promise<void> {
  const { prescriptionId } = req.params;
  const rx = await PrescriptionModel.findOne({ id: prescriptionId });

  if (!rx) {
    sendError(res, `Prescription with ID ${prescriptionId} not found`, 404);
    return;
  }

  sendSuccess(res, 'Prescription details retrieved', rx.toJSON());
}

export async function dispensePrescription(req: AuthRequest, res: Response): Promise<void> {
  const { prescriptionId } = req.params;
  const { pharmacistName, notes } = req.body;

  const rx = await PrescriptionModel.findOne({ id: prescriptionId });
  if (!rx) {
    sendError(res, `Prescription ${prescriptionId} not found`, 404);
    return;
  }

  // Deduct inventory for each prescribed medicine
  const dispensedItems: any[] = [];
  for (const item of rx.items) {
    item.dispensedStatus = 'DISPENSED';
    item.dispensedQuantity = item.totalQuantity;

    // Find and deduct from medicine inventory if present
    const med = await MedicineModel.findOne({
      facilityId: rx.facilityId,
      medicineName: { $regex: item.medicineName.split(' ')[0], $options: 'i' },
    });

    if (med) {
      med.availableQuantity = Math.max(0, med.availableQuantity - item.totalQuantity);
      if (med.availableQuantity === 0) med.status = 'OUT_OF_STOCK';
      else if (med.availableQuantity <= med.minimumStockThreshold) med.status = 'LOW_STOCK';
      med.lastUpdated = new Date().toISOString();
      await med.save();

      dispensedItems.push({
        medicineName: item.medicineName,
        genericName: item.genericName || med.genericName,
        batchNumber: med.batchNumber,
        quantity: item.totalQuantity,
        unit: 'Tablets',
        dosageInstructions: `${item.dosage} - ${item.frequency}`,
      });
    } else {
      dispensedItems.push({
        medicineName: item.medicineName,
        genericName: item.genericName,
        batchNumber: 'GEN-2026-01',
        quantity: item.totalQuantity,
        unit: 'Tablets',
        dosageInstructions: `${item.dosage} - ${item.frequency}`,
      });
    }
  }

  rx.status = 'DISPENSED';
  if (notes) rx.pharmacyNotes = notes;
  await rx.save();

  // Create dispensing record
  const record = new DispensingRecordModel({
    id: `disp_${Date.now()}`,
    prescriptionId: rx.id,
    patientId: rx.patientId,
    patientName: rx.patientName,
    patientAge: 45,
    patientGender: 'M',
    doctorId: rx.doctorId,
    doctorName: rx.doctorName,
    facilityId: rx.facilityId,
    facilityName: rx.facilityName,
    dispensedBy: pharmacistName || req.user?.name || 'Priya Nair (Pharmacist)',
    dispensedAt: new Date().toISOString(),
    items: dispensedItems,
    pharmacyNotes: notes || 'Dispensed complete medication course.',
  });
  await record.save();

  sendSuccess(res, `Prescription ${rx.id} dispensed successfully`, rx.toJSON());
}
