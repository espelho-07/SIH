import { Request, Response, NextFunction } from 'express';
import { MedicineService } from './medicine.service';
import { sendSuccess } from '../../utils/response';

export class MedicineController {
  private medicineService: MedicineService;

  constructor() {
    this.medicineService = new MedicineService();
  }

  getAllMedicines = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medicines = await this.medicineService.getAllMedicines(req.query as any);
      sendSuccess(res, 'Medicines fetched successfully', medicines);
    } catch (error) {
      next(error);
    }
  };

  getMedicineById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medicineId = String(req.params.medicineId || '');
      const medicine = await this.medicineService.getMedicineById(medicineId);
      sendSuccess(res, 'Medicine retrieved successfully', medicine);
    } catch (error) {
      next(error);
    }
  };

  quarantineBatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medicineId = String(req.params.medicineId || '');
      const { reason } = req.body;
      const medicine = await this.medicineService.getMedicineById(medicineId);
      await this.medicineService.updateMedicine(medicineId, {
        status: 'QUARANTINED',
        quarantineReason: reason || 'Quarantined by pharmacy staff',
      } as any);
      const updated = await this.medicineService.getMedicineById(medicineId);
      sendSuccess(res, 'Medicine batch quarantined successfully', updated);
    } catch (error) {
      next(error);
    }
  };

  adjustStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medicineId = String(req.params.medicineId || '');
      const { delta, reason } = req.body;
      const current = await this.medicineService.getMedicineById(medicineId);
      const newQty = Math.max(0, (current.availableQuantity ?? 0) + Number(delta || 0));
      const status =
        newQty === 0 ? 'OUT_OF_STOCK' : newQty <= (current.minimumStockThreshold ?? 20) ? 'LOW_STOCK' : 'IN_STOCK';

      await this.medicineService.updateMedicine(medicineId, {
        availableQuantity: newQty,
        status,
      } as any);
      const updated = await this.medicineService.getMedicineById(medicineId);
      sendSuccess(res, `Medicine stock adjusted by ${delta}`, updated);
    } catch (error) {
      next(error);
    }
  };

  getMedicineAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medicineId = Array.isArray(req.params.medicineId) ? req.params.medicineId[0] : req.params.medicineId;
      const availability = await this.medicineService.getMedicineLocationAvailability(
        medicineId,
        req.query as any
      );
      sendSuccess(res, 'Medicine location availability fetched successfully', availability);
    } catch (error) {
      next(error);
    }
  };

  createMedicine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medicine = await this.medicineService.createMedicine(req.body);
      sendSuccess(res, 'Medicine created successfully', medicine, 201);
    } catch (error) {
      next(error);
    }
  };

  updateMedicine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medicineId = Array.isArray(req.params.medicineId) ? req.params.medicineId[0] : req.params.medicineId;
      const medicine = await this.medicineService.updateMedicine(medicineId, req.body);
      sendSuccess(res, 'Medicine updated successfully', medicine);
    } catch (error) {
      next(error);
    }
  };

  deleteMedicine = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medicineId = Array.isArray(req.params.medicineId) ? req.params.medicineId[0] : req.params.medicineId;
      await this.medicineService.deleteMedicine(medicineId);
      sendSuccess(res, 'Medicine deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
