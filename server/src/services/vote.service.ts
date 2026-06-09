import { Vote, IVote } from '../models/Vote';
import { Question } from '../models/Question';
import { Answer } from '../models/Answer';
import mongoose from 'mongoose';
import { awardSP, SP_RULES } from './sp.service';
import { updateTrendingScore } from './trending.service';

interface CastVoteInput {
  targetId: string;
  targetType: 'question' | 'answer';
  value: 1 | -1;
}

interface VoteResult {
  vote: IVote | null;
  action: 'created' | 'changed' | 'removed';
  upvotes: number;
  downvotes: number;
}

// Helper to avoid union type issues with Mongoose model methods
const findTarget = async (targetType: string, targetId: string) => {
  if (targetType === 'question') return Question.findById(targetId);
  return Answer.findById(targetId);
};

const updateTargetVotes = async (targetType: string, targetId: string, update: Record<string, number>) => {
  if (targetType === 'question') return Question.findByIdAndUpdate(targetId, { $inc: update });
  return Answer.findByIdAndUpdate(targetId, { $inc: update });
};

const getTargetCounts = async (targetType: string, targetId: string) => {
  if (targetType === 'question') return Question.findById(targetId).select('upvotes downvotes');
  return Answer.findById(targetId).select('upvotes downvotes');
};

export const castVote = async (userId: string, input: CastVoteInput): Promise<VoteResult> => {
  const { targetId, targetType, value } = input;

  // Verify target exists
  const target = await findTarget(targetType, targetId);
  if (!target) throw new Error(`${targetType} not found`);

  // Determine the author of the target content
  const targetAuthorId = targetType === 'question'
    ? (target as any).author.toString()
    : (target as any).authorId.toString();

  // Check for existing vote
  const existingVote = await Vote.findOne({ userId, targetId });

  let action: 'created' | 'changed' | 'removed';
  let vote: IVote | null = null;

  if (existingVote) {
    if (existingVote.value === value) {
      // Same vote — toggle off (remove)
      await Vote.deleteOne({ _id: existingVote._id });
      // Reverse the count
      if (value === 1) {
        await updateTargetVotes(targetType, targetId, { upvotes: -1 });
      } else {
        await updateTargetVotes(targetType, targetId, { downvotes: -1 });
      }
      // Reverse SP award (only if not self-vote)
      if (userId !== targetAuthorId) {
        if (value === 1) {
          await awardSP(targetAuthorId, -SP_RULES.UPVOTE_RECEIVED, 'upvote_removed', existingVote._id.toString());
        } else {
          await awardSP(targetAuthorId, -SP_RULES.DOWNVOTE_RECEIVED, 'downvote_removed', existingVote._id.toString());
        }
      }
      action = 'removed';
    } else {
      // Different vote — change it
      existingVote.value = value;
      await existingVote.save();
      if (value === 1) {
        // Changed from down to up
        await updateTargetVotes(targetType, targetId, { upvotes: 1, downvotes: -1 });
      } else {
        // Changed from up to down
        await updateTargetVotes(targetType, targetId, { upvotes: -1, downvotes: 1 });
      }
      // Reverse old SP + apply new SP (only if not self-vote)
      if (userId !== targetAuthorId) {
        if (value === 1) {
          // Changed from down to up: reverse downvote + award upvote
          await awardSP(targetAuthorId, -SP_RULES.DOWNVOTE_RECEIVED, 'downvote_removed', existingVote._id.toString());
          await awardSP(targetAuthorId, SP_RULES.UPVOTE_RECEIVED, 'upvote_received', existingVote._id.toString());
        } else {
          // Changed from up to down: reverse upvote + award downvote
          await awardSP(targetAuthorId, -SP_RULES.UPVOTE_RECEIVED, 'upvote_removed', existingVote._id.toString());
          await awardSP(targetAuthorId, SP_RULES.DOWNVOTE_RECEIVED, 'downvote_received', existingVote._id.toString());
        }
      }
      vote = existingVote;
      action = 'changed';
    }
  } else {
    // New vote
    vote = await Vote.create({
      userId,
      targetId,
      targetType,
      value,
    });
    if (value === 1) {
      await updateTargetVotes(targetType, targetId, { upvotes: 1 });
    } else {
      await updateTargetVotes(targetType, targetId, { downvotes: 1 });
    }
    // Award SP for new vote (only if not self-vote)
    if (userId !== targetAuthorId) {
      if (value === 1) {
        await awardSP(targetAuthorId, SP_RULES.UPVOTE_RECEIVED, 'upvote_received', vote._id.toString());
      } else {
        await awardSP(targetAuthorId, SP_RULES.DOWNVOTE_RECEIVED, 'downvote_received', vote._id.toString());
      }
    }
    action = 'created';
  }

  // Update trending score if target is a question
  if (targetType === 'question') {
    await updateTrendingScore(targetId);
  }

  // Get updated counts
  const updated = await getTargetCounts(targetType, targetId);

  return {
    vote,
    action,
    upvotes: updated?.upvotes ?? 0,
    downvotes: updated?.downvotes ?? 0,
  };
};

export const removeVote = async (userId: string, targetId: string): Promise<void> => {
  const vote = await Vote.findOne({ userId, targetId });
  if (!vote) throw new Error('Vote not found');

  if (vote.value === 1) {
    await updateTargetVotes(vote.targetType, targetId, { upvotes: -1 });
  } else {
    await updateTargetVotes(vote.targetType, targetId, { downvotes: -1 });
  }

  await Vote.deleteOne({ _id: vote._id });

  // Update trending score if target is a question
  if (vote.targetType === 'question') {
    await updateTrendingScore(targetId);
  }
};

export const getUserVote = async (userId: string, targetId: string): Promise<IVote | null> => {
  return Vote.findOne({ userId, targetId });
};

export const getUserVotesForTargets = async (userId: string, targetIds: string[]): Promise<IVote[]> => {
  return Vote.find({
    userId,
    targetId: { $in: targetIds.map(id => new mongoose.Types.ObjectId(id)) },
  });
};
