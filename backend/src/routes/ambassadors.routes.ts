import { Router } from 'express';
import {
  applyAsAmbassador,
  getPendingApplications,
  approveAmbassador,
  rejectAmbassador,
  suspendAmbassador,
  activateAmbassador,
  getAmbassadorById,
  updateAmbassadorProfile,
  getAllAmbassadors,
  getAmbassadorStats,
  updateCommissionRate,
} from '../controllers/ambassadors.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', optionalAuth, getAllAmbassadors);
router.get('/:id', getAmbassadorById);

// Authenticated user routes
router.post('/apply', authenticate, applyAsAmbassador);

// Ambassador routes
router.put('/:id', authenticate, updateAmbassadorProfile);
router.get('/:id/stats', authenticate, getAmbassadorStats);

// Admin routes
router.get('/admin/pending', authenticate, authorize('admin'), getPendingApplications);
router.put('/:id/approve', authenticate, authorize('admin'), approveAmbassador);
router.put('/:id/reject', authenticate, authorize('admin'), rejectAmbassador);
router.put('/:id/suspend', authenticate, authorize('admin'), suspendAmbassador);
router.put('/:id/activate', authenticate, authorize('admin'), activateAmbassador);
router.put('/:id/commission', authenticate, authorize('admin'), updateCommissionRate);

export default router;
