import { Activity, IActivity } from '../models/Activity';

/**
 * Logs a new user activity.
 */
export const logActivity = async (
  userId: string,
  action: 'asked' | 'answered' | 'upvoted' | 'downvoted' | 'accepted',
  targetType: 'question' | 'answer',
  targetId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: Record<string, any> = {}
): Promise<IActivity> => {
  return Activity.create({
    userId,
    action,
    targetType,
    targetId,
    metadata,
  });
};

/**
 * Retrieves global activity feed paginated.
 */
export const getGlobalFeed = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    Activity.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email spPoints'),
    Activity.countDocuments(),
  ]);

  return {
    activities,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Retrieves a single user's activity feed paginated.
 */
export const getUserFeed = async (userId: string, page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    Activity.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email spPoints'),
    Activity.countDocuments({ userId }),
  ]);

  return {
    activities,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
