import { Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await notificationService.getUserNotifications(String(req.user!._id));
    sendSuccess(res, result, 'Notifications fetched');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const markRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const notification = await notificationService.markRead(req.params.id, String(req.user!._id));
    sendSuccess(res, notification, 'Notification marked as read');
  } catch (err) {
    sendError(res, (err as Error).message, 404);
  }
};

export const markAllRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await notificationService.markAllRead(String(req.user!._id));
    sendSuccess(res, null, 'All notifications marked as read');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};
