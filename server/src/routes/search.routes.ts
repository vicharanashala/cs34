import { Router } from 'express';
import * as searchController from '../controllers/search.controller';

const router = Router();

// GET /api/search/suggestions?q=...
router.get('/suggestions', searchController.getSearchSuggestions);

// GET /api/search?q=...&tags=...
router.get('/', searchController.executeHybridSearch);

export default router;
