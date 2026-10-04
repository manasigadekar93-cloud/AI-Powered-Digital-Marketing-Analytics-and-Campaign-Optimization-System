import { Router } from 'express';
import {
  getLeads,
  createLead,
  updateLeadStatus,
  deleteLead,
} from '../controllers/leadController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, getLeads);
router.post('/', authenticateJWT, createLead);
router.put('/:id', authenticateJWT, updateLeadStatus);
router.delete('/:id', authenticateJWT, deleteLead);

export default router;
