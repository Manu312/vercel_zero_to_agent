import { createOpenAI } from '@ai-sdk/openai'

if (!process.env.AI_GATEWAY_API_KEY) {
  throw new Error('AI_GATEWAY_API_KEY is not set.')
}

export const gateway = createOpenAI({
  baseURL: 'https://ai-gateway.vercel.sh/v1',
  apiKey: process.env.AI_GATEWAY_API_KEY,
})
