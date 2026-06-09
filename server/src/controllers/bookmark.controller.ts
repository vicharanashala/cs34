import { Request, Response } from 'express';
import * as bookmarkService from '../services/bookmark.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookmarks = await bookmarkService.getUserBookmarks(String(req.user!._id));
    sendSuccess(res, bookmarks, 'Bookmarks fetched');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const addBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookmark = await bookmarkService.addBookmark(
      String(req.user!._id),
      req.body.questionId
    );
    sendSuccess(res, bookmark, 'Bookmarked', 201);
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const removeBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    await bookmarkService.removeBookmark(req.params.id, String(req.user!._id));
    sendSuccess(res, null, 'Bookmark removed');
  } catch (err) {
    sendError(res, (err as Error).message, 404);
  }
};
