import { Router } from 'express';
import * as bookmarkController from '../controllers/bookmark.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBookmarkSchema } from '../validators/bookmark.validator';

const router = Router();

router.use(authenticate);
router.get('/', bookmarkController.getBookmarks);
router.post('/', validate(createBookmarkSchema), bookmarkController.addBookmark);
router.delete('/:id', bookmarkController.removeBookmark);

export default router;
