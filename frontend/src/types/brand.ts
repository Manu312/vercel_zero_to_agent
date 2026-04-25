export interface BrandColor {
  hex: string
  name: string
  role: 'primary' | 'secondary' | 'accent' | 'background' | 'text'
}

export interface BrandProfile {
  name: string
  url: string
  industry: string
  archetype: string
  tone: string[]
  values: string[]
  tagline: string
  description: string
  colors: BrandColor[]
  fonts: string[]
}

export interface PlatformStrategy {
  platform: 'LinkedIn' | 'Instagram' | 'Facebook'
  tone: string
  contentTypes: string[]
  hashtagStrategy: string
  postLength: string
  cta: string
  visualRatio: string
}

export interface ContentStrategy {
  platforms: PlatformStrategy[]
  generalGuidelines: string[]
}

export interface BrandDNA {
  brandProfile: BrandProfile
  contentStrategy: ContentStrategy
  extractedAt: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export type AppPhase =
  | 'landing'
  | 'processing'
  | 'result'
  | 'chat'

export type ProcessingStep =
  | 'scraping'
  | 'colors'
  | 'dna'
  | 'strategy'
  | 'done'
