import { generateObject } from 'ai'
import { gateway } from './ai-client.js'
import { ContentStrategySchema } from '../schemas/content.js'
import type { BrandProfile } from '../schemas/brand-profile.js'

type BestPractices = Record<string, unknown>

export async function buildContentStrategy(
  brandProfile: BrandProfile,
  bestPractices: BestPractices
): Promise<import('../schemas/content.js').ContentStrategy> {
  const { object } = await generateObject({
    model: gateway('openai/gpt-4o-mini'),
    schema: ContentStrategySchema,
    prompt: `Sos un estratega de contenido digital experto en social media.
Creá una estrategia de contenido personalizada para esta marca.

PERFIL DE MARCA:
- Industria: ${brandProfile.industry}
- Audiencia: ${brandProfile.targetAudience}
- Tono de voz: ${brandProfile.brandVoice.tone}
- Valores: ${brandProfile.brandVoice.values.join(', ')}
- Arquetipo: ${brandProfile.brandVoice.archetype}
- Mensajes clave: ${brandProfile.keyMessages.join(', ')}
- Colores principales: ${brandProfile.colors.primary.join(', ')}
- Tipografía: ${brandProfile.typography.fonts.join(', ')} (${brandProfile.typography.style})

BUENAS PRÁCTICAS POR PLATAFORMA:
${JSON.stringify(bestPractices, null, 2)}

Generá una estrategia específica para LinkedIn, Instagram y Facebook. Para cada plataforma incluí:
- tone: tono de comunicación adaptado a la plataforma
- contentGoal: objetivo principal del contenido
- contentTypes: array de 3-5 tipos de contenido recomendados (ej: ["Casos de estudio", "Tips", "Behind the scenes"])
- structureGuidelines: guías de estructura del post
- hashtagStrategy: estrategia de hashtags
- postLength: longitud recomendada (ej: "150-300 palabras")
- cta: call to action principal (ej: "Probalo gratis / Leer más")
- visualRatio: proporción visual/texto (ej: "60% visual, 40% texto")
- formatTips: tips de formato específicos de la plataforma

Además, incluí generalGuidelines: array de 4-6 guías generales de contenido aplicables a todas las plataformas.

La estrategia debe respetar tanto el ADN de la marca como las mejores prácticas de cada plataforma.`,
  })

  return object
}
