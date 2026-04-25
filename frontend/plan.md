Estoy construyendo el frontend de un agente de social media content generation dentro 
de un monorepo. El frontend vive en /apps/frontend. El backend ya está implementado 
en /apps/backend y expone POST /api/agent/generate que recibe { url: string } y devuelve 
el output tipado. Los schemas Zod están en /apps/backend/schemas — importalos directamente.

## Stack
- Next.js 14+ App Router
- TypeScript strict
- Tailwind CSS
- Vercel Chat SDK (@chat-sdk/react) para el streaming de la pipeline
- Zustand para estado global del agente
- shadcn/ui para componentes base (ya instalado o instalalo)
- Deployment: Vercel

## Estructura de carpetas a crear
/apps/frontend
  /app
    /page.tsx               → landing con URL input
    /agent/[sessionId]/page.tsx → resultado del análisis
    /layout.tsx
  /components
    /url-input.tsx          → form de entrada de URL
    /pipeline-status.tsx    → stepper de los 4 pasos con streaming
    /brand-profile-card.tsx → panel izquierdo con colores, tono, valores
    /content-tabs.tsx       → tabs LinkedIn/Instagram/Facebook
    /platform-card.tsx      → copy + imagen + acciones por plataforma
    /color-swatches.tsx     → círculos de colores de marca
    /image-preview.tsx      → preview de imagen generada + skeleton
  /hooks
    /use-agent.ts           → hook principal que llama la API y maneja estado
    /use-clipboard.ts       → copiar copy al portapapeles
  /store
    /agent-store.ts         → Zustand store con el estado completo del agente
  /lib
    /api.ts                 → fetch wrapper tipado con los schemas del backend
    /utils.ts               → helpers de formato

## Lo que necesito que construyas

### 1. Zustand store (/store/agent-store.ts)
Estado global con:
- status: 'idle' | 'scraping' | 'extracting' | 'strategizing' | 'generating' | 'done' | 'error'
- url: string
- brandProfile: BrandProfile | null  (tipo importado del backend)
- contentStrategy: ContentStrategy | null
- platforms: { linkedin: PlatformOutput, instagram: PlatformOutput, facebook: PlatformOutput } | null
- error: string | null
- Acciones: setUrl, startAnalysis, setStatus, setResults, reset

### 2. API client tipado (/lib/api.ts)
- Función analyzeUrl(url: string) que llama POST /api/agent/generate
- Tipado con los schemas del backend (importar desde @/../../backend/schemas o path alias)
- Manejo de errores con tipos
- Soporte para streaming si el backend lo expone (usar fetch con ReadableStream)

### 3. Hook principal (/hooks/use-agent.ts)
- Consume el Zustand store
- Expone: { status, brandProfile, platforms, error, analyze(url) }
- La función analyze() dispara la llamada a la API y va actualizando el status 
  a medida que recibe chunks del stream (o polling si no hay streaming)
- Simula los pasos de la pipeline visualmente aunque no haya SSE real:
  - 600ms → status = 'scraping'
  - Al recibir brandProfile → status = 'extracting' → 'strategizing'
  - Al recibir platforms → status = 'generating' → 'done'

### 4. Componente URLInput (/components/url-input.tsx)
- Input controlado con validación de URL (zod refine)
- Botón "Analizar" que llama analyze(url)
- Loading state con spinner mientras corre
- Error inline si la URL es inválida

### 5. Componente PipelineStatus (/components/pipeline-status.tsx)
- 4 pasos: Scraping → Extracción → Estrategia → Generación
- El paso activo se muestra con animación de puntos suspensivos
- Pasos completados con checkmark (teal)
- Pasos pendientes en gris
- Se renderiza solo cuando status !== 'idle'

### 6. Componente BrandProfileCard (/components/brand-profile-card.tsx)
- Recibe brandProfile del store
- Muestra:
  - ColorSwatches: círculos con los hex de primary/secondary/accent
  - Tono de voz (string)
  - Arquetipo con badge de color (purple para Sage, etc.)
  - Valores como chips/badges
  - Industria
- Skeleton loader mientras brandProfile === null pero status !== 'idle'

### 7. Componente ContentTabs (/components/content-tabs.tsx)
- Tabs: LinkedIn | Instagram | Facebook
- Estado local de tab activa
- Renderiza PlatformCard para la plataforma activa
- Botón "Regenerar" en el header del tab que llama al backend solo para 
  esa plataforma (si el backend lo soporta, sino regenera todo)

### 8. Componente PlatformCard (/components/platform-card.tsx)
- Layout 2 columnas: copy (izquierda) + imagen (derecha)
- Copy:
  - Textarea editable inicializada con el copy generado
  - Contador de caracteres con warning si supera el límite de la plataforma
  - Botones: "Copiar" (usa useClipboard) y "Editar"
  - Muestra hashtags separados
- Imagen:
  - ImagePreview con skeleton mientras genera
  - Botón descargar (link a la URL de la imagen)
  - Botón "Ver prompt" que muestra el imagePrompt en un modal/drawer
- Badge con el límite de caracteres de la plataforma

### 9. Página principal (/app/page.tsx)
- Hero simple: título + descripción breve
- URLInput centrado
- Si status !== 'idle': muestra PipelineStatus
- Si brandProfile !== null: muestra layout 2 columnas 
  (BrandProfileCard izquierda + ContentTabs derecha)

### 10. Tipos compartidos
Configurá un path alias en tsconfig.json para importar los schemas del backend:
@backend/* → ../../apps/backend/*
O copiá los tipos a /types/agent.ts si el alias no es viable en este monorepo.

## UX a respetar
- El layout pasa de "solo URL input centrado" a "2 columnas" en cuanto hay resultados
- Transición suave con framer-motion (si está disponible) o CSS transition
- Las columnas tienen scroll independiente si el contenido es largo
- Mobile: las 2 columnas se stackean verticalmente (BrandProfile arriba, tabs abajo)
- Dark mode funcional (Tailwind dark: prefix)

## Consideraciones
- No hardcodees datos de ejemplo — todo viene del store
- Los skeletons tienen las mismas dimensiones que el contenido real
- Revisar la estructura existente del monorepo antes de crear archivos 
  para no pisar nada que ya exista
- Confirmar cada componente antes de pasar al siguiente

Arrancá leyendo la estructura del monorepo y los schemas del backend.