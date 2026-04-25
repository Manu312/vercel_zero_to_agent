import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { runAgentPipeline } from '../workflows/pipeline.js'

const GenerateRequestSchema = z.object({
  url: z.string().url({ message: 'Debe ser una URL válida' }),
})

export const agentRoutes = new Hono()

agentRoutes.post(
  '/generate',
  zValidator('json', GenerateRequestSchema, (result, c) => {
    if (!result.success) {
      return c.json(
        { error: 'Validation error', details: result.error.flatten() },
        400
      )
    }
  }),
  async (c) => {
    const { url } = c.req.valid('json')

    try {
      const output = await runAgentPipeline(url)
      return c.json(output)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[agent/generate] pipeline error:', message)
      return c.json({ error: 'Pipeline failed', message }, 500)
    }
  }
)
