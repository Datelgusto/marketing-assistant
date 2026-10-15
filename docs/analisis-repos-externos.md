# Análisis de 4 repos externos (octubre 2026)

Análisis hecho solo leyendo el código, sin ejecutar nada. Nuestro sistema: Next.js en Vercel que, con Claude, genera análisis de producto, personas, ángulos de venta, contenido (incluido `video-script`), imágenes y calendario.

## Tabla resumen

| Repo | Qué es realmente | ¿Encaja con nuestra app? | ¿Sirve para ganar dinero? |
|---|---|---|---|
| **harry0703/MoneyPrinterTurbo** | Python/FastAPI: guion → stock (Pexels) → TTS → subtítulos → MP4. API REST. MIT | **Sí, es el más integrable** (como microservicio en VPS/Docker) | Como función "guion → vídeo" de la app, sí. Como granja de canales sin cara, no |
| **lemomo-ai/lemo-opuscar** | Plugin de Claude Code: Claude escribe animación en Canvas/three.js, la renderiza con Playwright y la monta con ffmpeg. MIT | No en runtime. Sí como herramienta manual o como inspiración (Remotion) | Vendiendo piezas animadas a medida, con trabajo humano |
| **vercel-labs/skills** (`find-skills`) | CLI para instalar skills en agentes (`.claude/skills`). MIT | Solo en desarrollo, no aporta funciones a la app | No |
| **Conway-Research/automaton** | Runtime de agente con wallet cripto y shell, dependiente de Conway Cloud. MIT | No. Solo se pueden copiar patrones | **No.** No tiene ningún motor para buscar clientes; el reel es engañoso |

## 1. MoneyPrinterTurbo: el que vale la pena

- Soporta Claude (`anthropic`), edge-tts gratis, Pexels/Pixabay, y formatos 9:16, 16:9 y 1:1.
- API: `POST /api/v1/videos` (devuelve `task_id`) y `GET /api/v1/tasks/{id}`. En la respuesta, `state` vale 1 cuando ha terminado y -1 si ha fallado, y `videos[]` trae los vídeos.
- **No puede ir en Vercel** (necesita ffmpeg, renders de minutos y disco). Hay que desplegarlo en un VPS con Docker de 4-8 GB de RAM; no necesita GPU.
- Integración propuesta:
  1. Nuestro `video-script` (solo narración, sin acotaciones) va como `video_script`, y las keywords en inglés generadas por Claude como `video_terms`.
  2. Guardar el `task_id`.
  3. Hacer polling del estado.
  4. Subir el MP4 a Vercel Blob o S3.
- Riesgo: YouTube no monetiza el contenido "reutilizado o no auténtico" producido en masa, y stock + TTS es exactamente ese patrón.

## 2. lemo-opuscar

- Calidad visual alta, pero cada película cuesta 30-60 min y millones de tokens del plan.
- Riesgo de cadena de suministro: hace `git reset --hard` a `main` en cada uso. Si se usa, fijar un commit en un fork.
- Para la app es mejor **Remotion** con plantillas de promo de producto.

## 3. vercel-labs/skills

- Telemetría activada por defecto (`DISABLE_TELEMETRY=1` la desactiva).
- `find-skills` instala con `-g -y`, sin pedir confirmación. Mejor instalar a nivel de proyecto y revisar cada SKILL.md antes.

## 4. automaton

- Los "ingresos" son el USDC que mete el propio creador. "Muere" significa quedarse sin créditos de Conway; "se replica" significa crear VMs de pago.
- Guarda las claves privadas en texto plano, ejecuta shell en la máquina local si no hay sandbox y se automodifica.
- Patrones reutilizables (MIT):
  - Presupuesto por niveles con degradación a un modelo más barato: `inference/budget.ts`, `survival/low-compute.ts`.
  - Motor de políticas antes de ejecutar herramientas: `agent/policy-engine.ts`.
  - Defensa contra prompt-injection: `agent/injection-defense.ts`.

## 5. latent-spaces/brag (añadido después)

- **Qué es:** un plugin o skill de Claude Code (licencia MIT, v0.4.0) que convierte un proyecto de código **o la URL de una web** en un vídeo de lanzamiento de unos 20 s, con música, movimiento y textos para compartir.
- **Cómo funciona:**
  - `/brag` usa **HyperFrames** (de HeyGen, open source): Claude escribe la animación en HTML y la renderiza a MP4 con Chrome y ffmpeg.
  - `/brag-slim` es la variante pensada para Opus 5.5: Claude hace el vídeo con las herramientas que haya en la máquina.
- **Formatos:** horizontal, vertical y cuadrado. La voz es opcional (Kokoro, local).
- **Seguridad:** no tiene hooks, MCP ni telemetría en el plugin. Trae música de ende.app y efectos de sonido.
- **Coste:** sin API keys, pero **gasta del plan de Claude** (sesión agéntica larga, como lemo-opuscar). letsbrag.app es la versión web de pago.
- **Encaje:** complementa a MoneyPrinterTurbo, no lo sustituye.
  - MoneyPrinterTurbo saca muchos reels baratos con voz, subtítulos y fotos o stock.
  - brag saca pocas piezas "hero" animadas con estética de marca: lanzamiento de una web, e-commerce o producto.
- **Uso recomendado:** desde Claude Code, en local, pasándole la URL de la web del cliente. No se integra en la app.
