import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, analysis, contentType, platform, persona, angle } = body;

    if (!product || !contentType) {
      return NextResponse.json(
        { error: 'Producto y tipo de contenido requeridos' },
        { status: 400 }
      );
    }

    let specificPrompt = '';

    switch (contentType) {
      case 'social-post':
        specificPrompt = getSocialPostPrompt(product, analysis, platform, persona, angle);
        break;
      case 'email-sequence':
        specificPrompt = getEmailPrompt(product, analysis, platform, persona, angle);
        break;
      case 'landing-copy':
        specificPrompt = getLandingPrompt(product, analysis, persona, angle);
        break;
      case 'video-script':
        specificPrompt = getVideoScriptPrompt(product, analysis, platform, persona, angle);
        break;
      case 'ad-copy':
        specificPrompt = getAdCopyPrompt(product, analysis, platform, persona, angle);
        break;
      case 'blog-outline':
        specificPrompt = getBlogPrompt(product, analysis, persona, angle);
        break;
      default:
        specificPrompt = getSocialPostPrompt(product, analysis, platform, persona, angle);
    }

    const responseText = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'Eres un experto copywriter y creador de contenido. Responde únicamente con JSON válido.'
        },
        {
          role: 'user',
          content: specificPrompt
        }
      ],
      temperature: 0.9
    });

    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/```\n?/g, '');
    }

    const result = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, content: result });

  } catch (error: unknown) {
    console.error('Error generando contenido:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al generar contenido', details: errorMessage },
      { status: 500 }
    );
  }
}

function getSocialPostPrompt(product: any, analysis: any, platform: string, persona: any, angle: any): string {
  const platformStyles: Record<string, string> = {
    linkedin: 'Profesional, con saltos de línea, idealmente 150-300 palabras, tono B2B',
    twitter: 'Máximo 280 caracteres, hooks potentes, conversacional',
    instagram: 'Visual, con emojis, máximo 2200 caracteres, storytelling',
    tiktok: 'Guión para video corto, conversacional, con hook fuerte en los primeros 3 segundos',
    facebook: 'Conversacional, ideal para grupos, máximo 500 caracteres'
  };

  return `Genera 3 posts para ${platform} sobre el siguiente producto.

PRODUCTO:
- Nombre: ${product.name}
- Problema que resuelve: ${product.problemSolved}
- Características: ${product.features?.join(', ')}

${analysis ? `ANÁLISIS: ${analysis.valueProposition}` : ''}
${persona ? `AUDIENCIA: ${persona.name} - ${persona.role}` : ''}
${angle ? `ÁNGULO: ${angle.title} - ${angle.headline}` : ''}

ESTILO ${platform.toUpperCase()}: ${platformStyles[platform] || platformStyles.linkedin}

Formato JSON:
{
  "posts": [
    {
      "id": "post-1",
      "title": "Título descriptivo del post",
      "content": "Contenido completo del post",
      "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
      "bestTimeToPost": "Mejor hora para publicar",
      "estimatedReach": "Alcance estimado"
    }
  ]
}`;
}

function getEmailPrompt(product: any, analysis: any, platform: string, persona: any, angle: any): string {
  const emailTypes: Record<string, string> = {
    cold: 'Email de contacto frío, sin venta agresiva, enfocado en valor',
    nurture: 'Secuencia de nurturing, educativo, construye confianza',
    sales: 'Email de venta directa, beneficios claros, CTA fuerte'
  };

  return `Genera una secuencia de 3 emails tipo "${platform}" para el siguiente producto.

PRODUCTO:
- Nombre: ${product.name}
- Problema que resuelve: ${product.problemSolved}
- Diferenciadores: ${product.differentiators}
- Modelo de precios: ${product.pricingModel}

${analysis ? `PROPUESTA DE VALOR: ${analysis.valueProposition}` : ''}
${persona ? `DESTINATARIO: ${persona.name} - ${persona.role}` : ''}

TIPO: ${emailTypes[platform] || emailTypes.cold}

Formato JSON:
{
  "emails": [
    {
      "id": "email-1",
      "subject": "Asunto del email",
      "previewText": "Texto de previsualización",
      "body": "Cuerpo del email completo",
      "cta": "Call to action específico",
      "timing": "Cuándo enviar (días después del anterior)"
    }
  ]
}`;
}

function getLandingPrompt(product: any, analysis: any, persona: any, angle: any): string {
  return `Genera copy para landing page del siguiente producto.

