# Catálogo de Skills del Proyecto Casto

Este documento contiene una lista de todas las herramientas especializadas (skills) disponibles en el proyecto, su propósito principal y los escenarios específicos en los que se activan (triggers).

## Diseño y UX/UI
- **casto-design-system**
  - **Propósito:** Sistema de diseño visual para Casto Landing. Define tokens, paleta de colores, glassmorphism, tipografía y estándares de UI oscura premium.
  - **Cuándo usar (Trigger):** Al crear o revisar cualquier componente UI, cuando se pida "revisar diseño", "aplicar estética", o al escribir CSS/clases de Tailwind.
- **a11y-wcag-compliance**
  - **Propósito:** Asegurar la accesibilidad según el estándar WCAG 2.2 AA para interfaces React.
  - **Cuándo usar (Trigger):** Al crear componentes UI, revisar formularios, manejar navegación por teclado, asegurar contraste, o cuando se pida "revisar accesibilidad" o "cumplir WCAG".
- **web-design-guidelines**
  - **Propósito:** Revisar el código de UI para asegurar el cumplimiento con las guías de interfaces web.
  - **Cuándo usar (Trigger):** Al pedir "review my UI", "check accessibility", "audit design", "review UX", o revisar el sitio contra las mejores prácticas.
- **flipper-conversion-copywriting**
  - **Propósito:** Aplicar reglas de copywriting orientado a la conversión para landing pages de flipping inmobiliario.
  - **Cuándo usar (Trigger):** Al escribir textos de UI, CTAs, titulares, badges, o pedir "mejorar copy", "texto de conversión", o "optimizar CTA".

## Animación y Presentación
- **landing-animations-gsap-motion**
  - **Propósito:** Diseñar y generar animaciones avanzadas para landing pages y demos de UI usando GSAP (animaciones con scroll) y motion.dev (microinteracciones).
  - **Cuándo usar (Trigger):** Al planificar y crear animaciones al hacer scroll o microinteracciones interactivas de forma sofisticada.
- **scroll-choreography**
  - **Propósito:** Timeline maestro para la estructuración del scroll en la landing de Casto. Define los elementos a animar, su aparición y orden durante el scroll del usuario.
  - **Cuándo usar (Trigger):** Al planificar animaciones al hacer scroll, crear nuevas secciones, o pedir definir "coreografía", "timeline de scroll" o "secuencia de animaciones".
- **excalidraw-diagram**
  - **Propósito:** Crear diagramas en formato JSON de Excalidraw abstractos y fluidos para argumentaciones visuales.
  - **Cuándo usar (Trigger):** Al necesitar visualizar flujos de trabajo, arquitecturas, conceptos, datos, o al pedir hacer un "diagrama" o "visualizar arquitectura".

## React & Vercel
- **vercel-react-best-practices**
  - **Propósito:** Guías expertas de desempeño y optimización para la creación en React/Next.js con Vercel.
  - **Cuándo usar (Trigger):** Al escribir, revisar o refactorizar código de React/Next.js, optimizar datos, y performance.
- **vercel-composition-patterns**
  - **Propósito:** Patrones avanzados de composición en React construidos para escalar y reutilizarse fácilmente (incluye APIs de React 19).
  - **Cuándo usar (Trigger):** Al refactorizar componentes grandes con boolean props o context providers masivos, implementando Compound Components.
- **github-actions-vercel-deployment**
  - **Propósito:** Configurar y mantener pautas de CI/CD para GitHub Actions combinadas con Vercel.
  - **Cuándo usar (Trigger):** Al automatizar procesos de despliegue automatizados, revisar flujos, gestionar secretos/acciones del flujo principal o ramas.
- **landing-seo-performance**
  - **Propósito:** Control de SEO técnico del sitio y optimización para Core Web Vitals en landing pages.
  - **Cuándo usar (Trigger):** Al crear modificaciones como `index.html`, agregar imágenes con alt, y cuando pidan "optimizar SEO" o "mejorar performance".

## Operativa n8n (Manejo de Nodos y Workflows)
- **n8n-workflow-patterns**
  - **Propósito:** Referencia de patrones estructurales para diseño de flujos en n8n a gran escala y de comprobada eficacia operativa.
  - **Cuándo usar (Trigger):** Al configurar webhooks por arquitectura, plantear cron jobs o pedir armar lógica de nodos HTTP frente a APIs e IA.
- **n8n-node-configuration**
  - **Propósito:** Asistencia profunda e individual para perfiles de configuración precisos y dependencias explícitas usando operaciones del nodo seleccionado en n8n.
  - **Cuándo usar (Trigger):** Al modificar, armar y ajustar la parte más detallada de un nodo, sus propiedades complejas o requerir fields según nivel u operaciones.
- **n8n-code-javascript**
  - **Propósito:** Base de conocimiento de Javascript y sus límites y funciones propias nativas provistas dentro de n8n.
  - **Cuándo usar (Trigger):** Al invocar rutinas JavaScript en el Code node con sintaxis `$json`, `$input`, el método `DateTime` y métodos `$helpers`.
- **n8n-code-python**
  - **Propósito:** Reglas de escritura al armar Python puro y librerías pre-integradas en nodos _Code_ dentro del framework de n8n.
  - **Cuándo usar (Trigger):** Estando en sintaxis como `_input`, `_json`, o limitaciones técnicas que no le competen a Python directamente y requiera Python en código natural de n8n.
- **n8n-expression-syntax**
  - **Propósito:** Correctiva a expresiones condicionales parametrizadas (`{{ expresiones }}`).
  - **Cuándo usar (Trigger):** Al validar errores sobre los campos $json o con acceso estricto al $node y parámetros por webhook pasados por la interface gráfica interactiva.
- **n8n-validation-expert**
  - **Propósito:** Orientación asertiva para identificar cuellos de botella semánticos o alertas de Warning y validaciones n8n falsos-positivos.
  - **Cuándo usar (Trigger):** Cuando surgen mensajes explícitos en n8n acusando una alerta de estructura al operador o del loop de ejecución.
- **n8n-mcp-tools-expert**
  - **Propósito:** Catálogo consultivo y orientativo de métodos precisos del _integrador MCP_ para n8n desde las herramientas nativas del Asistente a un nodo.
  - **Cuándo usar (Trigger):** Al consultar por una plantilla de acción o solicitar validación/gestión de un workflow o herramienta en n8n-mcp en el prompt explícito o configuración.

## Browser y Scraping
- **browser-automation**
  - **Propósito:** Chrome DevTools Protocol controller para web scraping, analisis de contenido, extraccion de transcripts de YouTube, screenshots y automatizacion de browser. Zero dependencies.
  - **Cuándo usar (Trigger):** Al pedir "analiza este video", "extrae el transcript", "dame los puntos clave de [URL]", "lee esta pagina", "screenshot de [URL]", "navega a", "scrape", o cualquier tarea que requiera interactuar con un navegador.

## Utilidad y Sesión
- **session-handoff**
  - **Propósito:** Herramienta enfocada a preservar y consolidar el contexto crítico antes de que se pierda información valiosa en iteraciones que excedan límites del conversor.
  - **Cuándo usar (Trigger):** Cuando se diga explícitamente "guarda contexto", "handoff", "save session", o de forma preventiva si la conversación actual está próxima a su límite.
