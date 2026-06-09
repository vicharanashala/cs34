import mongoose, { Document, Schema } from 'mongoose';

export type AnswerStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IAnswer extends Document {
  questionId: mongoose.Types.ObjectId;
  authorId: mongoose.Types.ObjectId;
  content: string;
  status: AnswerStatus;
  isBestAnswer: boolean;
  rewarded: boolean;
  upvotes: number;
  downvotes: number;
  isAccepted: boolean;
  reportCount: number;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    isBestAnswer: { type: Boolean, default: false },
    rewarded: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    isAccepted: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0 },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AnswerSchema.index({ questionId: 1 });
AnswerSchema.index({ authorId: 1 });
AnswerSchema.index({ status: 1 });

export const Answer = mongoose.model<IAnswer>('Answer', AnswerSchema);
