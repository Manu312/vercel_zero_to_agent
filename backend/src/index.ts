import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { agentRoutes } from './routes/agent.js'

// Validate required env vars at startup
if (!process.env.AI_GATEWAY_API_KEY) {
  console.error('AI_GATEWAY_API_KEY is not set. Set it in your .env file.')
  process.exit(1)
}

const app = new Hono()

app.use('*', cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))

app.get('/health', (c) => c.json({ status: 'ok' }))

app.route('/api/agent', agentRoutes)

// Keep backward-compatible endpoint from the original implementation
app.post('/api/extract-dna', async (c) => {
  return c.redirect('/api/agent/generate', 308)
})

const PORT = Number(process.env.PORT) || 3001

serve({ fetch: app.fetch, port: PORT }, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
