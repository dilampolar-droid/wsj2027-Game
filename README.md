# 🏕️ WSJ 2027 - Scout Puzzle Game

Escape room de 12 enigmas progresivos para patrullas scout. App Next.js
con **backend en Supabase**: el progreso y el ranking viven en una base de
datos compartida, así que el panel admin ve en tiempo real a las 20
patrullas jugando desde 20 dispositivos distintos.

## 🩹 Qué se corrigió respecto a la versión anterior

1. **El juego no se podía completar.** Las respuestas se guardaban como
   texto plano (`respuesta: 'brujula'`) pero el código las comparaba
   contra un hash SHA-256 (`hashIngresado === nivel.respuesta`). Esa
   comparación nunca podía ser verdadera. Ahora las respuestas se
   verifican **en el servidor** (`/api/responder`), usando los hashes
   correctos definidos en `src/lib/niveles.ts`.
2. **El panel admin no se podía abrir.** Mismo error: las contraseñas de
   admin estaban en texto plano en un campo llamado `hash`. Corregido en
   `src/lib/adminCredenciales.ts` con los hashes SHA-256 reales.
3. **No había backend ni ranking entre dispositivos.** Todo vivía en
   `localStorage`, por lo que cada celular tenía su propia "realidad" y el
   admin solo veía patrullas que jugaron en su mismo navegador. Ahora hay
   una base de datos (Supabase) compartida, con actualizaciones en tiempo
   real vía WebSocket (Supabase Realtime).
4. **Login por código genérico → 20 credenciales reales.** Antes cualquier
   texto que terminara en `-2027` servía como código de patrulla. Ahora
   hay 20 cuentas reales (`patrulla1`...`patrulla20`) con su propia
   contraseña, ver `CREDENCIALES.md` (no incluido en git por seguridad).
5. **Nivel 7 se dejó igual a propósito** (vacío, pendiente de contenido),
   tal como se indicó.

## 🧱 Arquitectura

```
Navegador (patrulla)  ──HTTPS──▶  API routes (Next.js, en Vercel)  ──▶  Supabase (Postgres)
Navegador (admin)     ──HTTPS──▶  API routes (login/ranking)      ──▶  Supabase (Postgres)
Navegador (admin)     ──WebSocket (Realtime)──────────────────────▶  Supabase (escucha cambios)
```

- El navegador **nunca** habla directo con Supabase para leer/escribir
  datos del juego — todo pasa por las API routes del servidor, que usan
  la *service role key* (secreta, solo en variables de entorno).
- El navegador del admin sí escucha directamente los cambios de
  Supabase Realtime (con la *anon key*, pública pero de solo-suscripción:
  la tabla tiene RLS activado sin políticas, así que esa clave no puede
  leer ni escribir filas por su cuenta).
- El cronómetro de 45 minutos se calcula siempre a partir de
  `tiempo_inicio`, guardado en el servidor — no se puede hacer trampa
  cambiando la hora del celular.

## 🚀 Puesta en marcha (primera vez)

### 1. Crear el proyecto en Supabase (gratis)

