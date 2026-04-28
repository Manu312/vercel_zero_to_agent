import type { ContentDraft } from '../schemas/content.js'
import * as fs from 'fs/promises'
import * as path from 'path'
import { randomUUID } from 'crypto'

export interface DraftWithImage extends ContentDraft {
  imageUrl?: string
  imageLocalPath?: string
}

export interface ImageStorageConfig {
  type: 'local' | 'cloud'
  localDir?: string
  cloudBaseUrl?: string
}

let storageConfig: ImageStorageConfig = {
  type: 'local',
  localDir: './uploads/images',
  cloudBaseUrl: '',
}

export function configureImageStorage(config: ImageStorageConfig): void {
  storageConfig = config
}

// gpt-image-1 only supports: 1024x1024 | 1536x1024 | 1024x1536
const IMAGE_SIZES: Record<string, '1024x1024' | '1536x1024' | '1024x1536'> = {
  linkedin: '1536x1024',
  instagram: '1024x1024',
  facebook: '1536x1024',
}

export async function generateImages(
  drafts: ContentDraft[]
): Promise<DraftWithImage[]> {
  await ensureUploadDir()

  const results = await Promise.allSettled(
    drafts.map((draft, i) => generateImageForDraft(draft, i))
  )

  return results.map((result, i) => {
    if (result.status === 'fulfilled') {
      return result.value
    }
    console.error(`Image generation failed for ${drafts[i].platform}:`, result.reason)
    return { ...drafts[i], imageUrl: undefined, imageLocalPath: undefined }
  })
}

async function ensureUploadDir(): Promise<void> {
  if (storageConfig.type === 'local' && storageConfig.localDir) {
    await fs.mkdir(storageConfig.localDir, { recursive: true })
  }
}

async function generateImageForDraft(
  draft: ContentDraft,
  index: number
): Promise<DraftWithImage> {
  const size = IMAGE_SIZES[draft.platform] ?? '1024x1024'

  const apiKey = process.env.AI_GATEWAY_API_KEY
  if (!apiKey) throw new Error('AI_GATEWAY_API_KEY is not set')

  // Llamada directa: sin response_format, el gateway/OpenAI devuelve b64_json por defecto
  const response = await fetch('https://ai-gateway.vercel.sh/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-image-1',
      prompt: draft.imagePrompt,
      n: 1,
      size,
      // response_format omitido intencionalmente — gpt-image-1 no lo acepta
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Image API error ${response.status}: ${errorBody}`)
  }

  const data = await response.json() as {
    data: Array<{ b64_json?: string; url?: string }>
  }

  const imageData = data.data?.[0]
  if (!imageData) throw new Error('No image returned from API')

  const localPath = await saveImageLocally(imageData, draft.platform, index)

  return {
    ...draft,
    imageUrl: localPath,
    imageLocalPath: localPath,
  }
}

async function saveImageLocally(
  imageData: { b64_json?: string; url?: string },
  platform: string,
  index: number
): Promise<string> {
  if (!storageConfig.localDir) {
    throw new Error('Local storage not configured')
  }

  const filename = `${platform}-${index}-${randomUUID().slice(0, 8)}.png`
  const filepath = path.join(storageConfig.localDir, filename)

  let buffer: Buffer

  if (imageData.b64_json) {
    buffer = Buffer.from(imageData.b64_json, 'base64')
  } else if (imageData.url) {
    const imgResponse = await fetch(imageData.url)
    if (!imgResponse.ok) throw new Error(`Failed to download image from URL: ${imageData.url}`)
    const arrayBuffer = await imgResponse.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  } else {
    throw new Error('No image data (b64_json or url) in API response')
  }

  if (buffer.length === 0) throw new Error('Empty image buffer')

  await fs.writeFile(filepath, buffer)
  console.log(`[image-generator] Saved image to: ${filepath}`)

  return filepath
}

export async function getImageAsDataUrl(
  localPath: string
): Promise<string | null> {
  try {
    const buffer = await fs.readFile(localPath)
    const ext = path.extname(localPath).slice(1) || 'png'
    return `data:image/${ext};base64,${buffer.toString('base64')}`
  } catch {
    return null
  }
}

export function getStorageConfig(): ImageStorageConfig {
  return { ...storageConfig }
}