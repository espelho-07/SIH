import { Router } from 'express';
import { DepartmentController } from './department.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new DepartmentController();

router.get('/specialties', controller.getSpecialties);
router.get('/specialties/:id', controller.getSpecialties);

router.get('/', controller.getDepartments);
router.get('/:id', controller.getDepartmentById);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.createDepartment);
router.put('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.updateDepartment);
router.delete('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN'), controller.deleteDepartment);

export default router;
