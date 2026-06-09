import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { validate } from '../middleware/validate.middleware';
import { createReportSchema } from '../validators/report.validator';
import * as reportController from '../controllers/report.controller';

const userRoutes = Router();

// POST /api/reports
userRoutes.post('/', authenticate, validate(createReportSchema), reportController.createReport);

const adminRoutes = Router();

// Secure all admin report endpoints
adminRoutes.use(authenticate, requireRole('ADMIN'));

// GET /api/admin/reports
adminRoutes.get('/', reportController.getReports);

// PATCH /api/admin/reports/:id/review
adminRoutes.patch('/:id/review', reportController.reviewReport);

// PATCH /api/admin/reports/:id/dismiss
adminRoutes.patch('/:id/dismiss', reportController.dismissReport);

// DELETE /api/admin/reports/:id
adminRoutes.delete('/:id', reportController.deleteAnswerReport);

export { userRoutes as reportUserRoutes, adminRoutes as reportAdminRoutes };
