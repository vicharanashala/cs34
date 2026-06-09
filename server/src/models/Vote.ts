import mongoose, { Schema, Document } from 'mongoose';

export type VoteValue = 1 | -1;
export type VoteTargetType = 'question' | 'answer';

export interface IVote extends Document {
  userId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  targetType: VoteTargetType;
  value: VoteValue;
  createdAt: Date;
  updatedAt: Date;
}

const voteSchema = new Schema<IVote>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: ['question', 'answer'], required: true },
    value: { type: Number, enum: [1, -1], required: true },
  },
  { timestamps: true }
);

voteSchema.index({ userId: 1, targetId: 1 }, { unique: true });
voteSchema.index({ targetId: 1 });
voteSchema.index({ userId: 1 });

export const Vote = mongoose.model<IVote>('Vote', voteSchema);
