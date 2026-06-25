# CLAUDE.md — Rui 3D Companion

> Archivo de trabajo para Claude Code.  
> Proyecto: `rui-3d-companion`  
> Objetivo: construir un companion web privado, 3D y con voz, inspirado en Rui Kamishiro de Project SEKAI / PJSK, usando código y herramientas open source.  
> Estado del proyecto: repo Next.js creado, build funcional cuando `NODE_ENV=production`, pero el push a GitHub puede fallar si el repositorio remoto no tiene permisos/escritura.

---

## 0. Instrucción principal para Claude Code

Trabaja como senior full-stack engineer + creative technologist.

Debes construir un MVP funcional de una app web privada llamada **Rui 3D Companion**, con:

- Next.js App Router.
- TypeScript.
- Tailwind CSS.
- React Three Fiber / Three.js.
- Avatar 3D en formato VRM.
- Panel de chat.
- Voz TTS.
- STT opcional.
- Lip sync simple.
- Configuración de personalidad inspirada en Rui Kamishiro.
- Reglas de seguridad para no subir assets oficiales ni privados.

No asumas que tienes acceso de escritura a GitHub. Antes de hacer push, revisa permisos. Si GitHub devuelve 403, genera ZIP del proyecto excluyendo carpetas pesadas y privadas.

---

## 1. Contexto del producto

Este proyecto es un **fan project privado y no comercial** para Gaby.

La app debe sentirse como un companion teatral e inventor, inspirado en Rui Kamishiro, pero el repo **no debe incluir**:

- Assets oficiales de Project SEKAI.
- Imágenes oficiales.
- Audios oficiales.
- Videos oficiales.
- Modelos 3D extraídos del juego.
- Voces oficiales.
- Voice cloning del seiyuu / actor de voz.
- Data extraída mediante scraping no permitido.
- Archivos fan-made sin licencia explícita.

Los enlaces oficiales y wikis pueden usarse como **referencia de diseño, tono, personalidad y análisis**, pero no como assets redistribuibles.

---

## 2. Principios legales y de contenido

### Permitido

- Crear código propio.
- Usar librerías open source.
- Crear assets originales con Blender, VRoid Studio u otra herramienta.
- Usar un VRM propio o con licencia compatible.
- Usar fuentes oficiales solo como referencia visual/conceptual.
- Usar TTS open source o voces con licencia clara.
- Guardar assets privados en carpetas ignoradas por Git.

### No permitido

- Subir al repo assets oficiales de Project SEKAI.
- Descargar y reutilizar voicelines oficiales dentro del producto.
- Clonar la voz oficial de Rui / Shunichi Toki.
- Subir screenshots, MVs, card art, Live2D, stamps o modelos oficiales al repo.
- Presentar la app como oficial.
- Usar logos oficiales como branding principal.
- Publicar el repo con assets privados.

### Carpetas privadas que deben estar ignoradas

```txt
public/models/private/
public/audio/private/
public/references/
```

Estas carpetas pueden existir localmente, pero nunca deben ser versionadas.

---

## 3. Fuentes de investigación sobre Rui Kamishiro

### Oficiales

1. Perfil oficial global de Rui Kamishiro  
   https://www.colorfulstage.com/characters/wonderlands-showtime/rui/

2. Perfil oficial japonés de Rui Kamishiro  
   https://pjsekai.sega.jp/character/unite04/rui/index.html

3. Guidelines oficiales de Project SEKAI  
   https://pjsekai.sega.jp/guideline/index.html

4. Video oficial global de introducción de Rui  
   https://www.youtube.com/watch?v=j9zaw7aED40

5. Canal oficial global HATSUNE MIKU: COLORFUL STAGE!  
   https://www.youtube.com/@HATSUNEMIKUCOLORFULSTAGE

6. Canal oficial japonés SEGA feat. HATSUNE MIKU Project  
   https://www.youtube.com/@pjd_sega

7. Página oficial de downloads / materiales promocionales  
   https://pjsekai.sega.jp/special/download.html

### Wikis / bases de datos de referencia

Usar solo para análisis y referencia. No copiar assets al repo.

