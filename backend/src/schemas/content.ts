import { z } from 'zod'

export const PlatformSchema = z.enum(['linkedin', 'instagram', 'facebook'])
export type Platform = z.infer<typeof PlatformSchema>

export const PlatformStrategySchema = z.object({
  platform: PlatformSchema,
  tone: z.string(),
  contentGoal: z.string(),
  contentTypes: z.array(z.string()).describe('Tipos de contenido recomendados, ej: ["Casos de estudio", "Tips", "Anuncios de producto"]'),
  structureGuidelines: z.string(),
  hashtagStrategy: z.string(),
  postLength: z.string().describe('Longitud recomendada del post, ej: "150-300 palabras"'),
  cta: z.string().describe('Call to action principal para esta plataforma, ej: "Probalo gratis"'),
  visualRatio: z.string().describe('Proporción visual/texto recomendada, ej: "60% visual, 40% texto"'),
  formatTips: z.string(),
})

export const ContentStrategySchema = z.object({
  brandSummary: z.string(),
  platforms: z.array(PlatformStrategySchema),
  generalGuidelines: z.array(z.string()).describe('Guías generales de contenido aplicables a todas las plataformas, 3-5 items'),
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
  brandProfile: z.object({
    name: z.string(),
    url: z.string(),
    industry: z.string(),
    archetype: z.string(),
    tone: z.array(z.string()),
    values: z.array(z.string()),
    tagline: z.string(),
    description: z.string(),
    colors: z.array(z.object({
      hex: z.string(),
      name: z.string(),
      role: z.enum(['primary', 'secondary', 'accent', 'background', 'text']),
    })),
    fonts: z.array(z.string()),
  }),
  contentStrategy: z.object({
    platforms: z.array(z.object({
      platform: z.enum(['LinkedIn', 'Instagram', 'Facebook']),
      tone: z.string(),
      contentTypes: z.array(z.string()),
      hashtagStrategy: z.string(),
      postLength: z.string(),
      cta: z.string(),
      visualRatio: z.string(),
    })),
    generalGuidelines: z.array(z.string()),
  }),
  drafts: z.array(
    ContentDraftSchema.extend({
      imageUrl: z.string().optional(),
    })
  ),
  extractedAt: z.string(),
})

export type ContentDraft = z.infer<typeof ContentDraftSchema>
export type FinalOutput = z.infer<typeof FinalOutputSchema>
