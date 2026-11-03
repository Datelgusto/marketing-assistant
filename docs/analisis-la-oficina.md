# Análisis de "La Oficina" (noviembre 2026)

Material de la carpeta de Drive: `la-oficina-plugin.zip`, `Prompt - La Oficina.txt` y el "Manual de instalación y uso". Es un regalo (lead magnet) de **AI BIZ School**. Lo analicé leyendo el código, sin ejecutarlo.

## Qué es de verdad

Es un **plugin (mod) de Claude Code** para la app de escritorio. No es una app web ni algo que se pueda meter en la nuestra.

- Registra 5 subagentes (modelo Sonnet) que trabajan en cadena, pasándose archivos `.md`/`.json` en `~/La-Oficina/clientes/<negocio>/<fecha>/`:
  1. **Azafato**: lee los materiales del negocio y escribe `ficha.md`.
  2. **Radar** ×3 (en paralelo): Redes, Web y Materiales. Hasta 5 hallazgos cada uno.
  3. **Consultor**: 3 problemas con el dato que los respalda y un plan de 30 días.
  4. **Arquitecto**: elige 3 agentes de IA para el negocio.
  5. **Fábrica** ×3: por cada agente, un `prompt.md` y una `ficha.json` (qué hará, qué no, qué necesita, pasos).
- Una pantalla HTML (violeta/neón) que se refresca cada 350 ms leyendo `estado.js`, con un feed en vivo, una bandeja de archivos y confeti al final.
- Entrega **un plano y un prompt inicial** por agente. No construye ni conecta nada.

"Que se hablen entre ellos" es una forma de decirlo: no conversan. Es una **cadena secuencial** que orquesta el Claude principal, y cada etapa lee los archivos de la anterior.

## Calidad técnica

Mejor de lo que parece por el marketing:

- Funciones puras con tests (`register.test.tsx`), manejo de errores para que si falla la pantalla los agentes sigan, y JSON escapado al escribir `estado.js`.
- Reglas sensatas para todos los agentes: no inventar números, marcar lo que falta como "a confirmar", no publicar ni enviar nada, y solo leer y escribir en su carpeta.
- Seguridad: no hace llamadas de red propias, no usa claves ni telemetría. Lo único que ejecuta es `abrir-pantalla.sh` (AppleScript para abrir Chrome). Es inofensivo.

## Problemas y contradicciones

| Problema | Detalle |
|---|---|
| **Arquitecto viene sesgado** | Su prompt dice: *"Por defecto Victoria (copy y diseño) y Metrics (analiza números)"*. Así, 2 de los 3 agentes "a medida" están decididos de antemano, sea cual sea el negocio. Huele a embudo hacia sus propios productos o cursos |
| **Radar "Web" no lee la web** | Solo tiene `WebSearch`, sin `WebFetch`. Ve snippets de buscador, pero no puede abrir la página del cliente |
| **Gráficos atados a la demo** | Solo funcionan con `ventas-agosto.csv`, `cobros-agosto.csv` y `metricas-instagram.csv`, con columnas por posición fija. Con datos reales de otro negocio, desaparecen |
| **El prompt no coincide con el zip** | El prompt prohíbe traer un negocio de ejemplo y exige `/mi-oficina`. El zip trae "Velas Aurora" precargado y usa `/oficina` |
| **Solo Mac + Chrome** para la pantalla | En otros sistemas, la abres a mano |
| **Gasta del plan de Claude** | Son 8 subagentes por corrida, unos 4-5 minutos cada vez |
| **El "prompt universal"** para ChatGPT/Gemini | Es un prompt de consultoría en 5 etapas. Útil, pero nada especial |

Conclusión: **es un buen show para vender** (la pantalla está pensada para impresionar a gente no técnica) y está correctamente programado. Pero el resultado final es un diagnóstico más 3 prompts, y uno de los pasos clave viene amañado.

## Qué nos sirve para la app

Nuestra app genera análisis → personas → ángulos → contenido → imágenes → calendario → vídeo **solo a partir del formulario de producto**, y cada paso pide al modelo que rellene listas fijas ("4 pain points", "3 USPs"). Eso le invita a inventar. De La Oficina vale la pena copiar el **método**, no el plugin.

1. **Reglas anti-invención en todos los prompts.** Añadir: "usa solo lo que trae el negocio; lo que falte, márcalo como `a confirmar`; no inventes cifras, testimonios ni datos". Coste casi cero y mejora la fiabilidad. Para Rapha (suplementos) es aún más importante por las alegaciones de salud.
2. **Paso de diagnóstico antes de generar contenido.** Un endpoint `diagnose` que devuelva los 3 problemas de marketing principales, con la evidencia de cada uno, más un plan de 30 días. Los ángulos y el calendario partirían de ahí en vez de partir de cero.
3. **Ficha de marca tipo "workbook".** Ampliar `Product` con voz y tono, **palabras que sí y que no** (p. ej. Rapha: nunca "cura" ni "terapéutico"), cliente ideal y precios reales. Después, inyectarla en todos los prompts de contenido.
4. **Subir materiales reales.** CSV de ventas, conversaciones de WhatsApp y métricas de Instagram como contexto del análisis, en vez de solo los campos del formulario.
5. **Investigación real de la web.** El campo `websiteUrl` hoy solo se pega en el prompt. Se puede añadir la herramienta de búsqueda/fetch web de la API de Anthropic para leer la web del cliente y de los competidores (lo que el Radar de ellos no hace bien).
6. **Progreso visible por etapas** (opcional): mostrar en la UI qué paso está corriendo. Es lo que más luce de La Oficina, pero también lo menos importante.

**No nos sirve:** el plugin en sí (es un mod de escritorio de Claude Code, no algo para Vercel), el diseño de "3 agentes" (no vendemos equipos de agentes) ni la pantalla violeta.

## Recomendación

Implementar los puntos 1-3 (son cambios de prompts y de tipos, de poco riesgo) y dejar el 4-5 para después. Si se quiere usar La Oficina tal cual como herramienta interna de diagnóstico de clientes, se puede instalar en Claude Code, pero quitando la línea de "Victoria y Metrics por defecto" del Arquitecto en `hooks/register.tsx`.
