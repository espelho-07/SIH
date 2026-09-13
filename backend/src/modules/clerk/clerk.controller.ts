import { Request, Response, NextFunction } from 'express';
import { sendSuccess } from '../../utils/response';
import { RegisteredPatient } from '../../models/RegisteredPatient';

export class ClerkController {
  searchPatients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const search = ((req.query.search as string) || '').trim();
      let query: any = {};

      if (search) {
        const cleanDigits = search.replace(/\D/g, '');
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { uhid: { $regex: search, $options: 'i' } },
            ...(cleanDigits.length >= 4 ? [{ phone: { $regex: cleanDigits } }] : []),
            ...(cleanDigits.length >= 4 ? [{ abhaId: { $regex: cleanDigits } }] : []),
          ],
        };
      }

      const patients = await RegisteredPatient.find(query).limit(50).sort({ createdAt: -1 });
      sendSuccess(res, 'Patients retrieved', patients);
    } catch (error) {
      next(error);
    }
  };

  getPatientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id || '');
      const patient = await RegisteredPatient.findOne({
        $or: [
          { uhid: id },
          ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
        ],
      });

      sendSuccess(res, 'Patient details retrieved', patient);
    } catch (error) {
      next(error);
    }
  };

  checkDuplicate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { phone, abhaId, name } = req.body;
      const cleanPhone = (phone || '').replace(/\D/g, '');

      let duplicate = null;
      if (cleanPhone && cleanPhone.length >= 10) {
        duplicate = await RegisteredPatient.findOne({ phone: cleanPhone });
      }

      if (!duplicate && abhaId) {
        duplicate = await RegisteredPatient.findOne({ abhaId });
      }

      if (!duplicate && name && cleanPhone.length >= 6) {
        duplicate = await RegisteredPatient.findOne({
          name: { $regex: `^${name.trim()}$`, $options: 'i' },
          phone: { $regex: cleanPhone },
        });
      }

      sendSuccess(
        res,
        duplicate ? 'Matching patient record found' : 'No duplicate record found',
        duplicate
      );
    } catch (error) {
      next(error);
    }
  };

  registerPatient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req.body;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const uhid = data.uhid || `UHID-2026-${randomNum}`;
      const abhaId =
        data.abhaId ||
        `14-8890-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;

      const patient = await RegisteredPatient.create({
        uhid,
        name: data.name || 'New Patient',
        age: Number(data.age) || 30,
        gender: data.gender || 'M',
        phone: data.phone || '9876543210',
        address: data.address || 'Gandhinagar',
        district: data.district || 'Gandhinagar',
        abhaId,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        category: data.category || 'GENERAL',
        registeredByFacility: data.registeredByFacility || 'fac_civil_01',
      });

      sendSuccess(res, 'Patient registered successfully', patient, 201);
    } catch (error) {
      next(error);
    }
  };
}
