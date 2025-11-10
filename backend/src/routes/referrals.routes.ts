import { Router } from 'express';
import {
  trackClick,
  trackConversion,
  getReferralStats,
} from '../controllers/referrals.controller';
import { optionalAuth, authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/click', optionalAuth, trackClick);
router.post('/conversion', trackConversion);
router.get('/stats', authenticate, getReferralStats);

export default router;
