import { z } from 'zod'

export const PlatformSchema = z.enum(['linkedin', 'instagram', 'facebook'])
export type Platform = z.infer<typeof PlatformSchema>

export const PlatformStrategySchema = z.object({
  platform: PlatformSchema,
  tone: z.string(),
  contentGoal: z.string(),
  structureGuidelines: z.string(),
  hashtagStrategy: z.string(),
  idealLength: z.string(),
  formatTips: z.string(),
})

export const ContentStrategySchema = z.object({
  brandSummary: z.string(),
  platforms: z.array(PlatformStrategySchema),
})

export type ContentStrategy = z.infer<typeof ContentStrategySchema>
export type PlatformStrategy = z.infer<typeof PlatformStrategySchema>

export const ContentDraftSchema = z.object({
  platform: PlatformSchema,
  copy: z.string(),
  imagePrompt: z.string(),
  hashtags: z.array(z.string()),
  suggestedPostTime: z.string(),
})

export const FinalOutputSchema = z.object({
  url: z.string(),
  brandProfile: z.any(),
  contentStrategy: z.any(),
  drafts: z.array(
    ContentDraftSchema.extend({
      imageUrl: z.string().optional(),
    })
  ),
})

export type ContentDraft = z.infer<typeof ContentDraftSchema>
export type FinalOutput = z.infer<typeof FinalOutputSchema>
