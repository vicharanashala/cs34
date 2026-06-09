import { Request, Response } from 'express';
import * as reportService from '../services/report.service';
import { sendSuccess, sendError } from '../utils/apiResponse';

export const createReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const report = await reportService.createReport(req.user!._id.toString(), req.body);
    sendSuccess(res, report, 'Report submitted successfully', 201);
  } catch (err: any) {
    sendError(res, err.message || 'Failed to submit report', 400);
  }
};

export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string;
    const reports = await reportService.getReports(status);
    sendSuccess(res, reports, 'Reports fetched successfully');
  } catch (err: any) {
    sendError(res, err.message || 'Failed to fetch reports', 400);
  }
};

export const reviewReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const report = await reportService.reviewReport(
      req.params.id,
      req.body.rejectAnswer === true
    );
    sendSuccess(res, report, 'Report marked as reviewed');
  } catch (err: any) {
    sendError(res, err.message || 'Failed to review report', 400);
  }
};

export const dismissReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const report = await reportService.dismissReport(
      req.params.id,
      req.body.clearFlag === true
    );
    sendSuccess(res, report, 'Report dismissed');
  } catch (err: any) {
    sendError(res, err.message || 'Failed to dismiss report', 400);
  }
};

export const deleteAnswerReport = async (req: Request, res: Response): Promise<void> => {
  try {
    await reportService.deleteAnswerByReport(req.params.id);
    sendSuccess(res, null, 'Answer removed successfully');
  } catch (err: any) {
    sendError(res, err.message || 'Failed to remove answer', 400);
  }
};
