import { Router } from 'express';
import {
  getFeaturedContent,
  getAllFeaturedContent,
  createFeaturedContent,
  updateFeaturedContent,
  deleteFeaturedContent,
} from '../controllers/featured-content.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// Public route to get active featured content
router.get('/', getFeaturedContent);

// Admin routes
router.get('/all', authenticate, requireAdmin, getAllFeaturedContent);
router.post('/', authenticate, requireAdmin, createFeaturedContent);
router.put('/:id', authenticate, requireAdmin, updateFeaturedContent);
router.delete('/:id', authenticate, requireAdmin, deleteFeaturedContent);

export default router;
