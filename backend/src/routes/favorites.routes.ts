import { Router } from 'express';
import { saveFavorites, getFavorites, removeFavorite } from '../controllers/favorites.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', saveFavorites);
router.get('/', getFavorites);
router.delete('/:type/:name', removeFavorite);

export default router;
