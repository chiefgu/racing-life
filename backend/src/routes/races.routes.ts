import { Router } from 'express';
import {
  getRaces,
  getRaceById,
  getRaceOdds,
  getRaceOddsHistory,
} from '../controllers/races.controller';

const router = Router();

router.get('/', getRaces);
router.get('/:id', getRaceById);
router.get('/:id/odds', getRaceOdds);
router.get('/:id/history', getRaceOddsHistory);

export default router;
