import { Question, IQuestion } from '../models/Question';
import { Answer } from '../models/Answer';
import { CreateQuestionInput, UpdateQuestionInput } from '../validators/question.validator';
import { createNotification } from './notification.service';
import { updateTrendingScore } from './trending.service';
import { logActivity } from './feed.service';
import mongoose from 'mongoose';


interface QuestionQuery {
  search?: string;
  tag?: string;
  answered?: string;
  sort?: 'recent' | 'trending' | 'upvotes' | 'answers';
  page?: number;
  limit?: number;
}

export const getQuestions = async (query: QuestionQuery) => {
  const { search, tag, answered, sort = 'recent', page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {};

  if (search) {
    filter.$text = { $search: search };
  }
  if (tag) {
    filter.tags = tag;
  }
  if (answered === 'true') {
    filter.answersCount = { $gt: 0 };
  } else if (answered === 'false') {
    filter.answersCount = 0;
  }

  // Determine sort criteria
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sortCriteria: Record<string, any> = { createdAt: -1 };
  if (sort === 'trending') {
    sortCriteria = { trendingScore: -1 };
  } else if (sort === 'upvotes') {
    sortCriteria = { upvotes: -1 };
  } else if (sort === 'answers') {
    sortCriteria = { answersCount: -1 };
  }

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email spPoints'),
    Question.countDocuments(filter),
  ]);

  return {
    questions,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getQuestionById = async (id: string) => {
  const question = await Question.findByIdAndUpdate(
    id,
    { $inc: { viewsCount: 1 } },
    { new: true }
  ).populate('author', 'name email spPoints');
  if (!question) throw new Error('Question not found');

  // Update trending score
  await updateTrendingScore(id);

  return question;
};

export const createQuestion = async (
  input: CreateQuestionInput,
  authorId: string
) => {
  const question = await Question.create({ ...input, author: authorId });
  
  // Log activity
  await logActivity(
    authorId,
    'asked',
    'question',
    question._id.toString(),
    { questionTitle: question.title }
  );

  return question.populate('author', 'name email spPoints');
};

export const updateQuestion = async (
  id: string,
  input: UpdateQuestionInput,
  userId: string
) => {
  const question = await Question.findById(id);
  if (!question) throw new Error('Question not found');
  if (String(question.author) !== userId) throw new Error('Not authorized');

  Object.assign(question, input);
  await question.save();
  return question.populate('author', 'name email spPoints');
};

export const deleteQuestion = async (id: string, userId: string, role: string) => {
  const question = await Question.findById(id);
  if (!question) throw new Error('Question not found');
  if (String(question.author) !== userId && role !== 'ADMIN') {
    throw new Error('Not authorized');
  }
  await Question.findByIdAndDelete(id);
};

export const getUserQuestions = async (userId: string) => {
  return Question.find({ author: userId }).sort({ createdAt: -1 });
};

export const acceptAnswer = async (
  questionId: string,
  answerId: string,
  userId: string
): Promise<IQuestion> => {
  const question = await Question.findById(questionId);
  if (!question) throw new Error('Question not found');

  // Only question author can accept
  if (question.author.toString() !== userId) {
    throw new Error('Only the question author can accept an answer');
  }

  const answer = await Answer.findById(answerId);
  if (!answer) throw new Error('Answer not found');

  // Answer must belong to this question
  if (answer.questionId.toString() !== questionId) {
    throw new Error('Answer does not belong to this question');
  }

  // Answer must be approved
  if (answer.status !== 'APPROVED') {
    throw new Error('Only approved answers can be accepted');
  }

  // Unset any previously accepted answer for this question
  await Answer.updateMany(
    { questionId, isAccepted: true },
    { isAccepted: false }
  );

  // Set the new accepted answer
  answer.isAccepted = true;
  await answer.save();

  // Update question's acceptedAnswerId
  question.acceptedAnswerId = answer._id;
  await question.save();

  // Send notification to answer author
  await createNotification(
    answer.authorId,
    `✅ Your answer was accepted by the question author! Question: "${question.title.substring(0, 50)}..."`
  );

  // Log activity
  await logActivity(
    userId,
    'accepted',
    'answer',
    answer._id.toString(),
    {
      questionId: question._id.toString(),
      questionTitle: question.title,
      answerAuthorId: answer.authorId.toString()
    }
  );

  return question;
};
