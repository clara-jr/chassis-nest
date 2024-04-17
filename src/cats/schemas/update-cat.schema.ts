import { z } from 'zod';

export const updateCatSchema = z.object({
  index: z.string().optional(),
  string: z.string().optional(),
  number: z.number().optional(),
  stringsArray: z.array(z.string()).optional(),
});

export type UpdateCatDto = z.infer<typeof updateCatSchema>;
