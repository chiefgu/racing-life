/**
 * News routes
 */

import { Router } from 'express';
import {
  getNews,
  getNewsById,
  getNewsByRace,
  getNewsByEntity,
  analyzeArticle,
  getSentimentStats,
  getPersonalizedNews,
} from '../controllers/news.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getNews);
router.get('/stats/sentiment', getSentimentStats);
router.get('/race/:raceId', getNewsByRace);
router.get('/entity/:entityName', getNewsByEntity);
router.get('/:id', getNewsById);

// Protected routes
router.get('/personalized/feed', authenticate, getPersonalizedNews);
router.post('/:id/analyze', authenticate, analyzeArticle);

export default router;
