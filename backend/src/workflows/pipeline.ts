import { scrapeWebsite } from '../tools/web-scraper.js'
import { extractColors } from '../tools/color-extractor.js'
import { analyzeDNA } from '../tools/dna-analyzer.js'
import { buildContentStrategy } from '../lib/content-strategy.js'
import { generateContent } from '../lib/content-generator.js'
import { generateImages } from '../lib/image-generator.js'
import { BrandProfileSchema } from '../schemas/brand-profile.js'
import type { FinalOutput } from '../schemas/content.js'
import bestPractices from '../data/best-practices.json' with { type: 'json' }

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
      tone: dnaResult.tone,
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
    brandProfile,
    contentStrategy,
    drafts: draftsWithImages,
  }
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
