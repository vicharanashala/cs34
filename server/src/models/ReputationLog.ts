import mongoose, { Schema, Document } from 'mongoose';

export interface IReputationLog extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  reason: string;
  sourceId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const reputationLogSchema = new Schema<IReputationLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    reason: { type: String, required: true },
    sourceId: { type: Schema.Types.ObjectId, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

reputationLogSchema.index({ userId: 1, createdAt: -1 });

export const ReputationLog = mongoose.model<IReputationLog>('ReputationLog', reputationLogSchema);
