import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }))
app.use(express.json())

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

// ─── DNA Extraction ───────────────────────────────────────────────────────────
// POST /api/extract-dna
// Body: { url: string }
// Returns: BrandDNA object
//
// TODO(backend): implementar extracción real con AI SDK
//   - Fase 1: scraping + color extraction + DNA analysis (paralelo con Promise.all)
//   - Fase 2: content strategy cruzada con diccionario de buenas prácticas
//   - Output tipado con Zod
app.post('/api/extract-dna', async (req, res) => {
  const { url } = req.body

  if (!url) {
    return res.status(400).json({ error: 'url is required' })
  }

  // Placeholder — reemplazar con lógica real
  res.json({
    url,
    brandProfile: null,
    contentStrategy: null,
    status: 'not_implemented',
    message: 'Backend pending implementation',
  })
})

// ─── Chat with DNA context ────────────────────────────────────────────────────
// POST /api/chat
// Body: { messages: Message[], brandDNA: BrandDNA }
// Returns: streaming text response (AI SDK compatible)
//
// TODO(backend): implementar chat con contexto del DNA
//   - Usar AI SDK streamText con el brandDNA como system prompt context
//   - Retornar como ReadableStream compatible con useChat del frontend
app.post('/api/chat', async (req, res) => {
  res.status(501).json({ error: 'Not implemented yet' })
})

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`)
})
