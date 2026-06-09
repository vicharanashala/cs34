import { z } from 'zod';

export const createBookmarkSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
});

export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
