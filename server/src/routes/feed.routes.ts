import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as feedController from '../controllers/feed.controller';

const router = Router();

// GET /api/feed/global (public)
router.get('/global', feedController.getGlobalFeed);

// GET /api/feed/user (authenticated)
router.get('/user', authenticate, feedController.getUserFeed);

export default router;
