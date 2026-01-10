import { Router } from 'express'
import { listUsers, getUserById, deleteUser } from '../controllers/adminController.js';
import authenticate from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const router = Router();

router.get('/list', authenticate, adminAuth, listUsers);
router.get('/:userId', authenticate, adminAuth, getUserById);
router.delete('/:userId', authenticate, adminAuth, deleteUser);

export default router;