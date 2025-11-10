import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import {
  getDashboardMetrics,
  getRecentActivity,
  getSystemHealth,
} from '../controllers/admin.controller';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, requireAdmin);

// Import sources controller
import {
  getScraperSources,
  getBookmakerSources,
  updateScraperSource,
  resetScraperFailures,
  getScraperMetrics,
} from '../controllers/sources.controller';

// Dashboard metrics
router.get('/dashboard/metrics', getDashboardMetrics);
router.get('/dashboard/activity', getRecentActivity);
router.get('/dashboard/system-health', getSystemHealth);

// Source monitoring
router.get('/sources/scrapers', getScraperSources);
router.get('/sources/bookmakers', getBookmakerSources);
router.put('/sources/scrapers/:id', updateScraperSource);
router.post('/sources/scrapers/:id/reset', resetScraperFailures);
router.get('/sources/scrapers/:id/metrics', getScraperMetrics);

export default router;
