import * as cheerio from 'cheerio'
import type { ScrapedSite } from '../schemas/scraped-site.js'

export async function scrapeWebsite(url: string): Promise<ScrapedSite> {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; BrandAnalyzer/1.0)',
    },
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
  }

  const html = await response.text()
  const $ = cheerio.load(html)

  const title = $('title').first().text().trim()

  const metaDescription =
    $('meta[name="description"]').attr('content') ||
    $('meta[property="og:description"]').attr('content') ||
    ''

  const h1 = $('h1')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)

  const h2 = $('h2')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 10)

  const paragraphs = $('p')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t.length > 40)
    .slice(0, 20)

  const ogImage =
    $('meta[property="og:image"]').attr('content') || undefined

  const cssColors = extractInlineCssColors($, html)
  const fontFamilies = extractFontFamilies($, html)

  return {
    url,
    title,
    metaDescription,
    h1,
    h2,
    paragraphs,
    cssColors,
    fontFamilies,
    ogImage,
    rawHtml: html.slice(0, 50_000),
  }
}

function extractInlineCssColors($: cheerio.CheerioAPI, html: string): string[] {
  const colorRegex = /#([0-9a-fA-F]{3,8})\b|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g
  const found = new Set<string>()

  // From inline style attributes
  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || ''
    const matches = style.match(colorRegex) || []
    matches.forEach((c) => found.add(c.toLowerCase()))
  })

  // From <style> tags
  $('style').each((_, el) => {
    const css = $(el).html() || ''
    const matches = css.match(colorRegex) || []
    matches.forEach((c) => found.add(c.toLowerCase()))
  })

  return Array.from(found)
}

function extractFontFamilies($: cheerio.CheerioAPI, html: string): string[] {
  const fontRegex = /font-family\s*:\s*([^;}"']+)/gi
  const found = new Set<string>()

  $('style').each((_, el) => {
    const css = $(el).html() || ''
    let match: RegExpExecArray | null
    while ((match = fontRegex.exec(css)) !== null) {
      const fonts = match[1].split(',').map((f) =>
        f.replace(/['"]/g, '').trim()
      )
      fonts.filter(Boolean).forEach((f) => found.add(f))
    }
  })

  $('[style]').each((_, el) => {
    const style = $(el).attr('style') || ''
    let match: RegExpExecArray | null
    while ((match = fontRegex.exec(style)) !== null) {
      const fonts = match[1].split(',').map((f) =>
        f.replace(/['"]/g, '').trim()
      )
      fonts.filter(Boolean).forEach((f) => found.add(f))
    }
  })

  return Array.from(found).slice(0, 10)
}
