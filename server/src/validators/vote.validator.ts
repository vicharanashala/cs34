import { z } from 'zod';

export const castVoteSchema = z.object({
  targetId: z.string().min(1, 'Target ID is required'),
  targetType: z.enum(['question', 'answer']),
  value: z.union([z.literal(1), z.literal(-1)]),
});

export type CastVoteInput = z.infer<typeof castVoteSchema>;
