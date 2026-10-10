import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { analyzeRequest, getAnalysis } from '../controllers/ai.controller';

const router = Router();
router.use(authenticate);
router.post('/analyze/:requestId', analyzeRequest);
router.get('/analysis/:requestId', getAnalysis);

export default router;
