# Backend — Zero to Agent

## Endpoints a implementar

### `POST /api/extract-dna`
Recibe `{ url: string }`, devuelve el **Brand DNA** completo.

**Flujo (3 fases):**
1. **Brand extraction** — scraping + color extraction + DNA analysis en paralelo (`Promise.all`)
2. **Content strategy** — cruza Brand Profile con diccionario de buenas prácticas
3. **Output** — `BrandDNA` object tipado con Zod

### `POST /api/chat`
Recibe `{ messages, brandDNA }`, devuelve streaming compatible con `useChat` del frontend (AI SDK).

## Setup

```bash
pnpm install
pnpm dev       # puerto 3001
```

## Variables de entorno

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `OPENAI_API_KEY` | Para AI SDK (generateObject, streamText) |
| `ANTHROPIC_API_KEY` | Alternativa con Claude |
| `FRONTEND_URL` | CORS origin (default: http://localhost:3000) |
| `PORT` | Puerto del servidor (default: 3001) |
