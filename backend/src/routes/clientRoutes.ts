import { Router } from 'express';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../controllers/clientController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, getClients);
router.get('/:id', authenticateJWT, getClientById);
router.post('/', authenticateJWT, createClient);
router.put('/:id', authenticateJWT, updateClient);
router.delete('/:id', authenticateJWT, deleteClient);

export default router;
