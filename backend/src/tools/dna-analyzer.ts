import { generateObject } from 'ai'
import { gateway } from '../lib/ai-client.js'
import { z } from 'zod'
import type { ScrapedSite } from '../schemas/scraped-site.js'

const DnaResultSchema = z.object({
  name: z.string().describe('Nombre exacto de la marca o empresa tal como aparece en el sitio'),
  tagline: z.string().describe('Tagline o slogan principal de la marca. Si no hay uno explícito, inferilo del contenido.'),
  description: z.string().describe('Descripción concisa de la marca en 1-2 oraciones que explique qué hace y para quién'),
  tone: z.array(z.string()).describe('Tono de voz como array de 3-5 descriptores, ej: ["Técnico", "Confiado", "Minimalista"]'),
  values: z.array(z.string()).describe('Valores de marca como array de strings'),
  archetype: z.string().describe('Arquetipo de marca: Hero, Sage, Creator, Explorer, Ruler, Caregiver, etc.'),
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

Extraé con precisión: nombre de la marca, tagline, descripción, tono de voz (como array de descriptores), valores, arquetipo, industria, audiencia objetivo y key messages.`,
  })

  return object
}

function buildTextContent(site: ScrapedSite): string {
  return site.paragraphs.slice(0, 10).join('\n')
}
