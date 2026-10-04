import { Router } from 'express';
import { getAIInsights, optimizeBudget } from '../controllers/aiController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, getAIInsights);
router.post('/budget-optimization', authenticateJWT, optimizeBudget);

export default router;
