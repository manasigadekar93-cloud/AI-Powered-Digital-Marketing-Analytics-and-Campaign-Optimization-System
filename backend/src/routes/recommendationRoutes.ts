import { Router } from 'express';
import {
  getRecommendations,
  generateRecommendations,
  updateRecommendationStatus,
} from '../controllers/recommendationController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, getRecommendations);
router.post('/generate', authenticateJWT, generateRecommendations);
router.put('/:id/status', authenticateJWT, updateRecommendationStatus);

export default router;
