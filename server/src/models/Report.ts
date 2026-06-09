import mongoose, { Document, Schema } from 'mongoose';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'DISMISSED';
export type ReportReason =
  | 'Spam'
  | 'Irrelevant'
  | 'Incorrect Information'
  | 'Offensive Content'
  | 'Duplicate Answer'
  | 'Other';

export interface IReport extends Document {
  answerId: mongoose.Types.ObjectId;
  reporterId: mongoose.Types.ObjectId;
  reason: ReportReason;
  comment?: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    answerId: { type: Schema.Types.ObjectId, ref: 'Answer', required: true },
    reporterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: {
      type: String,
      enum: [
        'Spam',
        'Irrelevant',
        'Incorrect Information',
        'Offensive Content',
        'Duplicate Answer',
        'Other'
      ],
      required: true,
    },
    comment: { type: String, default: '' },
    status: {
      type: String,
      enum: ['PENDING', 'REVIEWED', 'DISMISSED'],
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

// Enforce one report per user per answer and speed up status-based admin searches
ReportSchema.index({ reporterId: 1, answerId: 1 }, { unique: true });
ReportSchema.index({ answerId: 1 });
ReportSchema.index({ status: 1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);
