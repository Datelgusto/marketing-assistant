import { NextRequest, NextResponse } from 'next/server';
import { getVideoServiceConfig, uploadMaterial } from '@/lib/video-service';

// POST /api/video/materials (multipart, campo "file") -> { file }
// Sube una foto o clip propio (p. ej. fotos de producto) a MoneyPrinterTurbo.
export async function POST(request: NextRequest) {
  if (!getVideoServiceConfig().enabled) {
    return NextResponse.json({ error: 'Servicio de vídeo no configurado' }, { status: 503 });
  }

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Falta el archivo' }, { status: 400 });
    }
    return NextResponse.json({ success: true, file: await uploadMaterial(file) });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error al subir el archivo', details }, { status: 502 });
  }
}
