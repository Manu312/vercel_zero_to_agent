import { generateObject } from 'ai'
import { gateway } from './ai-client.js'
import { z } from 'zod'
import { ContentDraftSchema, PlatformSchema } from '../schemas/content.js'
import type { BrandProfile } from '../schemas/brand-profile.js'
import type { ContentStrategy } from '../schemas/content.js'

const ContentDraftsSchema = z.object({
  drafts: z.array(ContentDraftSchema),
})

export async function generateContent(
  strategy: ContentStrategy,
  brandProfile: BrandProfile
): Promise<import('../schemas/content.js').ContentDraft[]> {
  const platforms = PlatformSchema.options

  const { object } = await generateObject({
    model: gateway('openai/gpt-4o'),
    schema: ContentDraftsSchema,
    prompt: `Sos un copywriter experto en social media con profundo conocimiento de marca.
Creá posts listos para publicar en LinkedIn, Instagram y Facebook para esta marca.

ESTRATEGIA DE CONTENIDO:
${JSON.stringify(strategy, null, 2)}

PERFIL DE MARCA:
- Tono: ${brandProfile.brandVoice.tone}
- Valores: ${brandProfile.brandVoice.values.join(', ')}
- Mensajes clave: ${brandProfile.keyMessages.join(' | ')}
- Colores de marca: ${[...brandProfile.colors.primary, ...brandProfile.colors.accent].join(', ')}
- Audiencia: ${brandProfile.targetAudience}

Para cada plataforma (${platforms.join(', ')}), generá:
1. copy: El texto completo del post, listo para publicar, respetando el tono y longitud ideal de cada plataforma
2. imagePrompt: Un prompt detallado en inglés para DALL-E 3 que genere una imagen que complemente el post, incorporando los colores de marca
3. hashtags: Array de hashtags relevantes (cantidad según la plataforma)
4. suggestedPostTime: Horario recomendado para publicar (ej: "Martes 10:00 AM")

Generá UN post por plataforma. Total: 3 posts.`,
  })

  return object.drafts
}
