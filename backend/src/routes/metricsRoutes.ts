import { Router } from 'express';
import {
  getMetrics,
  addMetric,
  batchImportMetrics,
  deleteMetric,
} from '../controllers/metricsController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, getMetrics);
router.post('/', authenticateJWT, addMetric);
router.post('/batch', authenticateJWT, batchImportMetrics);
router.delete('/:id', authenticateJWT, deleteMetric);

export default router;
