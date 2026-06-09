import mongoose, { Document, Schema } from 'mongoose';

export type ActivityAction = 'asked' | 'answered' | 'upvoted' | 'downvoted' | 'accepted';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  action: ActivityAction;
  targetType: 'question' | 'answer';
  targetId: mongoose.Types.ObjectId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: ['asked', 'answered', 'upvoted', 'downvoted', 'accepted'],
      required: true,
    },
    targetType: {
      type: String,
      enum: ['question', 'answer'],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activitySchema.index({ createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>('Activity', activitySchema);
