import { z } from 'zod';

export const paginationQuerySchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export type PaginationQueryDto = z.infer<typeof paginationQuerySchema>;
