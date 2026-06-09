import { Request, Response } from 'express';
import { registerUser, loginUser, getMe } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await registerUser(req.body);
    sendSuccess(res, result, 'Registration successful', 201);
  } catch (err) {
    sendError(res, (err as Error).message, 400);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await loginUser(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (err) {
    sendError(res, (err as Error).message, 401);
  }
};

export const me = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await getMe(String(req.user!._id));
    sendSuccess(res, user, 'Profile fetched');
  } catch (err) {
    sendError(res, (err as Error).message, 404);
  }
};
