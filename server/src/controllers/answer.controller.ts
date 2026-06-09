import { Request, Response } from 'express';
import * as answerService from '../services/answer.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const createAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const answer = await answerService.createAnswer(req.body, String(req.user!._id));
    sendSuccess(res, answer, 'Answer submitted', 201);
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const updateAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const answer = await answerService.updateAnswer(
      req.params.id,
      req.body,
      String(req.user!._id)
    );
    sendSuccess(res, answer, 'Answer updated');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const deleteAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    await answerService.deleteAnswer(req.params.id, String(req.user!._id));
    sendSuccess(res, null, 'Answer deleted');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const getAnswersByQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const answers = await answerService.getAnswersByQuestion(req.params.questionId);
    sendSuccess(res, answers, 'Answers fetched');
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};
