import { z } from 'zod'

export const BrandProfileSchema = z.object({
  colors: z.object({
    primary: z.array(z.string()),
    secondary: z.array(z.string()),
    accent: z.array(z.string()),
  }),
  typography: z.object({
    fonts: z.array(z.string()),
    style: z.string(),
  }),
  brandVoice: z.object({
    tone: z.string(),
    values: z.array(z.string()),
    archetype: z.string(),
  }),
  industry: z.string(),
  targetAudience: z.string(),
  keyMessages: z.array(z.string()).max(3),
})

export type BrandProfile = z.infer<typeof BrandProfileSchema>