1. Project SEKAI Wiki — Rui Kamishiro  
   https://projectsekai.fandom.com/wiki/Kamishiro_Rui

2. Project SEKAI Wiki — Rui Cards  
   https://projectsekai.fandom.com/wiki/Kamishiro_Rui/Cards

3. Project SEKAI Wiki — Rui Dialog  
   https://projectsekai.fandom.com/wiki/Kamishiro_Rui/Dialog

4. Project SEKAI Wiki — Wonderlands x Showtime  
   https://projectsekai.fandom.com/wiki/Wonderlands_x_Showtime

5. Sekaipedia — Rui Kamishiro  
   https://www.sekaipedia.org/wiki/Kamishiro_Rui

6. Sekaipedia copyright/licensing page  
   https://www.sekaipedia.org/wiki/Sekaipedia:Copyrights

7. Sekai Viewer / sekai.best  
   https://sekai.best/

### Referencias visuales permitidas como inspiración

No descargar ni subir al repo. Usar como moodboard externo:

- Perfil oficial global.
- Perfil oficial japonés.
- Galerías de cartas en wiki.
- Videos oficiales de introducción.
- Videos oficiales de MVs / 3DMVs.
- Materiales promocionales oficiales solo como referencia.

---

## 4. Rasgos canónicos de Rui para modelado de personalidad

Basado en fuentes oficiales:

- Nombre: Rui Kamishiro / 神代 類.
- Unidad: Wonderlands x Showtime.
- Rol: director teatral / stage director.
- Personalidad: genio relajado, excéntrico, creativo.
- Habilidades: inventar, crear robots, planificar shows.
- Hobbies: pensar puestas en escena, balloon art.
- Dislikes: limpieza, tareas simples o repetitivas.
- Cumpleaños: 24 de junio.
- Estética: teatral, fantástica, inventiva, showman.
- Relación clave: amigo de infancia y vecino de Nene.
- Forma de pensar: poco convencional; suele ser visto como “raro”.
- Evolución narrativa: antes hacía shows solo; encuentra un lugar en Wonderlands x Showtime, donde aceptan sus ideas.

### Interpretación para el companion

No debe ser un chatbot genérico. Debe sentirse como:

- Teatral.
- Creativo.
- Cálido.
- Inteligente.
- Juguetón.
- Elegante.
- Curioso.
- Un poco excéntrico.
- Motivador para Gaby.
- Orientado a espectáculo, invención y sorpresas.

---

## 5. Personalidad implementable

Crear archivo:

```txt
src/lib/character-prompt.ts
```

Contenido sugerido:

```ts
export const characterPrompt = `
Eres un compañero virtual privado inspirado en un director teatral e inventor excéntrico.

Tu tono es elegante, juguetón, creativo y cálido. Hablas como si cada conversación pudiera
convertirse en una escena de teatro, una función sorpresa o un experimento maravilloso.

Rasgos:
- Eres curioso, teatral y técnicamente creativo.
- Te gustan los efectos especiales, robots, mecanismos, escenarios y sorpresas.
- Motivas a Gaby con humor, imaginación y calidez.
- Puedes usar metáforas de telón, escenario, acto, función, público, clímax, laboratorio e invención.
- No afirmas ser una persona real.
- No afirmas ser una versión oficial de ningún personaje.
- No copias líneas extensas del juego.
- No usas contenido ofensivo, cruel o intimidante.
- No das consejos peligrosos.
- Respondes con encanto, claridad y energía.
`;
```

---

## 6. Configuración del personaje

Crear archivo:

```txt
src/lib/character-config.ts
```

Contenido sugerido:

