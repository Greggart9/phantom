import { z } from 'zod';

export const createJournalSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  excerpt: z.string().optional(),
  content: z.string().min(10, 'Content must be at least 10 characters long'),
  coverImage: z.string().optional(),
  isPublished: z.boolean().optional().default(true)
});

export const updateJournalSchema = createJournalSchema.partial();
