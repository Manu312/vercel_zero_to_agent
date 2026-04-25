import { BrandDNA, ChatMessage } from '@/types/brand'

// ─── Mock Brand DNA ───────────────────────────────────────────────────────────
export const MOCK_BRAND_DNA: BrandDNA = {
  brandProfile: {
    name: 'Vercel',
    url: 'https://vercel.com',
    industry: 'Developer Tools / Cloud Infrastructure',
    archetype: 'The Creator',
    tone: ['Technical', 'Confident', 'Forward-thinking', 'Minimalist'],
    values: ['Speed', 'Developer Experience', 'Simplicity', 'Innovation'],
    tagline: 'Develop. Preview. Ship.',
    description:
      'Vercel is a cloud platform for developers that enables teams to deploy websites and web services that deploy instantly and scale automatically — all without any configuration.',
    colors: [
      { hex: '#000000', name: 'Obsidian', role: 'primary' },
      { hex: '#FFFFFF', name: 'Pure White', role: 'background' },
      { hex: '#0070F3', name: 'Electric Blue', role: 'accent' },
      { hex: '#888888', name: 'Neutral Gray', role: 'secondary' },
      { hex: '#FF0080', name: 'Hot Pink', role: 'accent' },
    ],
    fonts: ['Geist Sans', 'Geist Mono'],
  },
  contentStrategy: {
    platforms: [
      {
        platform: 'LinkedIn',
        tone: 'Professional yet innovative — speak to CTOs and senior engineers',
        contentTypes: ['Case studies', 'Product updates', 'Engineering insights', 'Team spotlights'],
        hashtagStrategy: '#webdev #frontend #cloudinfra #dx',
        postLength: '150-300 words with clear value proposition',
        cta: 'Try it free / Read the docs',
        visualRatio: '60% text, 40% visuals',
      },
      {
        platform: 'Instagram',
        tone: 'Aesthetic, minimal — let the product speak visually',
        contentTypes: ['Deploy animations', 'Dark UI screenshots', 'Behind the scenes', 'Community highlights'],
        hashtagStrategy: '#buildinpublic #devlife #webdesign #oss',
        postLength: '1-2 lines max, let the visual carry',
        cta: 'Link in bio',
        visualRatio: '80% visuals, 20% text',
      },
      {
        platform: 'Facebook',
        tone: 'Accessible, community-driven — broader audience',
        contentTypes: ['Tutorials', 'Product announcements', 'Community events', 'Blog reposts'],
        hashtagStrategy: '#nextjs #react #javascript',
        postLength: '100-200 words with friendly tone',
        cta: 'Learn more / Join the community',
        visualRatio: '50% text, 50% visuals',
      },
    ],
    generalGuidelines: [
      'Always lead with developer empathy — speak their language',
      'Prioritize speed metrics and performance numbers when available',
      'Use dark backgrounds with accent colors for visual consistency',
      'Avoid buzzwords — be direct and specific',
      'Show, don\'t tell — demos > descriptions',
    ],
  },
  extractedAt: new Date().toISOString(),
}

// ─── Mock Chat Responses ──────────────────────────────────────────────────────
const MOCK_RESPONSES: Record<string, string> = {
  default: `Based on **{brand}'s DNA**, here's what I suggest:\n\nYour brand archetype is **The Creator** with a tone that's technical and confident. Every piece of content should reflect speed and developer empathy.\n\nWant me to generate a specific post for one of your platforms?`,
  linkedin: `**LinkedIn Post for {brand}:**\n\n---\n\nWe just shipped something that's been 6 months in the making.\n\nBuilding at the edge means one thing: your users shouldn't wait. Today's update cuts cold start times by 40%.\n\nFor the engineers reading this — yes, we benchmarked it. The numbers are in the thread.\n\n→ Full breakdown in the docs\n\n#webdev #cloudinfra #dx #performance\n\n---\n\n*Tone: Direct, data-backed, developer-first ✓*`,
  instagram: `**Instagram Caption for {brand}:**\n\n---\n\ndeploy in 30 seconds.\nscale to millions.\nnever think about infra again.\n\n(link in bio)\n\n---\n\n*Tip: Pair with a dark terminal screenshot or deploy animation ✓*`,
  facebook: `**Facebook Post for {brand}:**\n\n---\n\nHey devs! 👋\n\nWe know infrastructure can feel overwhelming. That's why we built something different — you write the code, we handle everything else.\n\nCheck out our latest tutorial on deploying your first Next.js app in under 2 minutes. No config required.\n\n🔗 Learn more → [link]\n\n---\n\n*Tone: Friendly, accessible, community-focused ✓*`,
  colors: `**Color Palette for {brand}:**\n\nYour brand DNA shows a strong black/white contrast base with electric blue as the primary accent. Here's how to use them:\n\n- **#000000 Obsidian** → backgrounds, headers, CTAs\n- **#0070F3 Electric Blue** → links, hover states, highlights\n- **#FF0080 Hot Pink** → sparingly — launch announcements, special events only\n- **#888888 Neutral Gray** → body text, secondary info\n\nThe high contrast ratio signals **premium, technical, no-nonsense**. Don't dilute it with pastel tones.`,
  tone: `**Tone Guide for {brand}:**\n\nYour brand speaks like a senior engineer who also has great taste:\n\n✓ **Do:** "Deploy in 30 seconds" / "Zero config" / "It just works"\n✗ **Don't:** "Revolutionary synergies" / "Best-in-class solutions" / "Leverage the paradigm"\n\nKey rules:\n1. Cut every unnecessary word\n2. Let numbers do the talking\n3. Assume technical literacy — no hand-holding\n4. Dark humor is OK; corporate speak is not`,
}

function getMockResponse(message: string, brandName: string): string {
  const lower = message.toLowerCase()
  let template = MOCK_RESPONSES.default

  if (lower.includes('linkedin')) template = MOCK_RESPONSES.linkedin
  else if (lower.includes('instagram')) template = MOCK_RESPONSES.instagram
  else if (lower.includes('facebook')) template = MOCK_RESPONSES.facebook
  else if (lower.includes('color') || lower.includes('palette')) template = MOCK_RESPONSES.colors
  else if (lower.includes('tone') || lower.includes('voz') || lower.includes('voice')) template = MOCK_RESPONSES.tone

  return template.replace(/\{brand\}/g, brandName)
}

// ─── API Service ──────────────────────────────────────────────────────────────
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export async function extractDNA(url: string): Promise<BrandDNA> {
  const res = await fetch(`${BACKEND_URL}/api/agent/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `Error del servidor: ${res.status}`)
  }

  const data = await res.json()
  return {
    brandProfile: data.brandProfile,
    contentStrategy: data.contentStrategy,
    extractedAt: data.extractedAt,
  }
}

export async function sendChatMessage(
  message: string,
  history: ChatMessage[],
  dna: BrandDNA
): Promise<string> {
  // Chat uses mock until backend endpoint is added
  await new Promise((r) => setTimeout(r, 800 + Math.random() * 600))
  return getMockResponse(message, dna.brandProfile.name)
}
