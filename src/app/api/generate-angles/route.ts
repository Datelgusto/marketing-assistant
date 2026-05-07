import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product, analysis } = body;

    if (!product || !product.name) {
      return NextResponse.json(
        { error: 'Información del producto requerida' },
        { status: 400 }
      );
    }

    const prompt = `Eres un experto en ventas y copywriting. Genera 6 ángulos de venta diferentes para el siguiente producto.

PRODUCTO:
- Nombre: ${product.name}
- Problema que resuelve: ${product.problemSolved}
- Diferenciadores: ${product.differentiators}
- Modelo de precios: ${product.pricingModel}

${analysis ? `ANÁLISIS PREVIO:
- Propuesta de valor: ${analysis.valueProposition}
- Ventajas competitivas: ${analysis.competitiveAdvantages?.join(', ')}
- Ganchos emocionales: ${analysis.emotionalHooks?.join(', ')}` : ''}

Genera los 6 ángulos de venta en este formato JSON exacto:
{
  "angles": [
    {
      "id": "angle-1",
      "type": "problem-solution",
      "title": "Ángulo Problema-Solución",
      "headline": "Headline impactante (máximo 10 palabras)",
      "subheadline": "Subheadline que refuerza el mensaje",
      "keyPoints": ["punto clave 1", "punto clave 2", "punto clave 3"],
      "callToAction": "CTA específico",
      "bestFor": "Para quién funciona mejor este ángulo"
    },
    {
      "id": "angle-2",
      "type": "roi",
      "title": "Ángulo ROI y Ahorro",
      "headline": "Headline enfocado en resultados financieros",
      "subheadline": "Subheadline con datos o cifras",
      "keyPoints": ["punto clave 1", "punto clave 2", "punto clave 3"],
      "callToAction": "CTA específico",
      "bestFor": "Para quién funciona mejor"
    },
    {
      "id": "angle-3",
      "type": "emotional",
      "title": "Ángulo Emocional",
      "headline": "Headline que conecta emocionalmente",
      "subheadline": "Subheadline que profundiza",
      "keyPoints": ["punto clave 1", "punto clave 2", "punto clave 3"],
      "callToAction": "CTA específico",
      "bestFor": "Para quién funciona mejor"
    },
    {
      "id": "angle-4",
      "type": "social-proof",
      "title": "Ángulo Prueba Social",
      "headline": "Headline con validación social",
      "subheadline": "Subheadline con resultados de otros",
      "keyPoints": ["punto clave 1", "punto clave 2", "punto clave 3"],
      "callToAction": "CTA específico",
      "bestFor": "Para quién funciona mejor"
    },
    {
      "id": "angle-5",
      "type": "urgency",
      "title": "Ángulo Urgencia",
      "headline": "Headline que genera acción inmediata",
      "subheadline": "Subheadline con razón para actuar ahora",
      "keyPoints": ["punto clave 1", "punto clave 2", "punto clave 3"],
      "callToAction": "CTA específico",
      "bestFor": "Para quién funciona mejor"
    },
    {
      "id": "angle-6",
      "type": "competitive",
      "title": "Ángulo Ventaja Competitiva",
      "headline": "Headline que destaca sobre competencia",
      "subheadline": "Subheadline con diferenciación clara",
      "keyPoints": ["punto clave 1", "punto clave 2", "punto clave 3"],
      "callToAction": "CTA específico",
      "bestFor": "Para quién funciona mejor"
    }
  ]
}

Responde SOLO con el JSON.`;

    const responseText = await chatCompletion({
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en copywriting y ventas. Responde únicamente con JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8
    });

    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/```\n?/g, '');
    }

    const result = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, angles: result.angles });

  } catch (error: unknown) {
    console.error('Error generando ángulos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al generar ángulos de venta', details: errorMessage },
      { status: 500 }
    );
  }
}
