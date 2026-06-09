import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/answers', adminController.getAllAnswers);
router.patch('/answers/:id/approve', adminController.approveAnswer);
router.patch('/answers/:id/reject', adminController.rejectAnswer);
router.patch('/answers/:id/best-answer', adminController.markBestAnswer);
router.get('/analytics', adminController.analytics);

export default router;
