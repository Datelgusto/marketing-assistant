import { NextRequest, NextResponse } from 'next/server';
import { createVideo, getVideoServiceConfig, getVideoTask } from '@/lib/video-service';

const ASPECTS = ['9:16', '16:9', '1:1'] as const;

// GET /api/video            -> { enabled }
// GET /api/video?taskId=... -> estado de la tarea
export async function GET(request: NextRequest) {
  const { enabled } = getVideoServiceConfig();
  const taskId = request.nextUrl.searchParams.get('taskId');

  if (!taskId) return NextResponse.json({ enabled });
  if (!enabled) {
    return NextResponse.json({ error: 'Servicio de vídeo no configurado' }, { status: 503 });
  }

  try {
    return NextResponse.json({ success: true, task: await getVideoTask(taskId) });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error al consultar el vídeo', details }, { status: 502 });
  }
}

// POST /api/video -> { taskId }
export async function POST(request: NextRequest) {
  if (!getVideoServiceConfig().enabled) {
    return NextResponse.json({ error: 'Servicio de vídeo no configurado' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const narration = typeof body.narration === 'string' ? body.narration.trim() : '';
    const keywords: string[] = Array.isArray(body.keywords)
      ? body.keywords.map((k: unknown) => String(k).trim()).filter(Boolean).slice(0, 10)
      : [];
    const materials: string[] = Array.isArray(body.materials)
      ? body.materials.map((m: unknown) => String(m)).filter(Boolean)
      : [];

    if (!narration) {
      return NextResponse.json({ error: 'Falta el texto de la locución' }, { status: 400 });
    }
    if (!keywords.length && !materials.length) {
      return NextResponse.json(
        { error: 'Indica palabras clave para el stock o sube tus fotos/vídeos' },
        { status: 400 }
      );
    }

    const taskId = await createVideo({
      subject: String(body.subject || 'Vídeo'),
      narration,
      keywords: keywords.length ? keywords : ['product'],
      aspect: ASPECTS.includes(body.aspect) ? body.aspect : '9:16',
      voice: String(body.voice || 'es-ES-ElviraNeural-Female'),
      subtitles: body.subtitles !== false,
      materials,
    });

    return NextResponse.json({ success: true, taskId });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json({ error: 'Error al crear el vídeo', details }, { status: 502 });
  }
}
