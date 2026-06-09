import { User } from '../models/User';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';

export const getAnalytics = async () => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [
    totalUsers,
    totalQuestions,
    totalAnswers,
    pendingAnswers,
    approvedAnswers,
    rejectedAnswers,
    activeQAuthors,
    activeAAuthors,
    trendingQuestions,
    acceptedQuestionsCount,
    topContributors,
  ] = await Promise.all([
    User.countDocuments({ role: 'USER' }),
    Question.countDocuments(),
    Answer.countDocuments(),
    Answer.countDocuments({ status: 'PENDING' }),
    Answer.countDocuments({ status: 'APPROVED' }),
    Answer.countDocuments({ status: 'REJECTED' }),
    Question.distinct('author', { createdAt: { $gte: sevenDaysAgo } }),
    Answer.distinct('authorId', { createdAt: { $gte: sevenDaysAgo } }),
    Question.find().sort({ trendingScore: -1 }).limit(5).populate('author', 'name spPoints'),
    Question.countDocuments({ acceptedAnswerId: { $ne: null } }),
    User.find({ role: 'USER' }).sort({ spPoints: -1 }).limit(5).select('name spPoints'),
  ]);

  const uniqueActiveAuthors = new Set([
    ...activeQAuthors.map(id => id.toString()),
    ...activeAAuthors.map(id => id.toString()),
  ]);

  const activeUsers = uniqueActiveAuthors.size;
  const acceptanceRate = totalQuestions > 0 ? Math.round((acceptedQuestionsCount / totalQuestions) * 100) : 0;
  const avgAnswersPerQ = totalQuestions > 0 ? parseFloat((totalAnswers / totalQuestions).toFixed(1)) : 0;

  return {
    totalUsers,
    totalQuestions,
    totalAnswers,
    pendingAnswers,
    approvedAnswers,
    rejectedAnswers,
    activeUsers,
    trendingQuestions,
    acceptanceRate,
    avgAnswersPerQ,
    topContributors,
  };
};
