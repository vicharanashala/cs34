import { User } from '../models/User';
import { ReputationLog, IReputationLog } from '../models/ReputationLog';

export const SP_RULES = {
  ANSWER_APPROVED: 10,
  UPVOTE_RECEIVED: 2,
  DOWNVOTE_RECEIVED: -1,
  BEST_ANSWER: 15,
  ANSWER_ACCEPTED: 15,
};

export const awardSP = async (
  userId: string,
  amount: number,
  reason: string,
  sourceId?: string
): Promise<number> => {
  // Use atomic update with floor at 0
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const newTotal = Math.max(0, user.spPoints + amount);
  user.spPoints = newTotal;
  await user.save();

  // Log the reputation change
  await ReputationLog.create({
    userId,
    amount,
    reason,
    sourceId: sourceId || undefined,
  });

  return newTotal;
};

export const getReputationHistory = async (
  userId: string,
  limit: number = 30
): Promise<IReputationLog[]> => {
  return ReputationLog.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};
