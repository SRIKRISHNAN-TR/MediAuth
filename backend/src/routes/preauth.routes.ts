import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  submitRequest,
  updateStatus,
  getStats,
  seedSamplesForCurrentUser,
} from '../controllers/preauth.controller';

const router = Router();

router.use(authenticate);

router.get('/stats', getStats);
router.post('/seed-samples', seedSamplesForCurrentUser);
router.get('/', getRequests);
router.post('/', requireRole('doctor'), createRequest);
router.get('/:id', getRequestById);
router.put('/:id', requireRole('doctor'), updateRequest);
router.post('/:id/submit', requireRole('doctor'), submitRequest);
router.patch('/:id/status', requireRole('insurer'), updateStatus);

export default router;