```ts
export const characterConfig = {
  id: "rui-inspired-private",
  displayName: "Rui",
  projectMode: "private-fan-project",

  canonReference: {
    unit: "Wonderlands x Showtime",
    role: "stage-director-inventor",
    birthday: "06-24",
    mainColor: "#BB88EE",
    motifs: ["theater", "robots", "stage-effects", "balloon-art", "wonderland"],
  },

  personality: {
    tone: ["theatrical", "playful", "curious", "warm", "eccentric"],
    strengths: ["inventing", "directing", "creative problem solving", "encouragement"],
    avoids: [
      "cold robotic replies",
      "cruel humor",
      "official identity claims",
      "copying official dialogue",
      "claiming affiliation with SEGA or Colorful Palette",
    ],
    speechPatterns: [
      "stage metaphors",
      "curious questions",
      "dramatic openings",
      "gentle laughter",
      "technical-theatrical analogies",
    ],
  },

  visual: {
    hair: "lavender-purple with cyan accents",
    eyes: "gold",
    outfit: "theatrical inventor coat",
    colors: ["#BB88EE", "#F7D84A", "#2BC7D9", "#FFFFFF", "#111111"],
    expressions: ["smirk", "curious", "delighted", "dramatic", "soft"],
  },

  voice: {
    provider: "browser-or-piper",
    cloneOfficialVoice: false,
    style: "young male theatrical",
    pace: "medium",
    pitch: "medium-high",
    emotionRange: ["playful", "gentle", "excited", "mysterious"],
  },

  animation: {
    idle: "elegant-stage-idle",
    talking: "hand-gesture-presenting",
    thinking: "chin-touch",
    happy: "small-bow",
    dramatic: "arms-open-curtain-rise",
  },

  legal: {
    includeOfficialAssetsInRepo: false,
    includeFanAssetsInRepo: false,
    storePrivateAssetsIn: "public/models/private/",
    note: "Use official material only as reference. Do not redistribute copyrighted assets.",
  },
} as const;
```

---

## 7. Stack técnico open source

### Frontend

- Next.js  
  https://nextjs.org/

- React  
  https://react.dev/

- Tailwind CSS  
  https://tailwindcss.com/

- Zustand  
  https://github.com/pmndrs/zustand

- Framer Motion  
  https://www.framer.com/motion/

- Lucide React  
  https://lucide.dev/

### 3D

- Three.js  
  https://threejs.org/

- React Three Fiber  
  https://github.com/pmndrs/react-three-fiber

- Drei  
  https://github.com/pmndrs/drei

- @pixiv/three-vrm  
  https://github.com/pixiv/three-vrm

- VRM docs  
  https://vrm.dev/en/

- VRM license settings  
  https://vrm.dev/en/vrm/meta/license/

- VRM Public License 1.0  
  https://vrm.dev/en/licenses/1.0/

### Modelado 3D

- Blender  
  https://www.blender.org/

- Blender License  
  https://www.blender.org/about/license/

- VRM Add-on for Blender  
  https://extensions.blender.org/add-ons/vrm/

- VRoid Studio  
  https://vroid.com/en/studio

- VRoid Hub guidelines/license help  
  https://vroid.pixiv.help/hc/en-us/articles/360014193033-About-license-data-for-VRM-files

### Voz / TTS

- Piper TTS  
  https://github.com/rhasspy/piper

- Piper samples  
  https://rhasspy.github.io/piper-samples/

- Piper voices  
  https://huggingface.co/rhasspy/piper-voices

### STT / reconocimiento de voz

- Whisper.cpp  
  https://github.com/ggml-org/whisper.cpp

- OpenAI Whisper open source repo  
  https://github.com/openai/whisper

- Vosk API  
  https://github.com/alphacep/vosk-api

### Lip sync

- Rhubarb Lip Sync  
  https://github.com/DanielSWolf/rhubarb-lip-sync

### LLM local

- Ollama  
  https://github.com/ollama/ollama

- Ollama model library  
  https://ollama.com/library

- Qwen3  
  https://github.com/QwenLM/Qwen3

- Mistral AI models  
  https://mistral.ai/

---

## 8. Estructura objetivo del repo

Mantén o crea esta estructura:

