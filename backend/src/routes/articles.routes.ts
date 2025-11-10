import { Router } from 'express';
import {
  createArticle,
  getArticleById,
  updateArticle,
  deleteArticle,
  getArticles,
  getArticlesByAmbassador,
  getPendingArticles,
  publishArticle,
  rejectArticle,
  archiveArticle,
  getContentAnalytics,
} from '../controllers/articles.controller';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getArticles);
router.get('/ambassador/:ambassadorId', optionalAuth, getArticlesByAmbassador);
router.get('/:id', optionalAuth, getArticleById);

// Ambassador routes
router.post('/', authenticate, authorize('ambassador', 'admin'), createArticle);
router.put('/:id', authenticate, authorize('ambassador', 'admin'), updateArticle);
router.delete('/:id', authenticate, authorize('ambassador', 'admin'), deleteArticle);
router.put('/:id/archive', authenticate, archiveArticle);

// Admin routes
router.get('/admin/pending', authenticate, authorize('admin'), getPendingArticles);
router.get('/admin/analytics', authenticate, authorize('admin'), getContentAnalytics);
router.put('/:id/publish', authenticate, authorize('admin'), publishArticle);
router.put('/:id/reject', authenticate, authorize('admin'), rejectArticle);

export default router;
