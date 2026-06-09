import { Question, IQuestion } from '../models/Question';

/**
 * Calculates and updates the trending score for a specific question.
 * Formula: (upvotes * 3) + (answersCount * 2) + (viewsCount * 0.5) + recencyBoost
 * Where recencyBoost = max(0, 50 - hoursSinceCreation)
 */
export const updateTrendingScore = async (questionId: string): Promise<void> => {
  try {
    const question = await Question.findById(questionId);
    if (!question) return;

    const hoursSinceCreation = (Date.now() - question.createdAt.getTime()) / (1000 * 60 * 60);
    const recencyBoost = Math.max(0, 50 - hoursSinceCreation);
    const score = (question.upvotes * 3) + (question.answersCount * 2) + (question.viewsCount * 0.5) + recencyBoost;

    question.trendingScore = score;
    await question.save();
  } catch (error) {
    console.error(`Failed to update trending score for question ${questionId}:`, error);
  }
};

/**
 * Retrieves questions sorted by trending score descending.
 */
export const getTrendingQuestions = async (limit: number = 5): Promise<IQuestion[]> => {
  return Question.find()
    .sort({ trendingScore: -1 })
    .limit(limit)
    .populate('author', 'name email spPoints');
};

/**
 * Retrieves questions sorted by upvotes descending.
 */
export const getMostUpvoted = async (limit: number = 5): Promise<IQuestion[]> => {
  return Question.find()
    .sort({ upvotes: -1 })
    .limit(limit)
    .populate('author', 'name email spPoints');
};

/**
 * Retrieves questions sorted by answersCount descending.
 */
export const getMostAnswered = async (limit: number = 5): Promise<IQuestion[]> => {
  return Question.find()
    .sort({ answersCount: -1 })
    .limit(limit)
    .populate('author', 'name email spPoints');
};