PRODUCTO:
- Nombre: ${product.name}
- Problema que resuelve: ${product.problemSolved}
- Características: ${product.features?.join(', ')}
- Diferenciadores: ${product.differentiators}

${analysis ? `ANÁLISIS: ${JSON.stringify(analysis)}` : ''}

Formato JSON:
{
  "hero": {
    "headline": "Headline principal (máximo 10 palabras)",
    "subheadline": "Subheadline explicativo",
    "cta": "Texto del botón principal"
  },
  "benefits": [
    {"title": "Beneficio 1", "description": "Descripción del beneficio"},
    {"title": "Beneficio 2", "description": "Descripción"},
    {"title": "Beneficio 3", "description": "Descripción"}
  ],
  "socialProof": {
    "headline": "Headline de prueba social",
    "testimonials": ["testimonio ejemplo 1", "testimonio ejemplo 2"]
  },
  "features": [
    {"name": "Feature 1", "description": "Descripción"},
    {"name": "Feature 2", "description": "Descripción"}
  ],
  "faq": [
    {"question": "Pregunta frecuente 1", "answer": "Respuesta"},
    {"question": "Pregunta frecuente 2", "answer": "Respuesta"}
  ],
  "finalCta": "CTA final"
}`;
}

function getVideoScriptPrompt(product: any, analysis: any, platform: string, persona: any, angle: any): string {
  const isShort = platform === 'tiktok' || platform === 'instagram';

  return `Genera un guión de video ${isShort ? 'corto (30-60 segundos)' : 'largo (3-5 minutos)'} para ${platform}.

PRODUCTO:
- Nombre: ${product.name}
- Problema que resuelve: ${product.problemSolved}
- Características principales: ${product.features?.join(', ')}

${analysis ? `PROPUESTA DE VALOR: ${analysis.valueProposition}` : ''}
${angle ? `ÁNGULO: ${angle.title}` : ''}

Formato JSON:
{
  "title": "Título del video",
  "duration": "Duración estimada",
  "hook": "Primeras 3 segundos - hook para captar atención",
  "scenes": [
    {
      "timestamp": "0:00-0:05",
      "visual": "Descripción de lo que se ve",
      "audio": "Lo que se dice o escucha",
      "text": "Texto en pantalla (si aplica)"
    }
  ],
  "cta": "Call to action final",
  "thumbnail": "Descripción de la miniatura sugerida",
  "tags": ["tag1", "tag2", "tag3"]
}`;
}

function getAdCopyPrompt(product: any, analysis: any, platform: string, persona: any, angle: any): string {
  const platformSpecs: Record<string, string> = {
    facebook: 'Texto principal + headline + descripción',
    instagram: 'Texto + headline opcional',
    'google-ads': 'Headline (30 chars) + descripción (90 chars)'
  };

  return `Genera 3 variantes de anuncios para ${platform}.

PRODUCTO:
- Nombre: ${product.name}
- Problema: ${product.problemSolved}
- Diferenciadores: ${product.differentiators}

${analysis ? `ANÁLISIS: ${analysis.valueProposition}` : ''}
${persona ? `AUDIENCIA: ${persona.name}` : ''}

ESPECIFICACIONES: ${platformSpecs[platform] || platformSpecs.facebook}

Formato JSON:
{
  "ads": [
    {
      "id": "ad-1",
      "headline": "Headline del anuncio",
      "primaryText": "Texto principal",
      "description": "Descripción (si aplica)",
      "cta": "Texto del botón",
      "targeting": "Sugerencia de segmentación"
    }
  ]
}`;
}

function getBlogPrompt(product: any, analysis: any, persona: any, angle: any): string {
  return `Genera un outline de blog post para el siguiente producto.

PRODUCTO:
- Nombre: ${product.name}
- Problema: ${product.problemSolved}
- Características: ${product.features?.join(', ')}

${analysis ? `PROPUESTA DE VALOR: ${analysis.valueProposition}` : ''}

Formato JSON:
{
  "title": "Título SEO-optimized del artículo",
  "metaDescription": "Meta descripción (155 caracteres)",
  "targetKeyword": "Palabra clave principal",
  "secondaryKeywords": ["keyword secundaria 1", "keyword 2"],
  "outline": [
    {
      "heading": "H2: Introducción",
      "points": ["Hook inicial", "Problema a abordar", "Qué aprenderán"]
    },
    {
      "heading": "H2: Primer punto principal",
      "points": ["Subpunto 1", "Subpunto 2", "Ejemplo práctico"]
    }
  ],
  "wordCount": "Palabras estimadas",
  "cta": "Call to action del artículo"
}`;
}
