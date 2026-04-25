import { z } from 'zod'

export const ScrapedSiteSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  metaDescription: z.string(),
  h1: z.array(z.string()),
  h2: z.array(z.string()),
  paragraphs: z.array(z.string()),
  cssColors: z.array(z.string()),
  fontFamilies: z.array(z.string()),
  ogImage: z.string().optional(),
  rawHtml: z.string(),
})

export type ScrapedSite = z.infer<typeof ScrapedSiteSchema>
