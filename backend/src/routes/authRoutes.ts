import { Router } from 'express';
import { login, getProfile } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/profile', authenticateJWT, getProfile);

export default router;
