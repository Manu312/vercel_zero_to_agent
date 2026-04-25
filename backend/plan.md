Estoy construyendo el backend de un agente de social media content generation dentro de un monorepo. 
El backend vive en /apps/backend (o /packages/backend — revisá la estructura existente y usá la carpeta correcta).

## Objetivo
El agente recibe la URL de un sitio web, extrae el brand identity (colores, tono, brand voice), 
y genera copy + prompts de imagen para LinkedIn, Instagram y Facebook, aplicando un diccionario 
de buenas prácticas por plataforma.

## Stack
- Runtime: Node.js con TypeScript
- Framework: Next.js App Router (API Routes) o Hono — elegí el más adecuado para este caso
- AI: Vercel AI SDK (@ai-sdk/core, @ai-sdk/openai)
- Orquestación: Vercel Workflow SDK (workflow-sdk)
- Validación de schemas: Zod
- HTTP fetching + scraping: fetch nativo + cheerio
- Deployment target: Vercel

## Lo que necesito que construyas

### 1. Brand Profile schema (Zod)
Define el tipo `BrandProfile` con estos campos mínimos:
- colors: { primary: string[], secondary: string[], accent: string[] }
- typography: { fonts: string[], style: string }
- brandVoice: { tone: string, values: string[], archetype: string }
- industry: string
- targetAudience: string
- keyMessages: string[]

### 2. Best practices dictionary
Crea un archivo `data/best-practices.json` con reglas por plataforma para:
- LinkedIn: tono profesional, longitud recomendada (1200-1600 chars), uso de hashtags (3-5), 
  estructura de post (hook + desarrollo + CTA), formato ideal
- Instagram: tono visual y aspiracional, caption corto (138 chars visibles) + largo (hasta 2200), 
  hashtags (10-30), emojis, estructura
- Facebook: tono conversacional, longitud media (40-80 chars tienen más engagement), 
  llamada a la comunidad, links

### 3. Tool: Web Scraper
Función que dado una URL:
- Hace fetch del HTML
- Extrae con cheerio: title, meta description, h1, h2, párrafos principales, 
  clases CSS con colores (hex/rgb), font-family declarations, og:image
- Devuelve un objeto `ScrapedSite`

### 4. Tool: Color Extractor
Dado el HTML/CSS scrapeado, extrae:
- Colores hex dominantes del CSS inline y stylesheets
- Ordénalos por frecuencia de aparición
- Clasifica en primary / secondary / accent usando heurísticas simples 
  (background-color del body = primary, colores de botones = accent, etc.)

### 5. Tool: DNA Analyzer  
Usa `generateObject` del AI SDK con un schema Zod para extraer desde el copy del sitio:
- Tono de voz (ej: "profesional y cercano", "técnico y confiable")
- Valores de marca (array de strings)
- Arquetipo (ej: Hero, Sage, Creator)
- Industria
- Audiencia objetivo
- Key messages (máx 3)

### 6. Content Strategy Builder
Función que recibe un `BrandProfile` y el diccionario de buenas prácticas, 
y devuelve un `ContentStrategy` con instrucciones específicas por plataforma 
(usa `generateObject` con schema Zod).

### 7. Content Generator
Usa `generateText` (o `generateObject`) para generar por cada plataforma:
- copy: string (el texto del post listo para publicar)
- imagePrompt: string (prompt detallado para generación de imagen que respete los colores y estilo de marca)
- hashtags: string[]
- suggestedPostTime: string

### 8. Image Generator
Llama a DALL-E 3 via AI SDK con el imagePrompt generado. Devuelve la URL de la imagen.

### 9. Pipeline principal (Vercel Workflow)
Orquesta todos los pasos anteriores como un Workflow durable con estos steps:
1. scrape(url) → ScrapedSite
2. Promise.all([extractColors(scraped), analyzeDNA(scraped)]) → BrandProfile
3. buildStrategy(brandProfile) → ContentStrategy  
4. generateContent(strategy, brandProfile) → ContentDraft[]
5. generateImages(drafts) → FinalOutput

### 10. API endpoint
Expone POST /api/agent/generate que:
- Acepta { url: string }
- Valida con Zod
- Ejecuta el pipeline
- Devuelve el output completo tipado
- Maneja errores correctamente con códigos HTTP apropiados

## Consideraciones
- Todo tipado con TypeScript strict mode
- Schemas Zod exportados para reusar en el frontend
- Variables de entorno: OPENAI_API_KEY (con ejemplo en .env.example)
- No hardcodees keys, usá process.env con validación al inicio
- Estructura de carpetas limpia dentro del backend: /tools, /schemas, /data, /workflows, /lib

Arrancá revisando la estructura existente del monorepo y luego implementá todo en orden, 
confirmando cada paso antes de continuar con el siguiente.