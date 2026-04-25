import { scrapeWebsite } from '../tools/web-scraper.js'
import { extractColors } from '../tools/color-extractor.js'
import { analyzeDNA } from '../tools/dna-analyzer.js'
import { buildContentStrategy } from '../lib/content-strategy.js'
import { generateContent } from '../lib/content-generator.js'
import { generateImages } from '../lib/image-generator.js'
import { BrandProfileSchema } from '../schemas/brand-profile.js'
import type { FinalOutput } from '../schemas/content.js'
import bestPractices from '../data/best-practices.json' with { type: 'json' }

type ColorClassification = { primary: string[]; secondary: string[]; accent: string[] }
type MappedColor = { hex: string; name: string; role: 'primary' | 'secondary' | 'accent' }

export async function runAgentPipeline(url: string): Promise<FinalOutput> {
  // Step 1: Scrape the website
  const scraped = await scrapeWebsite(url)

  // Step 2: Extract colors and analyze DNA in parallel
  const [colorClassification, dnaResult] = await Promise.all([
    Promise.resolve(extractColors(scraped)),
    analyzeDNA(scraped),
  ])

  const brandProfile = BrandProfileSchema.parse({
    colors: colorClassification,
    typography: {
      fonts: scraped.fontFamilies,
      style: inferTypographyStyle(scraped.fontFamilies),
    },
    brandVoice: {
      tone: dnaResult.tone.join(', '),
      values: dnaResult.values,
      archetype: dnaResult.archetype,
    },
    industry: dnaResult.industry,
    targetAudience: dnaResult.targetAudience,
    keyMessages: dnaResult.keyMessages,
  })

  // Step 3: Build content strategy
  const contentStrategy = await buildContentStrategy(brandProfile, bestPractices)

  // Step 4: Generate content drafts
  const drafts = await generateContent(contentStrategy, brandProfile)

  // Step 5: Generate images for each draft
  const draftsWithImages = await generateImages(drafts)

  return {
    url,
    brandProfile: {
      name: dnaResult.name,
      url,
      industry: dnaResult.industry,
      archetype: dnaResult.archetype,
      tone: dnaResult.tone,
      values: dnaResult.values,
      tagline: dnaResult.tagline,
      description: dnaResult.description,
      colors: mapColorsToArray(colorClassification),
      fonts: scraped.fontFamilies,
    },
    contentStrategy: {
      platforms: contentStrategy.platforms.map((p) => ({
        platform: capitalize(p.platform) as 'LinkedIn' | 'Instagram' | 'Facebook',
        tone: p.tone,
        contentTypes: p.contentTypes,
        hashtagStrategy: p.hashtagStrategy,
        postLength: p.postLength,
        cta: p.cta,
        visualRatio: p.visualRatio,
      })),
      generalGuidelines: contentStrategy.generalGuidelines,
    },
    drafts: draftsWithImages,
    extractedAt: new Date().toISOString(),
  }
}

function mapColorsToArray(colors: ColorClassification): MappedColor[] {
  const result: MappedColor[] = []
  colors.primary.slice(0, 3).forEach((hex) => result.push({ hex, name: hexToColorName(hex), role: 'primary' }))
  colors.secondary.slice(0, 2).forEach((hex) => result.push({ hex, name: hexToColorName(hex), role: 'secondary' }))
  colors.accent.slice(0, 2).forEach((hex) => result.push({ hex, name: hexToColorName(hex), role: 'accent' }))
  return result
}

function hexToColorName(hex: string): string {
  const h = hex.replace('#', '').toLowerCase()
  if (h.length < 6) return hex.toUpperCase()
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  if (r < 30 && g < 30 && b < 30) return 'Black'
  if (r > 220 && g > 220 && b > 220) return 'White'
  if (Math.abs(r - g) < 25 && Math.abs(g - b) < 25) return 'Gray'
  if (r > g && r > b) return b > g ? 'Magenta' : 'Red'
  if (g > r && g > b) return r > b ? 'Yellow-Green' : 'Green'
  if (b > r && b > g) return r > g ? 'Violet' : 'Blue'
  return hex.toUpperCase()
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

function inferTypographyStyle(fonts: string[]): string {
  const normalized = fonts.map((f) => f.toLowerCase())

  const hasSerif = normalized.some((f) =>
    ['georgia', 'times', 'serif', 'garamond', 'merriweather', 'playfair'].some((s) =>
      f.includes(s)
    )
  )
  const hasMonospace = normalized.some((f) =>
    ['mono', 'code', 'courier', 'consolas', 'fira'].some((s) => f.includes(s))
  )

  if (hasMonospace) return 'técnico y moderno'
  if (hasSerif) return 'clásico y elegante'
  return 'moderno y limpio'
}