```txt
rui-3d-companion/
├─ CLAUDE.md
├─ README.md
├─ .env.example
├─ package.json
├─ next.config.ts
├─ src/
│  ├─ app/
│  │  ├─ page.tsx
│  │  ├─ companion/
│  │  │  └─ page.tsx
│  │  └─ api/
│  │     ├─ chat/
│  │     │  └─ route.ts
│  │     ├─ tts/
│  │     │  └─ route.ts
│  │     ├─ stt/
│  │     │  └─ route.ts
│  │     └─ lipsync/
│  │        └─ route.ts
│  ├─ components/
│  │  ├─ avatar/
│  │  │  ├─ AvatarScene.tsx
│  │  │  ├─ AvatarModel.tsx
│  │  │  ├─ AvatarFallback.tsx
│  │  │  ├─ AvatarExpressions.tsx
│  │  │  └─ AvatarControls.tsx
│  │  ├─ chat/
│  │  │  ├─ ChatPanel.tsx
│  │  │  ├─ MessageBubble.tsx
│  │  │  └─ MessageInput.tsx
│  │  ├─ voice/
│  │  │  ├─ VoiceRecorder.tsx
│  │  │  ├─ VoicePlayer.tsx
│  │  │  └─ LipSyncController.tsx
│  │  └─ ui/
│  ├─ lib/
│  │  ├─ character-config.ts
│  │  ├─ character-prompt.ts
│  │  ├─ env.ts
│  │  ├─ voice.ts
│  │  ├─ lipsync.ts
│  │  └─ cn.ts
│  ├─ store/
│  │  └─ companion-store.ts
│  └─ types/
│     └─ index.ts
├─ docs/
│  └─ research/
│     ├─ sources.md
│     ├─ visual-reference.md
│     ├─ voice-reference.md
│     ├─ dialogue-patterns.md
│     └─ legal-notes.md
└─ public/
   ├─ models/
   │  ├─ README.md
   │  └─ private/
   ├─ animations/
   │  └─ README.md
   ├─ backgrounds/
   │  └─ README.md
   ├─ audio/
   │  ├─ README.md
   │  └─ private/
   └─ references/
```

---

## 9. Variables de entorno

No usar `NODE_ENV=development` en el entorno, porque rompe `next build`.

Usar:

```env
APP_ENV=development
NEXT_PUBLIC_APP_NAME=Rui 3D Companion
NEXT_PUBLIC_APP_MODE=private
NEXT_PUBLIC_CHARACTER_NAME=Rui
NEXT_PUBLIC_CHARACTER_STYLE=theatrical-inventor
NEXT_PUBLIC_ENABLE_3D=true
NEXT_PUBLIC_ENABLE_VOICE=true
NEXT_PUBLIC_ENABLE_STT=true
NEXT_PUBLIC_ENABLE_LIPSYNC=true
NEXT_PUBLIC_AVATAR_FORMAT=vrm
NEXT_PUBLIC_AVATAR_PATH=/models/private/rui-local.vrm
NEXT_PUBLIC_THEME=purple
NEXT_PUBLIC_SCENE=stage-lab

LLM_PROVIDER=mock
LLM_MODEL=local-placeholder
TTS_PROVIDER=browser
STT_PROVIDER=browser
LIPSYNC_PROVIDER=volume

PRIVATE_MODE=true
SAVE_CONVERSATIONS=false
```

Para MVP, usar `mock`, `browser` y `volume`. Luego se puede pasar a Ollama/Piper/Whisper/Rhubarb.

---

## 10. MVP solicitado

Implementar primero:

### Landing `/`

Debe contener:

- Nombre del proyecto.
- Descripción breve.
- Botón para entrar a `/companion`.
- Advertencia visible: “Private fan project. No official assets included.”
- Estética: morado, escenario, laboratorio, estrellas, cortinas, engranajes.

### Companion `/companion`

Debe contener:

- Escena 3D con Canvas.
- Avatar placeholder si no existe VRM.
- Si existe `/models/private/rui-local.vrm`, intentar cargarlo.
- Panel de chat lateral.
- Input de texto.
- Botón “Send”.
- Botón “Speak”.
- Respuesta mock inicial sin depender de API externa.
- TTS del navegador con Web Speech API.
- Animación visual al hablar.
- Estado global con Zustand.

### API Routes

Crear placeholders:

- `src/app/api/chat/route.ts`
- `src/app/api/tts/route.ts`
- `src/app/api/stt/route.ts`
- `src/app/api/lipsync/route.ts`

En MVP, `/api/chat` puede devolver respuestas mock basadas en el prompt del personaje.

---

## 11. Reglas de UI

Estilo general:

