import { Router } from 'express';
import {
  register,
  login,
  getProfile,
  changePassword,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getProfile);
router.put('/password', authenticate, changePassword);

export default router;
