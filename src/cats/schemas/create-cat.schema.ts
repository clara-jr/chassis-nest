import { z } from 'zod';

export const createCatSchema = z.object({
  index: z.string(),
  string: z.string().optional(),
  number: z.number().optional(),
  stringsArray: z.array(z.string()).optional(),
});

export type CreateCatDto = z.infer<typeof createCatSchema>;
