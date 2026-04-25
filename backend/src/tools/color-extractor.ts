import type { ScrapedSite } from '../schemas/scraped-site.js'

interface ColorClassification {
  primary: string[]
  secondary: string[]
  accent: string[]
}

interface ColorEntry {
  color: string
  count: number
  context: string[]
}

export function extractColors(site: ScrapedSite): ColorClassification {
  const colorMap = new Map<string, ColorEntry>()

  const rawCss = site.rawHtml

  // Count occurrences and gather context clues
  countColorsWithContext(rawCss, colorMap)

  if (colorMap.size === 0) {
    return { primary: [], secondary: [], accent: [] }
  }

  const sorted = Array.from(colorMap.values()).sort((a, b) => b.count - a.count)

  const primary: string[] = []
  const secondary: string[] = []
  const accent: string[] = []

  for (const entry of sorted) {
    const ctx = entry.context.join(' ').toLowerCase()

    if (isAccentColor(ctx)) {
      if (accent.length < 3) accent.push(entry.color)
    } else if (isPrimaryColor(ctx)) {
      if (primary.length < 3) primary.push(entry.color)
    } else {
      if (secondary.length < 3) secondary.push(entry.color)
    }
  }

  // Fallback: assign by frequency if context wasn't enough
  const remaining = sorted
    .map((e) => e.color)
    .filter((c) => !primary.includes(c) && !secondary.includes(c) && !accent.includes(c))

  if (primary.length === 0 && remaining.length > 0) primary.push(remaining[0])
  if (secondary.length === 0 && remaining.length > 1) secondary.push(remaining[1])
  if (accent.length === 0 && remaining.length > 2) accent.push(remaining[2])

  return { primary, secondary, accent }
}

function countColorsWithContext(
  css: string,
  colorMap: Map<string, ColorEntry>
): void {
  // Match property: color pairs
  const ruleRegex = /([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\))/gi

  let match: RegExpExecArray | null
  while ((match = ruleRegex.exec(css)) !== null) {
    const prop = match[1].toLowerCase()
    const color = normalizeColor(match[2])

    const existing = colorMap.get(color)
    if (existing) {
      existing.count++
      if (!existing.context.includes(prop)) existing.context.push(prop)
    } else {
      colorMap.set(color, { color, count: 1, context: [prop] })
    }
  }
}

function normalizeColor(raw: string): string {
  const hex = raw.toLowerCase()
  // Expand 3-char hex to 6-char
  if (/^#[0-9a-f]{3}$/.test(hex)) {
    return `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
  }
  return hex
}

function isPrimaryColor(context: string): boolean {
  return (
    context.includes('background-color') ||
    context.includes('background') ||
    context.includes('body') ||
    context.includes('main') ||
    context.includes('header')
  )
}

function isAccentColor(context: string): boolean {
  return (
    context.includes('button') ||
    context.includes('btn') ||
    context.includes('cta') ||
    context.includes('link') ||
    context.includes('a:hover') ||
    context.includes('border-color') ||
    context.includes('outline')
  )
}
