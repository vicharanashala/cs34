import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { castVoteSchema } from '../validators/vote.validator';
import * as voteController from '../controllers/vote.controller';

const router = Router();

router.use(authenticate);

router.post('/', validate(castVoteSchema), voteController.castVote);
router.delete('/:targetId', voteController.removeVote);
router.get('/user', voteController.getUserVotes);

export default router;
