# Vídeos automáticos con MoneyPrinterTurbo (coste 0 €)

La app tiene un botón **"Convertir en vídeo"** en cada guion de vídeo generado. Monta un MP4 con locución, subtítulos, música y:

- clips de stock de **Pexels** (gratis), buscados con las palabras clave del guion, **o**
- **tus propias fotos/vídeos** (p. ej. fotos de producto del e-commerce).

Si `MONEYPRINTER_URL` no está configurada, el botón no aparece y la app funciona exactamente igual que antes.

## Qué cuesta

| Pieza | Coste |
|---|---|
| MoneyPrinterTurbo (MIT) | 0 € |
| Voz (Edge TTS de Microsoft) | 0 € |
| Stock de Pexels | 0 € (API key gratuita) |
| LLM | 0 €: el guion y las keywords ya los hace la app, MoneyPrinterTurbo no llama a ningún LLM |
| Dónde corre | Tu propio PC con Docker: 0 €. No necesita GPU. Mínimo 4 GB de RAM |

## Puesta en marcha (una vez, en tu PC)

1. Instala **Docker Desktop**, que es gratuito para uso personal y empresas pequeñas.

2. Descarga MoneyPrinterTurbo y prepara la configuración:

   ```bash
   git clone https://github.com/harry0703/MoneyPrinterTurbo.git
   cd MoneyPrinterTurbo
   cp config.example.toml config.toml
   ```

3. Consigue una API key gratuita en https://www.pexels.com/api/. Ponla en `config.toml`:

   ```toml
   pexels_api_keys = ["TU_KEY_DE_PEXELS"]
   ```

   Si solo vas a usar tus propias fotos/vídeos, puedes saltarte este paso.

4. Construye la imagen con los servidores oficiales. Por defecto el Dockerfile descarga de mirrors de China, que desde España van lentos o fallan:

   ```bash
   docker compose build --build-arg DOCKER_BUILD_MIRROR=default --build-arg PIP_USE_OFFICIAL=1
   ```

5. Arranca la API (y el panel web en `http://localhost:8501`):

   ```bash
   docker compose up -d
   ```

   La API queda en `http://127.0.0.1:8080`.

6. En la carpeta de esta app, crea `.env.local`:

   ```env
   MONEYPRINTER_URL=http://127.0.0.1:8080
   ```

7. Arranca la app con `bun run dev` y abre http://localhost:3000.

## Uso

1. Genera contenido de tipo **Guión de video**. Con Instagram o TikTok sale un guion corto.
2. Pulsa **Convertir en vídeo** en la tarjeta del guion.
3. Revisa el panel:
   - La **locución** viene ya extraída del guion. Edítala si quieres.
   - Las **palabras clave** van en inglés y sirven para buscar en Pexels. Claude las propone en `stockKeywords`.
   - También puedes **subir tus fotos o clips** del producto. Si lo haces, sustituyen al stock.
4. Elige formato (9:16 para Reels/TikTok/Shorts), voz y subtítulos, y pulsa **Generar vídeo**.
5. El vídeo tarda 1-3 minutos. Al acabar puedes verlo y **descargar el MP4**.

## Usarlo desde la app desplegada en Vercel (opcional)

Vercel no puede ver `127.0.0.1` de tu PC, así que hace falta exponer la API con un túnel gratuito. Ten en cuenta que tu PC tiene que estar encendido mientras generas.

1. En `config.toml` de MoneyPrinterTurbo, pon `api_key = "una-clave-larga-secreta"` (sección `[app]`) y reinicia con `docker compose restart api`.
2. Abre el túnel:

   ```bash
   cloudflared tunnel --url http://localhost:8080
   ```

   Te da una URL `https://xxxx.trycloudflare.com`.
3. En Vercel, añade las variables `MONEYPRINTER_URL=https://xxxx.trycloudflare.com` y `MONEYPRINTER_API_KEY=una-clave-larga-secreta`, y vuelve a desplegar.

**Nunca expongas la API sin `api_key`.**

## Variables de entorno

| Variable | Para qué |
|---|---|
| `MONEYPRINTER_URL` | URL de la API de MoneyPrinterTurbo. Sin ella, la función está desactivada |
| `MONEYPRINTER_API_KEY` | La `api_key` de `config.toml`, si la has puesto |
| `MONEYPRINTER_PUBLIC_URL` | Opcional. URL desde la que el navegador descarga los MP4, si es distinta de la anterior |

## Limitaciones honestas

- El stock de Pexels es genérico. Para producto (adaptógenos, e-commerce), **sube tus fotos o clips**: el resultado es mucho mejor y más auténtico.
- La voz de Edge TTS es un servicio no oficial de Microsoft. Normalmente funciona, pero puede fallar puntualmente; si pasa, reintenta.
- No usar para granjas de canales sin cara con AdSense: YouTube desmonetiza el "contenido reutilizado/no auténtico" hecho en masa.
- Los vídeos se quedan en `MoneyPrinterTurbo/storage/tasks/`. Descárgalos y borra esa carpeta de vez en cuando.
