import { Router } from 'express';
import * as questionController from '../controllers/question.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createQuestionSchema, updateQuestionSchema } from '../validators/question.validator';

const router = Router();

router.get('/', questionController.getQuestions);
router.get('/:id', questionController.getQuestion);
router.post('/', authenticate, validate(createQuestionSchema), questionController.createQuestion);
router.put('/:id', authenticate, validate(updateQuestionSchema), questionController.updateQuestion);
router.delete('/:id', authenticate, questionController.deleteQuestion);
router.patch('/:id/accept-answer', authenticate, questionController.acceptAnswer);

export default router;
