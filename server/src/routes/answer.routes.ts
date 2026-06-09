import { Router } from 'express';
import * as answerController from '../controllers/answer.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createAnswerSchema, updateAnswerSchema } from '../validators/answer.validator';

const router = Router();

router.get('/question/:questionId', answerController.getAnswersByQuestion);
router.post('/', authenticate, validate(createAnswerSchema), answerController.createAnswer);
router.put('/:id', authenticate, validate(updateAnswerSchema), answerController.updateAnswer);
router.delete('/:id', authenticate, answerController.deleteAnswer);

export default router;
