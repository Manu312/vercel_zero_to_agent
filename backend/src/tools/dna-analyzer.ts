import { generateObject } from 'ai'
import { gateway } from '../lib/ai-client.js'
import { z } from 'zod'
import type { ScrapedSite } from '../schemas/scraped-site.js'

const DnaResultSchema = z.object({
  tone: z.string().describe('Tono de voz de la marca, ej: "profesional y cercano"'),
  values: z.array(z.string()).describe('Valores de marca como array de strings'),
  archetype: z.string().describe('Arquetipo de marca: Hero, Sage, Creator, Explorer, etc.'),
  industry: z.string().describe('Industria o sector al que pertenece la marca'),
  targetAudience: z.string().describe('Audiencia objetivo de la marca'),
  keyMessages: z
    .array(z.string())
    .max(3)
    .describe('Mensajes clave de la marca, máximo 3'),
})

export async function analyzeDNA(site: ScrapedSite) {
  const textContent = buildTextContent(site)

  const { object } = await generateObject({
    model: gateway('openai/gpt-4o-mini'),
    schema: DnaResultSchema,
    prompt: `Analizá el siguiente contenido extraído del sitio web "${site.url}" y determiná el ADN de marca.

CONTENIDO DEL SITIO:
Título: ${site.title}
Meta descripción: ${site.metaDescription}
Headings H1: ${site.h1.join(' | ')}
Headings H2: ${site.h2.slice(0, 5).join(' | ')}
Párrafos principales:
${textContent}

Extraé con precisión: tono de voz, valores de marca, arquetipo, industria, audiencia objetivo y key messages.`,
  })

  return object
}

function buildTextContent(site: ScrapedSite): string {
  return site.paragraphs.slice(0, 10).join('\n')
}
