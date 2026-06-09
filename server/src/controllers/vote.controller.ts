import { Request, Response } from 'express';
import * as voteService from '../services/vote.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const castVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await voteService.castVote(req.user!._id.toString(), req.body);
    sendSuccess(res, result, `Vote ${result.action}`);
  } catch (err: any) {
    sendError(res, err.message || 'Failed to cast vote', 400);
  }
};

export const removeVote = async (req: Request, res: Response): Promise<void> => {
  try {
    await voteService.removeVote(req.user!._id.toString(), req.params.targetId);
    sendSuccess(res, null, 'Vote removed');
  } catch (err: any) {
    sendError(res, err.message || 'Failed to remove vote', 400);
  }
};

export const getUserVotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const targetIds = (req.query.targetIds as string)?.split(',').filter(Boolean) || [];
    if (targetIds.length === 0) {
      sendSuccess(res, [], 'No target IDs provided');
      return;
    }
    const votes = await voteService.getUserVotesForTargets(req.user!._id.toString(), targetIds);
    sendSuccess(res, votes, 'User votes retrieved');
  } catch (err: any) {
    sendError(res, err.message || 'Failed to get votes', 400);
  }
};
