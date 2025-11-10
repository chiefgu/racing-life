import { Router } from 'express';
import {
  getBookmakers,
  getBookmakerById,
  getBookmakerPromotions,
} from '../controllers/bookmakers.controller';

const router = Router();

router.get('/', getBookmakers);
router.get('/:id', getBookmakerById);
router.get('/:id/promotions', getBookmakerPromotions);

export default router;
