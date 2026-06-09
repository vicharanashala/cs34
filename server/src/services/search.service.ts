import { Question, IQuestion } from '../models/Question';

/**
 * Returns top 5 question title matches for autocomplete suggestions.
 */
export const searchSuggestions = async (query: string): Promise<string[]> => {
  if (!query || typeof query !== 'string') return [];
  
  // Clean query and search by prefix/substring matching on title
  const questions = await Question.find({
    title: { $regex: query.trim(), $options: 'i' }
  })
    .limit(5)
    .select('title');

  return questions.map(q => q.title);
};

/**
 * Performs a hybrid search combining full-text search with tag filtering,
 * sorted by relevance textScore.
 */
export const hybridSearch = async (query?: string, tags?: string[]): Promise<IQuestion[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (tags && tags.length > 0) {
    filter.tags = { $in: tags };
  }

  if (query && query.trim()) {
    filter.$text = { $search: query.trim() };
    return Question.find(
      filter,
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .populate('author', 'name email spPoints');
  }

  // If no search query, fallback to sorting by creation date
  return Question.find(filter)
    .sort({ createdAt: -1 })
    .populate('author', 'name email spPoints');
};
