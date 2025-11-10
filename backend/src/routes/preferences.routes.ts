import { Router } from 'express';
import {
  getPreferences,
  updatePreferences,
  sendTestNotification,
  saveFCMToken,
  deleteFCMToken,
} from '../controllers/preferences.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate); // All preferences routes require authentication

router.get('/', getPreferences);
router.put('/', updatePreferences);
router.post('/notifications/test', sendTestNotification);
router.post('/notifications/token', saveFCMToken);
router.delete('/notifications/token', deleteFCMToken);

export default router;
