import { Router } from 'express'
import { validateBody } from '../middleware/validation.js';
import { register, login } from '../controllers/authController.js';
import { registerSchema, loginSchema } from '../models/auth.js';


const router = Router();

router.post('/register', validateBody(registerSchema), register)
router.post('/login', validateBody(loginSchema), login)

export default router;