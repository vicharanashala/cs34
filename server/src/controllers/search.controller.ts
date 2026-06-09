import { Request, Response } from 'express';
import * as searchService from '../services/search.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getSearchSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    const suggestions = await searchService.searchSuggestions(q);
    sendSuccess(res, suggestions, 'Suggestions retrieved');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const executeHybridSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = req.query.q as string;
    const tags = req.query.tags
      ? (req.query.tags as string).split(',').filter(Boolean)
      : [];
    const results = await searchService.hybridSearch(q, tags);
    sendSuccess(res, results, 'Hybrid search executed');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};
