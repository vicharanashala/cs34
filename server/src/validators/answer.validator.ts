import { z } from 'zod';

export const createAnswerSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  content: z.string().min(10, 'Answer must be at least 10 characters'),
});

export const updateAnswerSchema = z.object({
  content: z.string().min(10, 'Answer must be at least 10 characters'),
});

export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
export type UpdateAnswerInput = z.infer<typeof updateAnswerSchema>;
