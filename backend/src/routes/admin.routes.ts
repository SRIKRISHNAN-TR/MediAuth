import { Router } from 'express';
import {
  getPendingUsers,
  approveUser,
  rejectUser,
  deactivateUser,
  addDoctor,
  addInsurer,
  getAllUsers,
  getAdminStats,
} from '../controllers/admin.controller';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(requireRole('admin'));

router.get('/stats', getAdminStats);
router.get('/pending', getPendingUsers);
router.get('/users', getAllUsers);
router.post('/approve/:userId', approveUser);
router.post('/reject/:userId', rejectUser);
router.post('/deactivate/:userId', deactivateUser);
router.post('/add-doctor', addDoctor);
router.post('/add-insurer', addInsurer);

export default router;
