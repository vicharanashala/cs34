import { Request, Response } from 'express';
import * as questionService from '../services/question.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, tag, answered, sort, page, limit } = req.query;
    const result = await questionService.getQuestions({
      search: search as string,
      tag: tag as string,
      answered: answered as string,
      sort: sort as any,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 10,
    });
    sendSuccess(res, result.questions, 'Questions fetched', 200, result.pagination);
  } catch (err) {
    sendError(res, (err as Error).message);
  }
};

export const getQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const question = await questionService.getQuestionById(req.params.id);
    sendSuccess(res, question, 'Question fetched');
  } catch (err) {
    sendError(res, (err as Error).message, 404);
  }
};

export const createQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const question = await questionService.createQuestion(req.body, String(req.user!._id));
    sendSuccess(res, question, 'Question created', 201);
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const updateQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const question = await questionService.updateQuestion(
      req.params.id,
      req.body,
      String(req.user!._id)
    );
    sendSuccess(res, question, 'Question updated');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const deleteQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    await questionService.deleteQuestion(
      req.params.id,
      String(req.user!._id),
      req.user!.role
    );
    sendSuccess(res, null, 'Question deleted');
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const acceptAnswer = async (req: Request, res: Response): Promise<void> => {
  try {
    const question = await questionService.acceptAnswer(
      req.params.id,
      req.body.answerId,
      req.user!._id.toString()
    );
    sendSuccess(res, question, 'Answer accepted');
  } catch (err: any) {
    sendError(res, err.message || 'Failed to accept answer', 400);
  }
};
