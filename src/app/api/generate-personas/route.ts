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

    const prompt = `Eres un experto en marketing B2B y análisis de audiencias. Basándote en el siguiente producto, genera 2 buyer personas detallados en formato JSON.

PRODUCTO:
- Nombre: ${product.name}
- Industria: ${product.industry}
- Problema que resuelve: ${product.problemSolved}
- Características: ${product.features?.join(', ')}
- Audiencia inicial: ${product.targetAudience}
- Modelo de precios: ${product.pricingModel}

Genera 2 buyer personas en el siguiente formato JSON exacto:
{
  "personas": [
    {
      "id": "persona-1",
      "name": "Nombre del Persona",
      "role": "Título del puesto",
      "demographics": {
        "ageRange": "rango de edad",
        "companySize": "tamaño de empresa",
        "location": "ubicación típica",
        "experience": "nivel de experiencia"
      },
      "psychographics": {
        "motivations": ["motivación 1", "motivación 2"],
        "fears": ["miedo 1", "miedo 2"],
        "values": ["valor 1", "valor 2"]
      },
      "painPoints": ["dolor 1", "dolor 2", "dolor 3"],
      "goals": ["objetivo 1", "objetivo 2"],
      "channels": ["canal donde pasa tiempo 1", "canal 2"],
      "triggers": ["trigger de decisión 1", "trigger 2"],
      "objections": ["objeción común 1", "objeción 2"]
    },
    {
      "id": "persona-2",
      "name": "Nombre del Segundo Persona",
      "role": "Título del puesto",
      "demographics": {
        "ageRange": "rango de edad",
        "companySize": "tamaño de empresa",
        "location": "ubicación típica",
        "experience": "nivel de experiencia"
      },
      "psychographics": {
        "motivations": ["motivación 1", "motivación 2"],
        "fears": ["miedo 1", "miedo 2"],
        "values": ["valor 1", "valor 2"]
      },
      "painPoints": ["dolor 1", "dolor 2", "dolor 3"],
      "goals": ["objetivo 1", "objetivo 2"],
      "channels": ["canal donde pasa tiempo 1", "canal 2"],
      "triggers": ["trigger de decisión 1", "trigger 2"],
      "objections": ["objeción común 1", "objeción 2"]
    }
  ]
}

Uno debe ser el decisor principal (ej: CEO, Director) y otro el influenciador/usuario (ej: Manager, usuario final).
Responde SOLO con el JSON, sin markdown ni explicaciones.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en marketing B2B. Responde únicamente con JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8
    });

    const responseText = completion.choices[0]?.message?.content || '';
    
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/```\n?/g, '');
    }

    const result = JSON.parse(cleanJson);

    return NextResponse.json({ success: true, personas: result.personas });

  } catch (error: unknown) {
    console.error('Error generando personas:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al generar buyer personas', details: errorMessage },
      { status: 500 }
    );
  }
}
