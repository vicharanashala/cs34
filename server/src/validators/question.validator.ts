import { z } from 'zod';

const VALID_TAGS = [
  'Onboarding & VINS',
  'Timelines & Clashes',
  'NOC Compliance',
  'Dashboard & Offers',
  'Certification & Credits',
  'ViBe LMS Tech',
  'Yaksha AI Engine',
  'Communication Tech',
  'Rosetta Journaling',
  'Team & Code Engineering'
] as const;

export const createQuestionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  tags: z
    .array(z.enum(VALID_TAGS))
    .min(1, 'At least one tag is required')
    .max(5, 'Maximum 5 tags allowed'),
});

export const updateQuestionSchema = z.object({
  title: z.string().min(5).max(200).optional(),
  description: z.string().min(20).optional(),
  tags: z.array(z.enum(VALID_TAGS)).min(1).max(5).optional(),
});

export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;
