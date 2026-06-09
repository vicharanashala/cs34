import { Bookmark } from '../models/Bookmark';
import { Question } from '../models/Question';

export const getUserBookmarks = async (userId: string) => {
  return Bookmark.find({ userId })
    .sort({ createdAt: -1 })
    .populate({
      path: 'questionId',
      populate: { path: 'author', select: 'name email spPoints' },
    });
};

export const addBookmark = async (userId: string, questionId: string) => {
  const question = await Question.findById(questionId);
  if (!question) throw new Error('Question not found');

  try {
    const bookmark = await Bookmark.create({ userId, questionId });
    return bookmark.populate('questionId');
  } catch (err: unknown) {
    const e = err as { code?: number };
    if (e.code === 11000) throw new Error('Already bookmarked');
    throw err;
  }
};

export const removeBookmark = async (bookmarkId: string, userId: string) => {
  const bookmark = await Bookmark.findOneAndDelete({ _id: bookmarkId, userId });
  if (!bookmark) throw new Error('Bookmark not found');
};

export const removeBookmarkByQuestion = async (userId: string, questionId: string) => {
  const bookmark = await Bookmark.findOneAndDelete({ userId, questionId });
  if (!bookmark) throw new Error('Bookmark not found');
};

export const isBookmarked = async (userId: string, questionId: string) => {
  const bookmark = await Bookmark.findOne({ userId, questionId });
  return !!bookmark;
};
