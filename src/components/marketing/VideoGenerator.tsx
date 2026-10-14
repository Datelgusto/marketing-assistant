'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clapperboard, Download, Loader2, Upload } from 'lucide-react';
import { scriptToNarration, type VideoScript } from '@/lib/video-service';

// Voces gratuitas de Microsoft Edge TTS que soporta MoneyPrinterTurbo.
const VOICES = [
  { value: 'es-ES-ElviraNeural-Female', label: 'Elvira (España, mujer)' },
  { value: 'es-ES-AlvaroNeural-Male', label: 'Álvaro (España, hombre)' },
  { value: 'es-MX-DaliaNeural-Female', label: 'Dalia (México, mujer)' },
  { value: 'es-MX-JorgeNeural-Male', label: 'Jorge (México, hombre)' },
];

interface Props {
  // Contenido del ContentItem de tipo video-script (JSON en texto).
  scriptJson: string;
  subject: string;
}

function parseScript(json: string): VideoScript {
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function VideoGenerator({ scriptJson, subject }: Props) {
  const script = parseScript(scriptJson);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [open, setOpen] = useState(false);
  const [narration, setNarration] = useState(() => scriptToNarration(script));
  const [keywords, setKeywords] = useState(() => (script.stockKeywords ?? []).join(', '));
  const [aspect, setAspect] = useState('9:16');
  const [voice, setVoice] = useState(VOICES[0].value);
  const [subtitles, setSubtitles] = useState(true);
  const [materials, setMaterials] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch('/api/video')
      .then(r => r.json())
      .then(d => setEnabled(Boolean(d.enabled)))
      .catch(() => setEnabled(false));
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Sin servicio configurado no mostramos nada: la app sigue igual que antes.
  if (!enabled) return null;

  const uploadFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/video/materials', { method: 'POST', body: form });
        const data = await res.json();
        if (!res.ok) throw new Error(data.details || data.error);
        uploaded.push(data.file);
      }
      setMaterials(prev => [...prev, ...uploaded]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al subir archivos');
    } finally {
      setUploading(false);
    }
  };

  const poll = (taskId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/video?taskId=${encodeURIComponent(taskId)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.details || data.error);
        const task = data.task;
        setProgress(task.progress);
        if (task.state === 'done') {
          clearInterval(pollRef.current!);
          setVideoUrl(task.videos[0] ?? null);
          setProgress(null);
        } else if (task.state === 'failed') {
          clearInterval(pollRef.current!);
          setError(`Falló en "${task.failedStage}": ${task.error}`);
          setProgress(null);
        }
      } catch (e) {
        clearInterval(pollRef.current!);
        setError(e instanceof Error ? e.message : 'Error consultando el vídeo');
        setProgress(null);
      }
    }, 4000);
  };

  const generate = async () => {
    setError(null);
    setVideoUrl(null);
    setProgress(0);
    try {
      const res = await fetch('/api/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          narration,
          keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          aspect,
          voice,
          subtitles,
          materials,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error);
      poll(data.taskId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear el vídeo');
      setProgress(null);
    }
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="mt-3" onClick={() => setOpen(true)}>
        <Clapperboard className="w-4 h-4 mr-2" />
        Convertir en vídeo
      </Button>
    );
  }

  const busy = progress !== null;

  return (
    <div className="mt-4 space-y-3 rounded-lg border p-4">
      <div className="space-y-1">
        <Label>Locución (lo que se leerá en voz alta)</Label>
        <Textarea rows={5} value={narration} onChange={e => setNarration(e.target.value)} />
      </div>

      <div className="space-y-1">
        <Label>Palabras clave para el stock de Pexels (en inglés, separadas por comas)</Label>
        <Input
          value={keywords}
          placeholder="herbal tea, calm woman, mushrooms"
          onChange={e => setKeywords(e.target.value)}
          disabled={materials.length > 0}
        />
      </div>

      <div className="space-y-1">
        <Label>O usa tus propias fotos/vídeos (sustituyen al stock)</Label>
        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="image/*,video/*"
            multiple
            disabled={uploading || busy}
            onChange={e => uploadFiles(e.target.files)}
          />
          {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
        </div>
        {materials.length > 0 && (
          <p className="text-sm text-muted-foreground">
            <Upload className="inline w-3 h-3 mr-1" />
            {materials.length} archivo(s) subido(s){' '}
            <button className="underline" onClick={() => setMaterials([])}>quitar</button>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>Formato</Label>
          <Select value={aspect} onValueChange={setAspect}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="9:16">Vertical 9:16 (Reels/TikTok/Shorts)</SelectItem>
              <SelectItem value="1:1">Cuadrado 1:1</SelectItem>
              <SelectItem value="16:9">Horizontal 16:9 (YouTube)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Voz</Label>
          <Select value={voice} onValueChange={setVoice}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {VOICES.map(v => (
                <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch checked={subtitles} onCheckedChange={setSubtitles} id="subs" />
          <Label htmlFor="subs">Subtítulos</Label>
        </div>
      </div>

      <Button onClick={generate} disabled={busy || uploading || !narration.trim()}>
        {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Clapperboard className="w-4 h-4 mr-2" />}
        {busy ? 'Generando vídeo…' : 'Generar vídeo'}
      </Button>

      {busy && <Progress value={progress ?? 0} />}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {videoUrl && (
        <div className="space-y-2">
          <video src={videoUrl} controls className="max-h-[480px] rounded-lg" />
          <Button variant="outline" size="sm" asChild>
            <a href={videoUrl} download target="_blank" rel="noreferrer">
              <Download className="w-4 h-4 mr-2" />
              Descargar MP4
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
