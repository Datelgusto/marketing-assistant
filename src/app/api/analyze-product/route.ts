import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { product } = body;

    if (!product || !product.name) {
      return NextResponse.json(
        { error: 'Información del producto requerida' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const prompt = `Eres un experto en marketing y estrategia de producto. Analiza el siguiente producto y genera un análisis estratégico completo en formato JSON.

PRODUCTO:
- Nombre: ${product.name}
- Industria: ${product.industry}
- Problema que resuelve: ${product.problemSolved}
- Características: ${product.features?.join(', ')}
- Audiencia objetivo: ${product.targetAudience}
- Modelo de precios: ${product.pricingModel}
- Competidores: ${product.competitors}
- Diferenciadores: ${product.differentiators}
- Website: ${product.websiteUrl || 'No especificado'}

Genera el análisis en el siguiente formato JSON exacto:
{
  "valueProposition": "Una propuesta de valor clara y concisa (máximo 20 palabras)",
  "painPointsSolved": [
    "Problema específico 1 que resuelve",
    "Problema específico 2 que resuelve",
    "Problema específico 3 que resuelve",
    "Problema específico 4 que resuelve"
  ],
  "competitiveAdvantages": [
    "Ventaja competitiva 1",
    "Ventaja competitiva 2",
    "Ventaja competitiva 3"
  ],
  "marketPositioning": "Descripción clara de cómo posicionar el producto en el mercado y qué nicho ocupa",
  "emotionalHooks": [
    "Gancho emocional 1 (miedo, aspiración, etc.)",
    "Gancho emocional 2",
    "Gancho emocional 3"
  ],
  "uniqueSellingPoints": [
    "USP 1 diferenciador",
    "USP 2 diferenciador",
    "USP 3 diferenciador"
  ]
}

Responde SOLO con el JSON, sin markdown ni explicaciones.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en marketing y estrategia de producto. Responde únicamente con JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    });

    const responseText = completion.choices[0]?.message?.content || '';

    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/```\n?/g, '');
    }

    const analysis = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, analysis });

  } catch (error: unknown) {
    console.error('Error analizando producto:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al analizar el producto', details: errorMessage },
      { status: 500 }
    );
  }
}