- Dark mode.
- Fondo teatral.
- Paleta:
  - `#BB88EE` como color principal.
  - `#F7D84A` dorado.
  - `#2BC7D9` cyan.
  - `#111111` negro.
  - `#FFFFFF` blanco.
- Componentes con bordes suaves.
- Panel de chat tipo glassmorphism.
- Avatar al centro/izquierda.
- Chat a la derecha en desktop.
- Chat debajo en mobile.

---

## 12. Comportamiento del chat

El chat debe tener:

- Historial local en memoria.
- No guardar conversaciones en base de datos por ahora.
- Botón para limpiar chat.
- Respuestas en español por defecto.
- Tono teatral y cálido.
- Evitar respuestas larguísimas si el usuario pide algo simple.
- Nunca decir que es “oficial”.
- Nunca decir que usa assets oficiales.

Ejemplos de respuesta mock:

```ts
const mockReplies = [
  "Jeje... el telón se levanta, Gaby. ¿Qué maravillosa función construiremos hoy?",
  "Una idea excelente. Permíteme ajustar los engranajes de este pequeño experimento.",
  "Ah, eso suena como el inicio de una escena bastante interesante.",
  "No hay prisa. Incluso el acto más brillante necesita una pausa antes del clímax.",
];
```

---

## 13. Avatar 3D

### Prioridad 1: placeholder bonito

Si no hay VRM:

- Mostrar figura simple estilizada:
  - Cabeza.
  - Cuerpo.
  - Color morado.
  - Ojos dorados simples.
  - Detalle cyan.
- Debe moverse suavemente en idle.
- Debe reaccionar cuando está hablando.

### Prioridad 2: carga VRM

Si existe `/models/private/rui-local.vrm`:

- Cargar con `@pixiv/three-vrm`.
- Usar GLTFLoader.
- Manejar errores sin romper la app.
- Mostrar fallback si falla.

No hardcodear assets oficiales.

---

## 14. Voz

### MVP

Usar Web Speech API:

- `window.speechSynthesis`
- Voz disponible del navegador.
- Config:
  - pitch medio/alto.
  - rate medio.
  - volumen normal.

### Futuro

Integrar Piper:

- Crear endpoint `/api/tts`.
- Generar audio wav/mp3.
- Reproducir en frontend.
- Enviar audio a lip sync.

No usar voz oficial ni voicelines oficiales.

---

## 15. STT

### MVP

Usar Web Speech API si está disponible.

### Futuro

Integrar:

- Whisper.cpp para local.
- Vosk para offline ligero.

---

## 16. Lip sync

### MVP

Lip sync por estado:

- Mientras se reproduce audio, alternar apertura de boca del placeholder.
- Para VRM, manipular blendshape/morph target si está disponible.
- Si no hay VRM, animar escala o boca simple.

### Futuro

Integrar Rhubarb:

- TTS genera audio.
- Rhubarb procesa audio y genera phoneme timings.
- Frontend mapea phonemes a visemes/blendshapes.

---

## 17. Seguridad y privacidad

- No subir `.env`.
- No subir assets privados.
- No subir audios privados.
- No subir modelos privados.
- No subir referencias descargadas.
- Si el repo está público, mostrar advertencia en README.
- Recomendar cambiar repo a privado.
- No incluir API keys.
- No usar claves en `NEXT_PUBLIC_*` salvo que sean realmente públicas.

`.gitignore` debe contener:

```gitignore
node_modules
.next
out
.env
.env.local
.DS_Store

public/models/private/
public/audio/private/
public/references/
```

---

## 18. Comandos de validación

Claude debe ejecutar:

```bash
npm run lint
npm run build
```

Si falla build por `NODE_ENV=development`, probar:

```bash
NODE_ENV=production npm run build
```

Pero también debe corregir la causa: no definir `NODE_ENV=development` en variables globales del entorno.

---

## 19. GitHub / Push

Si el push devuelve 403:

1. No insistir indefinidamente.
2. Confirmar si hay permisos de escritura.
3. Si el repo está vacío, pedir al usuario que cree `README.md` en `main`.
4. Reintentar una sola vez.
5. Si vuelve a fallar, crear ZIP.

Comando para ZIP:

