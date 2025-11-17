import { Router } from 'express';
import { getMarketMovers } from '../controllers/market-movers.controller';

const router = Router();

// Public route to get market movers
router.get('/', getMarketMovers);

export default router;
