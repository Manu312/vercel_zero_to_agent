Cada nodo es clickeable y te hace una pregunta de seguimiento. Acá va el desglose técnico de cada fase:

**Fase 1 — Brand extraction** (3 tools en paralelo dentro de un Vercel Workflow step)

Los tres tools del AI SDK corren en paralelo via `Promise.all`: el web scraper hace un `fetch` del sitio y parsea el DOM (con `cheerio` o `linkedom`), el color extractor analiza el CSS inline, hojas de estilo y meta tags OG para armar la paleta, y el DNA analyzer pasa el copy de headings, taglines y "about" a Claude con `generateObject` para extraer tono, valores, industria y arquetipo de marca. Todo converge en un **Brand Profile object** tipado con Zod.

**Fase 2 — Content strategy** (`generateObject` con schema Zod)

Acá se cruza el Brand Profile con el **diccionario de buenas prácticas** (que vive como un archivo JSON/MDX en el repo o en Vercel KV). El diccionario tiene reglas por plataforma: longitud de texto, uso de hashtags, CTA recomendados, ratio visual, tono ideal, etc. La salida es un `ContentStrategy` object con instrucciones específicas por plataforma.

**Fase 3 — Content generation** (dos pasos secuenciales)

Primero el Content Generator llama `generateText` tres veces (o en paralelo) con prompts distintos para LinkedIn, Instagram y Facebook, cada uno incluyendo el brand profile + las reglas de plataforma. Después el Image Generator toma el copy + los colores de marca para construir un prompt visual detallado y lo manda a DALL-E 3 via la AI SDK (que ya tiene el provider de OpenAI built-in).

**Stack técnico recomendado** dado lo que encontraste:

El orquestador natural es **Vercel Workflow SDK** (`workflow-sdk.dev`) para manejar los pasos como un pipeline durable. La UI sería **Chat SDK** (`chat-sdk.dev`) que te da el componente de chat out of the box sobre Next.js. Para los tools de extracción usás **AI SDK tools** (`ai-sdk.dev`). Para el MCP si querés exponer esto como servidor: `vercel.com/docs/mcp`. El template de comunidad `vercel-labs/community-agent-template` es un buen punto de partida para la estructura del repo.

¿Querés que arranquemos con el Brand Profile schema en Zod + el tool de color extraction, o preferís primero ver cómo armar el diccionario de buenas prácticas por plataforma?