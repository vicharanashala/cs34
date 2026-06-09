import { z } from 'zod';

export const createReportSchema = z.object({
  answerId: z.string().min(1, 'Answer ID is required'),
  reason: z.enum([
    'Spam',
    'Irrelevant',
    'Incorrect Information',
    'Offensive Content',
    'Duplicate Answer',
    'Other'
  ]),
  comment: z.string().optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