1. Ve a [supabase.com](https://supabase.com) → crea una cuenta → "New Project".
2. Cuando esté listo, ve a **SQL Editor** (menú izquierdo).
3. Abre el archivo [`supabase/schema.sql`](./supabase/schema.sql) de este
   repo, copia **todo** su contenido, pégalo en el editor y pulsa **Run**.
   Esto crea la tabla `patrullas`, activa Realtime, y mete las 20
   credenciales de patrulla (ya hasheadas).
4. Ve a **Settings → API** y copia estos 3 valores, los necesitarás en el
   paso 3:
   - `Project URL` → será `SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key (⚠️ secreta) → será `SUPABASE_SERVICE_ROLE_KEY`

### 2. Arranque local

```bash
npm install
cp .env.local.example .env.local
# Edita .env.local y pega tus claves de Supabase + un SESSION_SECRET propio
npm run dev
```

Genera tu `SESSION_SECRET` con:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Abre http://localhost:3000 y entra con cualquiera de las 20 cuentas de
`CREDENCIALES.md` (ej. `patrulla1` / la contraseña que indique ese archivo).

### 3. Deploy en Vercel

1. Sube el código a un repositorio de GitHub (revisa que `.env.local`,
   `CREDENCIALES.md` y `node_modules` **no** se suban — ya están en
   `.gitignore`).
2. Entra en [vercel.com](https://vercel.com) → "Add New Project" → importa el repo.
3. En **Environment Variables**, añade las mismas 5 variables que pusiste
   en `.env.local` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`,
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SESSION_SECRET`).
4. Click "Deploy".

## 🔑 Panel admin

URL: `/admin`

| Usuario   | Contraseña     |
|-----------|----------------|
| admin1    | scout2027      |
| admin2    | jamboree2027   |
| director  | gdansk2027     |
| juez      | enigma2027     |

**Importante:** cambia estas contraseñas antes del evento real (ver
sección siguiente).

## 🔑 Credenciales de patrulla

Las 20 cuentas (`patrulla1`...`patrulla20`) están en `CREDENCIALES.md`
(no se sube a git). Cada patrulla entra desde su propio celular/tablet con
su usuario y contraseña — el progreso vive en el servidor, así que pueden
cambiar de dispositivo o recargar la página sin perder nada.

## ✏️ Cómo cambiar las contraseñas/respuestas

### Respuestas de los niveles
Las respuestas se verifican con hashes SHA-256 en el servidor, nunca en
texto plano:
```bash
node -e "console.log(require('crypto').createHash('sha256').update('tu-nueva-respuesta-en-minusculas-sin-espacios').digest('hex'))"
```
Sustituye el resultado en `src/lib/niveles.ts`, campo `respuestaHash` del
nivel correspondiente.

### Contraseñas de admin
Mismo procedimiento, pero sobre `src/lib/adminCredenciales.ts`.

### Contraseñas de patrulla
Estas usan bcrypt (más lento de "romper" por fuerza bruta que SHA-256, y
es buena práctica para contraseñas de personas):
```bash
node -e "const bcrypt=require('bcryptjs'); console.log(bcrypt.hashSync('NUEVA-CONTRASEÑA', 10))"
```
Copia el resultado y actualízalo en Supabase: tabla `patrullas` → columna
`password_hash` → fila de esa patrulla. (Tabla → "Table Editor" en el
panel de Supabase, no hace falta SQL para esto.)

## 🧩 Cómo funciona el juego

- 12 niveles con acertijos (criptografía, historia scout, lógica). El
  **nivel 7 está vacío a propósito**, pendiente de contenido.
- Cronómetro de 45 minutos por patrulla, controlado por el servidor.
- Sistema de puntos: 1000 pts por nivel + 500 pts extra si se responde en
  menos de 2 minutos desde que empezó la partida.
- Si recargas la página o cambias de dispositivo a mitad de partida, el
  progreso se recupera automáticamente (vive en la base de datos).
- El panel admin muestra el ranking de las 20 patrullas en tiempo real,
  sin importar desde qué dispositivo esté jugando cada una.

## 📁 Estructura

```
src/
├── app/
│   ├── page.tsx                  ← Login de patrulla + los 12 niveles
│   ├── admin/page.tsx            ← Dashboard de administración + ranking en vivo
│   ├── layout.tsx
│   └── api/
│       ├── login/route.ts            ← Login de patrulla
│       ├── estado/route.ts            ← Recuperar progreso al recargar
│       ├── responder/route.ts         ← Verificar respuesta de un nivel
│       └── admin/
│           ├── login/route.ts         ← Login de admin
│           ├── ranking/route.ts       ← Ranking completo (para el admin)
│           └── reiniciar/route.ts     ← Botón "reiniciar partidas"
├── lib/
│   ├── niveles.ts             ← Los 12 enigmas + hashes de respuesta
│   ├── adminCredenciales.ts   ← Credenciales de admin (hasheadas)
│   ├── hash.ts                ← SHA-256 (servidor)
│   ├── session.ts             ← Tokens de sesión firmados
│   ├── authGuard.ts           ← Middleware de autenticación para las API routes
│   ├── supabaseAdmin.ts       ← Cliente Supabase (servidor, service role key)
│   └── supabaseBrowser.ts     ← Cliente Supabase (navegador, solo Realtime)
└── styles/globals.css

supabase/schema.sql        ← Esquema SQL completo + seed de las 20 patrullas
CREDENCIALES.md            ← Usuario/contraseña en texto plano (NO en git)
.env.local.example         ← Plantilla de variables de entorno
```

## ⚠️ Antes del evento real

- Cambia las contraseñas de admin y, si quieres, las de las 20 patrullas.
- Completa el contenido del **nivel 7**.
- Ejecuta "🔄 Reiniciar Partidas" desde el panel admin justo antes de
  empezar, para que las 20 patrullas arranquen desde el nivel 1 con 0
  puntos.
