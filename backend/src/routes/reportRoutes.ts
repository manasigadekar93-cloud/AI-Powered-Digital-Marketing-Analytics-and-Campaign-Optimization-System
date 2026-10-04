import { Router } from 'express';
import { generateReport } from '../controllers/reportController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/generate', authenticateJWT, generateReport);

export default router;
