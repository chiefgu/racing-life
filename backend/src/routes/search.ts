import { Router } from 'express';
import { search, trackClick } from '../controllers/searchController';

const router = Router();

router.get('/', search);
router.post('/click', trackClick);

export default router;
