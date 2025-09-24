import { z } from "zod";

export const analysisPayloadSchema = z.object({
  userId: z.string(),
  // ✅ Add a new object for user details
  userDetails: z.object({
    name: z.string().nullable(),
    email: z.string().nullable(),
  }),
  link: z.string(),
  notes: z.string().optional(),
  analysisData: z.object({
    name: z.string(),
    approachName: z.string(),
    pseudoCode: z.array(z.string()),
    time: z.string(),
    space: z.string(),
    tags: z.array(z.string()),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
  }),
});

export type AnalysisPayload = z.infer<typeof analysisPayloadSchema>;
