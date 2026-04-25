import { experimental_generateImage as generateImage } from 'ai'
import { gateway } from './ai-client.js'
import type { ContentDraft } from '../schemas/content.js'

export interface DraftWithImage extends ContentDraft {
  imageUrl?: string
}

export async function generateImages(
  drafts: ContentDraft[]
): Promise<DraftWithImage[]> {
  const results = await Promise.allSettled(
    drafts.map((draft) => generateImageForDraft(draft))
  )

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value
    }
    // If image generation fails, return the draft without image (non-blocking)
    console.error(`Image generation failed for ${drafts[i].platform}:`, result.reason)
    return { ...drafts[i], imageUrl: undefined }
  })
}

async function generateImageForDraft(draft: ContentDraft): Promise<DraftWithImage> {
  const { image } = await generateImage({
    model: gateway.image('openai/dall-e-3'),
    prompt: draft.imagePrompt,
    size: '1024x1024',
  })

  return {
    ...draft,
    imageUrl: image.base64
      ? `data:image/png;base64,${image.base64}`
      : undefined,
  }
}
