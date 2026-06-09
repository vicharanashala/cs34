import { Request, Response } from 'express';
import * as feedService from '../services/feed.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getGlobalFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const result = await feedService.getGlobalFeed(page, limit);
    sendSuccess(res, result.activities, 'Global feed fetched', 200, result.pagination);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const getUserFeed = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const result = await feedService.getUserFeed(req.user!._id.toString(), page, limit);
    sendSuccess(res, result.activities, 'User feed fetched', 200, result.pagination);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};
