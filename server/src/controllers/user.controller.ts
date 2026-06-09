import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { getUserAnswers } from '../services/answer.service';
import { getUserQuestions } from '../services/question.service';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await userService.getUserProfile(String(req.user!._id));
    sendSuccess(res, result, 'Profile fetched');
  } catch (err) {
    sendError(res, (err as Error).message, 404);
  }
};

export const getLeaderboard = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await userService.getLeaderboard();
    sendSuccess(res, users, 'Leaderboard fetched');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const getActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String(req.user!._id);
    const [questions, answers] = await Promise.all([
      getUserQuestions(userId),
      getUserAnswers(userId),
    ]);
    sendSuccess(res, { questions, answers }, 'Activity fetched');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};
