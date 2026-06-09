import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/leaderboard', userController.getLeaderboard);
router.get('/profile', authenticate, userController.getProfile);
router.get('/activity', authenticate, userController.getActivity);

export default router;
