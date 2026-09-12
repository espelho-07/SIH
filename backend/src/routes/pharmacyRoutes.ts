import { Router } from 'express';
import {
  getMedicines,
  getMedicineById,
  quarantineBatch,
  adjustMedicineStock,
  getDispensingHistory,
} from '../controllers/pharmacyController';
import {
  getBloodInventory,
  getAmbulances,
  getEquipment,
} from '../controllers/resourceController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Pharmacy History
router.get('/pharmacy/history', getDispensingHistory);

// Medicines Inventory
router.get('/medicines', getMedicines);
router.get('/medicines/:medicineId', getMedicineById);
router.patch('/medicines/:medicineId/quarantine', authenticate, quarantineBatch);
router.patch('/medicines/:medicineId/stock', authenticate, adjustMedicineStock);

// Resources
router.get('/blood/inventory', getBloodInventory);
router.get('/blood', getBloodInventory);
router.get('/ambulances', getAmbulances);
router.get('/equipment', getEquipment);

export default router;
