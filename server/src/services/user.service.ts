import { User } from '../models/User';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import { ReputationLog } from '../models/ReputationLog';

export const getUserProfile = async (userId: string) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw new Error('User not found');

  const [questionsAsked, answersSubmitted, approvedAnswers, bestAnswers, reputationHistory, topAnswers] = await Promise.all([
    Question.countDocuments({ author: userId }),
    Answer.countDocuments({ authorId: userId }),
    Answer.countDocuments({ authorId: userId, status: 'APPROVED' }),
    Answer.countDocuments({ authorId: userId, isBestAnswer: true }),
    ReputationLog.find({ userId }).sort({ createdAt: -1 }).limit(30),
    Answer.find({ authorId: userId }).sort({ upvotes: -1 }).limit(5).populate('questionId', 'title'),
  ]);

  // Calculate badge progression percentage
  let badgeProgress = 0;
  const sp = user.spPoints;
  if (sp <= 50) {
    badgeProgress = Math.round((sp / 50) * 100);
  } else if (sp <= 200) {
    badgeProgress = Math.round(((sp - 50) / 150) * 100);
  } else if (sp <= 500) {
    badgeProgress = Math.round(((sp - 200) / 300) * 100);
  } else {
    badgeProgress = 100;
  }

  return {
    user,
    stats: {
      questionsAsked,
      answersSubmitted,
      approvedAnswers,
      bestAnswers,
      badgeProgress,
    },
    reputationHistory,
    topAnswers,
  };
};

export const getLeaderboard = async () => {
  return User.find({ role: 'USER' })
    .sort({ spPoints: -1 })
    .limit(50)
    .select('name email spPoints createdAt');
};
