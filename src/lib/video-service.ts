// Cliente para MoneyPrinterTurbo (https://github.com/harry0703/MoneyPrinterTurbo).
// Corre aparte (Docker en tu PC o en un servidor), porque Vercel no puede montar vídeo.
// Si MONEYPRINTER_URL no está definida, la función de vídeo queda desactivada.

export interface VideoScriptScene {
  timestamp?: string;
  visual?: string;
  audio?: string;
  text?: string;
}

export interface VideoScript {
  title?: string;
  hook?: string;
  scenes?: VideoScriptScene[];
  cta?: string;
  tags?: string[];
  stockKeywords?: string[];
}

export interface CreateVideoInput {
  subject: string;
  narration: string;
  keywords: string[];
  aspect: '9:16' | '16:9' | '1:1';
  voice: string;
  subtitles: boolean;
  // Nombres de archivo devueltos por uploadMaterial(). Si hay alguno, se usan
  // tus fotos/vídeos en lugar del stock de Pexels.
  materials?: string[];
}

export interface VideoTaskStatus {
  state: 'processing' | 'done' | 'failed';
  progress: number;
  videos: string[];
  error?: string;
  failedStage?: string;
}

export function getVideoServiceConfig() {
  const url = process.env.MONEYPRINTER_URL?.replace(/\/+$/, '');
  return {
    enabled: Boolean(url),
    url: url ?? '',
    // URL desde la que el navegador puede ver los MP4 (por defecto, la misma).
    publicUrl: (process.env.MONEYPRINTER_PUBLIC_URL || url || '').replace(/\/+$/, ''),
    apiKey: process.env.MONEYPRINTER_API_KEY ?? '',
  };
}

function headers(extra: Record<string, string> = {}) {
  const { apiKey } = getVideoServiceConfig();
  return { ...(apiKey ? { 'x-api-key': apiKey } : {}), ...extra };
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { url } = getVideoServiceConfig();
  if (!url) throw new Error('Servicio de vídeo no configurado (falta MONEYPRINTER_URL)');

  const response = await fetch(`${url}/api/v1${path}`, { ...init, cache: 'no-store' });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body || body.status !== 200) {
    const detail = body?.message || body?.detail || response.statusText;
    throw new Error(`MoneyPrinterTurbo ${response.status}: ${JSON.stringify(detail)}`);
  }
  return body.data as T;
}

// Convierte nuestro guion JSON (hook + escenas + CTA) en solo la locución:
// MoneyPrinterTurbo lee en voz alta todo el texto que recibe.
export function scriptToNarration(script: VideoScript): string {
  const parts: string[] = [];
  const push = (text?: string) => {
    if (!text) return;
    const clean = text
      .replace(/\[[^\]]*\]|\([^)]*\)/g, ' ')
      .replace(/^\s*(voz en off|narrador|locutor|vo|audio)\s*:\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean || parts.some(p => p.includes(clean))) return;
    // Si la escena repite el hook, nos quedamos solo con la versión larga.
    const covered = parts.findIndex(p => clean.includes(p));
    if (covered >= 0) parts[covered] = clean;
    else parts.push(clean);
  };

  push(script.hook);
  script.scenes?.forEach(scene => push(scene.audio));
  push(script.cta);
  return parts.join(' ');
}

export async function createVideo(input: CreateVideoInput): Promise<string> {
  const useOwnMaterials = Boolean(input.materials?.length);
  const data = await call<{ task_id: string }>('/videos', {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      video_subject: input.subject,
      // Con guion y keywords propios, MoneyPrinterTurbo no llama a ningún LLM.
      video_script: input.narration,
      video_terms: input.keywords,
      video_aspect: input.aspect,
      video_language: 'es-ES',
      voice_name: input.voice,
      subtitle_enabled: input.subtitles,
      // Subtítulos grandes y con borde: se leen sobre fotos claras de producto.
      subtitle_position: 'custom',
      custom_position: 75,
      font_size: 72,
      stroke_width: 4,
      stroke_color: '#000000',
      text_fore_color: '#FFFFFF',
      bgm_type: 'random',
      video_count: 1,
      video_source: useOwnMaterials ? 'local' : 'pexels',
      ...(useOwnMaterials
        ? { video_materials: input.materials!.map(file => ({ provider: 'local', url: file })) }
        : {}),
    }),
  });
  return data.task_id;
}

export async function getVideoTask(taskId: string): Promise<VideoTaskStatus> {
  const data = await call<{
    state: number;
    progress?: number;
    videos?: string[];
    error?: string;
    failed_stage?: string;
  }>(`/tasks/${encodeURIComponent(taskId)}`, { headers: headers() });

  const { publicUrl } = getVideoServiceConfig();
  const toPublic = (uri: string) => (uri.startsWith('http') ? uri : `${publicUrl}${uri}`);

  return {
    state: data.state === 1 ? 'done' : data.state === -1 ? 'failed' : 'processing',
    progress: data.progress ?? 0,
    videos: (data.videos ?? []).map(toPublic),
    error: data.error,
    failedStage: data.failed_stage,
  };
}

export async function uploadMaterial(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file, file.name);
  const data = await call<{ file: string }>('/video_materials', {
    method: 'POST',
    headers: headers(),
    body: form,
  });
  return data.file;
}
