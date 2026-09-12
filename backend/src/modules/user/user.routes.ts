import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const controller = new UserController();

router.use(authenticate);

router.get('/roles', controller.getRoles);
router.get('/:id/activity', controller.getUserActivity);
router.get('/:id/audit-logs', controller.getUserActivity);
router.patch('/:id/status', authorize('SUPER_ADMIN', 'ADMIN'), controller.updateStatus);

router.get('/', authorize('SUPER_ADMIN', 'ADMIN', 'DISTRICT_ADMIN'), controller.getUsers);
router.get('/:id', authorize('SUPER_ADMIN', 'ADMIN', 'DISTRICT_ADMIN'), controller.getUserById);
router.post('/', authorize('SUPER_ADMIN', 'ADMIN'), controller.createUser);
router.put('/:id', authorize('SUPER_ADMIN', 'ADMIN'), controller.updateUser);
router.delete('/:id', authorize('SUPER_ADMIN', 'ADMIN'), controller.deleteUser);

export default router;
