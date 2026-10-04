import { Router } from 'express';
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from '../controllers/campaignController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, getCampaigns);
router.get('/:id', authenticateJWT, getCampaignById);
router.post('/', authenticateJWT, createCampaign);
router.put('/:id', authenticateJWT, updateCampaign);
router.delete('/:id', authenticateJWT, deleteCampaign);

export default router;
