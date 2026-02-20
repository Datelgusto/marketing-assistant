import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, productId, type, size } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt requerido para generar imagen' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    // Validar tamaño
    const validSizes = ['1024x1024', '768x1344', '864x1152', '1344x768', '1152x864', '1440x720', '720x1440'];
    const imageSize = validSizes.includes(size) ? size : '1024x1024';

    // Generar imagen
    const response = await zai.images.generations.create({
      prompt: prompt,
      size: imageSize as '1024x1024' | '768x1344' | '864x1152' | '1344x768' | '1152x864' | '1440x720' | '720x1440'
    });

    const imageBase64 = response.data[0]?.base64;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No se pudo generar la imagen' },
        { status: 500 }
      );
    }

    // Guardar imagen en disco
    const timestamp = Date.now();
    const filename = `image_${productId || 'general'}_${timestamp}.png`;
    const filepath = path.join('/home/z/my-project/download', filename);
    
    // Convertir base64 a buffer
    const buffer = Buffer.from(imageBase64, 'base64');
    await writeFile(filepath, buffer);

    const imageId = `img-${timestamp}`;

    return NextResponse.json({
      success: true,
      image: {
        id: imageId,
        productId: productId || 'general',
        prompt: prompt,
        type: type || 'social',
        filename: filename,
        filepath: `/download/${filename}`,
        base64: imageBase64,
        createdAt: new Date().toISOString()
      }
    });

  } catch (error: unknown) {
    console.error('Error generando imagen:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { error: 'Error al generar imagen', details: errorMessage },
      { status: 500 }
    );
  }
}
