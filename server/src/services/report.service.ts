import { Report, IReport } from '../models/Report';
import { Answer } from '../models/Answer';
import { Question } from '../models/Question';
import { User } from '../models/User';
import { createNotification } from './notification.service';
import { updateTrendingScore } from './trending.service';

interface CreateReportInput {
  answerId: string;
  reason: 'Spam' | 'Irrelevant' | 'Incorrect Information' | 'Offensive Content' | 'Duplicate Answer' | 'Other';
  comment?: string;
}

/**
 * Creates a moderation report for an answer.
 * Increments the report count and automatically flags the answer if threshold (5) is reached.
 */
export const createReport = async (userId: string, input: CreateReportInput): Promise<IReport> => {
  const { answerId, reason, comment } = input;

  // 1. Verify answer exists
  const answer = await Answer.findById(answerId);
  if (!answer) throw new Error('Answer not found');

  // 2. Prevent users from reporting their own answers
  if (answer.authorId.toString() === userId) {
    throw new Error('You cannot report your own answer');
  }

  // 3. Prevent duplicate reports
  const existing = await Report.findOne({ reporterId: userId, answerId });
  if (existing) {
    throw new Error('You have already reported this answer');
  }

  // 4. Create the report
  const report = await Report.create({
    reporterId: userId,
    answerId,
    reason,
    comment,
  });

  // 5. Update answer reportCount and automatically flag if count >= 5
  answer.reportCount += 1;
  const oldFlagged = answer.isFlagged;
  if (answer.reportCount >= 5) {
    answer.isFlagged = true;
  }
  await answer.save();

  // 6. Notify admins if answer transitions to flagged
  if (answer.isFlagged && !oldFlagged) {
    const question = await Question.findById(answer.questionId);
    const qTitle = question ? question.title.substring(0, 50) : '';
    const admins = await User.find({ role: 'ADMIN' });
    const notificationMessage = `🚩 Answer flagged for Admin Review (5+ reports). Question: "${qTitle}..."`;
    
    for (const admin of admins) {
      await createNotification(admin._id.toString(), notificationMessage);
    }
  }

  return report;
};

/**
 * Retrieves reports matching status (for admin dashboard).
 */
export const getReports = async (status?: string): Promise<IReport[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};
  if (status && ['PENDING', 'REVIEWED', 'DISMISSED'].includes(status)) {
    filter.status = status;
  }

  return Report.find(filter)
    .sort({ createdAt: -1 })
    .populate('reporterId', 'name email')
    .populate({
      path: 'answerId',
      populate: [
        { path: 'authorId', select: 'name email spPoints' },
        { path: 'questionId', select: 'title' },
      ],
    });
};

/**
 * Marks report as reviewed. Optionally rejects the corresponding answer.
 */
export const reviewReport = async (reportId: string, rejectAnswer: boolean): Promise<IReport> => {
  const report = await Report.findById(reportId);
  if (!report) throw new Error('Report not found');

  report.status = 'REVIEWED';
  await report.save();

  if (rejectAnswer) {
    const answer = await Answer.findById(report.answerId);
    if (answer) {
      answer.status = 'REJECTED';
      await answer.save();

      // Notify the author
      await createNotification(
        answer.authorId.toString(),
        `❌ Your answer was rejected because it received multiple spam/moderation reports.`
      );
    }
  }

  return report;
};

/**
 * Dismisses a report. Optionally clears the answer's flagged state and resets report count.
 */
export const dismissReport = async (reportId: string, clearFlag: boolean): Promise<IReport> => {
  const report = await Report.findById(reportId);
  if (!report) throw new Error('Report not found');

  report.status = 'DISMISSED';
  await report.save();

  if (clearFlag) {
    const answer = await Answer.findById(report.answerId);
    if (answer) {
      answer.isFlagged = false;
      answer.reportCount = 0;
      await answer.save();

      // Dismiss all other pending reports for this answer
      await Report.updateMany(
        { answerId: answer._id, status: 'PENDING' },
        { status: 'DISMISSED' }
      );
    }
  }

  return report;
};

/**
 * Deletes the flagged answer and removes all associated reports.
 */
export const deleteAnswerByReport = async (reportId: string): Promise<void> => {
  const report = await Report.findById(reportId);
  if (!report) throw new Error('Report not found');

  const answer = await Answer.findById(report.answerId);
  if (answer) {
    // Delete the answer
    await Answer.findByIdAndDelete(answer._id);

    // Update answer count on question
    await Question.findByIdAndUpdate(answer.questionId, { $inc: { answersCount: -1 } });
    await updateTrendingScore(answer.questionId.toString());

    // Delete all related reports for this answer
    await Report.deleteMany({ answerId: answer._id });

    // Notify author
    await createNotification(
      answer.authorId.toString(),
      `❌ Your answer was removed because of multiple spam/moderation reports.`
    );
  }
};
