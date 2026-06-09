import { Request, Response } from 'express';
import * as answerService from '../services/answer.service';
import { getAnalytics } from '../services/analytics.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getAllAnswers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const answers = await answerService.getAllAnswersForAdmin(status as string);
    sendSuccess(res, answers, 'Answers fetched');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const approveAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const answer = await answerService.approveAnswer(req.params.id);
    sendSuccess(res, answer, 'Answer approved');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const rejectAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const answer = await answerService.rejectAnswer(req.params.id);
    sendSuccess(res, answer, 'Answer rejected');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const markBestAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const answer = await answerService.markBestAnswer(req.params.id);
    sendSuccess(res, answer, 'Best answer marked');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const analytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await getAnalytics();
    sendSuccess(res, data, 'Analytics fetched');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};
