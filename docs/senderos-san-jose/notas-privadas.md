# Senderos de San José · notas privadas de Daniel (28-oct-2026)

> No enseñar. El informe para la constructora es `informe-auditoria.html` (artifact: https://claude.ai/artifact/7G4D6LKmGhnn96ZKx6Ej3J).

## Quién es
- **Constructora San Esteban S.A.S.**, constituida el 29-oct-2003, con unos 20 empleados (EMIS). Domicilio: Km 4.7 Vereda Lejos del Nido, El Retiro.
- **Proyectos anteriores:** Senderos de Jeréz (86 lotes, quedan 11), Compostela, Senderos del Retiro y Quirama.
- **Senderos de San José:** 48 lotes, desde 566-598 M en la web; 640-720 M en Fincaraíz.

## Lo que verifiqué yo mismo (28-oct)
- `senderosdesanjose.com`:
  - Solo envía `fbq('track','PageView')` del píxel 538102567734902.
  - GTM-WR62Z5Z está solo en `<noscript>`: no hay `gtm.js` ni `dataLayer`.
- El contenedor GTM:
  - Tiene la conversión de Google Ads 350511749 (etiqueta `jmG2CJO-yKMYEIXFkacB`) y `fbq Lead`.
  - Ambas se disparan con `moship-whatsapp-button-click` y `moship-whatsapp-form-submit`, que no existen en la web.
- **Formulario y chat:** son de GoHighLevel, desde `api.jtads.com` (JT Ads, «Agencia de Pauta Digital y Performance en LATAM»). **Pregunta clave para Matías:** ¿el chico al que pagan los 6 M es JT Ads?

## No sacar en la reunión con la constructora (contexto, no argumento)
- **Acción popular de 2022** (Tribunal Administrativo de Antioquia, rad. 05001 23 33 000 2022 01066 00) contra el Municipio de El Retiro, CORNARE y Constructora San Esteban. Es por el impacto ambiental de Senderos de Jerez y no sabemos cómo terminó.
- **constructorasanesteban.com redirige a Grupo Open House / Infinity Group Investment LLC USA** (tel. 310 898 35 30). Su relación con la constructora es desconocida; se puede preguntar con naturalidad.

## Comprobaciones a mano antes de presentar
1. **Capturas fechadas de los 9 anuncios** con tu sesión de Facebook iniciada: texto, creatividad, plataformas y destino. Enlace: https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&view_all_page_id=1126766254014315
2. **Google Ads Transparency:** https://adstransparency.google.com/?region=CO&domain=senderosdesanjose.com. Busca también «Constructora San Esteban».
3. **Búsquedas en Google desde Medellín**, en días distintos: «lotes El Retiro», «lotes campestres oriente antioqueño» y «Senderos de San José». Anota si sale un anuncio «Patrocinado».
4. **Tag Assistant y Meta Pixel Helper** sobre la web: confirma que solo sale PageView y mira si el iframe de jtads envía `Lead` por su cuenta.
5. **Incógnito:** deja tus datos en el formulario y en el chat de la web, y mide cuánto tardan en contestarte, si te califican y si te hacen seguimiento a las 24 h. Es la prueba que más pesa en la auditoría.
6. **Instagram @senderodesanjose:** seguidores, fecha del último post y si hay publicaciones con la etiqueta «Publicidad».
7. **RUES:** NIT y representante legal de Constructora San Esteban.
8. **Confirmar con el cliente** que la página de Facebook 1126766254014315 es la suya.

## Preguntas para la constructora
- ¿Qué incluye exactamente el pago de 6 M? ¿Cuánto va a Meta o Google y cuánto es honorario?
- ¿Quién es el titular de la cuenta de Google Ads 350511749, del píxel y del Business Manager? ¿Tienen ustedes acceso?
- ¿Reciben recibos de Meta o Google a su nombre?
- ¿Cuántos interesados les llegan al mes y por dónde? ¿Quién los contesta y cuánto tarda?
- ¿Cuántos lotes han vendido en 2026 y cuántos vinieron de redes?