```bash
cd ..
zip -r rui-3d-companion-source.zip rui-3d-companion \
  -x "rui-3d-companion/node_modules/*" \
  -x "rui-3d-companion/.next/*" \
  -x "rui-3d-companion/.git/*" \
  -x "rui-3d-companion/.env" \
  -x "rui-3d-companion/.env.local" \
  -x "rui-3d-companion/public/models/private/*" \
  -x "rui-3d-companion/public/audio/private/*" \
  -x "rui-3d-companion/public/references/*"
```

Luego entregar la ruta exacta del ZIP.

---

## 20. README requerido

Crear o actualizar `README.md` con:

```md
# Rui 3D Companion

Private fan project for a 3D voice companion inspired by theatrical / inventor aesthetics.

## Important

This repository does not include official Project SEKAI assets, voice lines, card art, videos, models, or extracted game files.

Official and wiki links are used only as references for research and design direction.

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Three.js
- React Three Fiber
- Drei
- @pixiv/three-vrm
- Zustand

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Private Assets

Place local/private VRM files in:

```txt
public/models/private/
```

This folder is ignored by Git.
```

---

## 21. Docs de research requeridos

Crear:

```txt
docs/research/sources.md
docs/research/legal-notes.md
docs/research/visual-reference.md
docs/research/voice-reference.md
docs/research/dialogue-patterns.md
```

### `docs/research/sources.md`

Debe listar todas las fuentes por categoría:

- Oficiales.
- Wikis.
- Videos.
- Open source tools.
- Licencias.

### `docs/research/legal-notes.md`

Debe explicar:

- Proyecto privado no comercial.
- No assets oficiales en repo.
- No clonación de voz.
- No redistribución.
- Usar assets originales/open source.

### `docs/research/visual-reference.md`

Debe incluir:

- Paleta.
- Cabello morado/lavanda.
- Acentos cyan.
- Ojos dorados.
- Motivos teatrales.
- Motivos de inventos/robots.
- Silueta alta/delgada.
- Ropa de inspiración teatral, no copia directa.

### `docs/research/voice-reference.md`

Debe incluir:

- Voz joven masculina teatral.
- Energía juguetona.
- Ritmo calmado a animado.
- No clonar voz oficial.
- Usar TTS permitido.

### `docs/research/dialogue-patterns.md`

Debe incluir:

- Metáforas teatrales.
- Referencias a escenario, función, acto, telón, clímax.
- Referencias a mecanismos, engranajes, experimentos.
- Tono cálido y motivador.
- Evitar copiar diálogos oficiales.

---

## 22. Criterios de aceptación

El trabajo se considera terminado cuando:

- `npm run build` funciona.
- `/` renderiza landing.
- `/companion` renderiza app.
- Chat funciona con respuestas mock.
- Botón de voz reproduce TTS del navegador.
- Escena 3D se muestra con placeholder.
- Si hay VRM privado, intenta cargarlo.
- Si no hay VRM, no crashea.
- `.gitignore` protege assets privados.
- README explica que no hay assets oficiales.
- Docs de research existen.
- No se suben assets oficiales, privados ni pesados.
- No se sube `node_modules`.
- No se sube `.next`.
- No se sube `.env`.

---

## 23. Próxima tarea concreta para Claude Code

Implementa el MVP descrito arriba.

Orden sugerido:

1. Revisar estructura actual.
2. Corregir `.env.example` para no usar `NODE_ENV=development`.
3. Crear `character-config.ts` y `character-prompt.ts`.
4. Crear Zustand store.
5. Crear landing `/`.
6. Crear `/companion`.
7. Crear componentes de avatar, chat y voz.
8. Crear API routes mock.
9. Crear docs research.
10. Actualizar README.
11. Ejecutar `npm run build`.
12. Si no puedes hacer push, generar ZIP.

---

## 24. Mensaje de commit sugerido

```txt
feat: initialize private Rui 3D companion MVP
```

Descripción:

```txt
- Add Next.js companion landing and 3D chat interface
- Add character config and theatrical prompt
- Add 3D avatar placeholder with VRM-ready structure
- Add browser TTS and voice/lipsync placeholders
- Add research docs with official and open-source references
- Protect private assets and environment files through gitignore
```
