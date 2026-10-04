import { Router } from 'express';
import {
  getAnalyticsOverview,
  getFunnelAnalytics,
  getCampaignComparison,
} from '../controllers/analyticsController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/overview', authenticateJWT, getAnalyticsOverview);
router.get('/funnel', authenticateJWT, getFunnelAnalytics);
router.get('/comparison', authenticateJWT, getCampaignComparison);

export default router;
