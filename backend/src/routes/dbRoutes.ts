import { Router } from 'express';
import { getDatabaseStatus } from '../controllers/dbController';

const router = Router();

router.get('/status', getDatabaseStatus);

export default router;
