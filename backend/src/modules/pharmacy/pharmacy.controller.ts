import { Request, Response, NextFunction } from 'express';
import { sendSuccess, sendError } from '../../utils/response';
import { Prescription } from '../../models/Prescription';
import { DispensingRecord } from '../../models/DispensingRecord';
import { Medicine } from '../../models/Medicine';

export class PharmacyController {
  getPrescriptions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { patientId } = req.query;
      const query: any = {};
      if (patientId) query.patientId = patientId;

      const prescriptions = await Prescription.find(query).sort({ createdAt: -1 });
      sendSuccess(res, 'Prescriptions fetched', prescriptions);
    } catch (error) {
      next(error);
    }
  };

  getPrescriptionById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.prescriptionId || '');
      const prescription = await Prescription.findOne({
        $or: [
          { prescriptionId: id },
          ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
        ],
      });

      if (!prescription) {
        sendError(res, 'Prescription not found', 404);
        return;
      }

      sendSuccess(res, 'Prescription details retrieved', prescription);
    } catch (error) {
      next(error);
    }
  };

  dispensePrescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.prescriptionId || req.params.id || req.body.prescriptionId || req.body.id || '');
      const { pharmacistName, notes } = req.body;

      let prescription = await Prescription.findOne({
        $or: [
          { prescriptionId: id },
          ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
        ],
      });

      if (!prescription) {
        sendError(res, 'Prescription not found', 404);
        return;
      }

      prescription.status = 'DISPENSED';
      if (notes) prescription.pharmacyNotes = notes;
      prescription.items.forEach((item) => {
        item.dispensedStatus = 'DISPENSED';
        item.dispensedQuantity = item.totalQuantity;
      });
      await prescription.save();

      // Record in Dispensing History
      await DispensingRecord.create({
        recordId: `disp_${Date.now()}`,
        prescriptionId: prescription.prescriptionId,
        patientId: prescription.patientId,
        patientName: prescription.patientName,
        patientAge: 48,
        patientGender: 'M',
        doctorId: prescription.doctorId,
        doctorName: prescription.doctorName,
        facilityId: prescription.facilityId,
        facilityName: prescription.facilityName,
        dispensedBy: pharmacistName || 'Priya Sharma (Pharmacist)',
        dispensedAt: new Date().toISOString(),
        items: prescription.items.map((it) => ({
          medicineName: it.medicineName,
          genericName: it.genericName,
          batchNumber: 'BATCH-2026',
          quantity: it.totalQuantity,
          unit: 'Tablets',
          dosageInstructions: it.instructions || `${it.dosage} ${it.frequency}`,
        })),
        notes,
      });

      // Deduct medicine inventory
      for (const item of prescription.items) {
        await Medicine.updateOne(
          { $or: [{ name: item.medicineName }, { medicineName: item.medicineName }] },
          { $inc: { availableQuantity: -item.totalQuantity } }
        );
      }

      sendSuccess(res, 'Prescription dispensed successfully', prescription);
    } catch (error) {
      next(error);
    }
  };

  getDispensingHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const history = await DispensingRecord.find().sort({ createdAt: -1 });
      sendSuccess(res, 'Dispensing history records retrieved', history);
    } catch (error) {
      next(error);
    }
  };
}
