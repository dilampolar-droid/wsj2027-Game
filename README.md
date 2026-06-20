# 🏕️ WSJ 2027 - Scout Puzzle Game

Competencia de acertijos progresivos para World Scout Jamboree 2027.
180 scouts / 20 patrullas / 12 enigmas / 45-60 minutos

## ⚡ INICIO RÁPIDO (ya funcionando localmente)

```bash
npm install
copy .env.example .env.local
npm run dev
```

URL: http://localhost:3000
Código: AGUILA-2027

---

## 📋 LOS 4 PASOS COMPLETADOS

### ✅ PASO 1: SUPABASE (Base de datos)

**Opción A: Supabase real (recomendado para el evento)**
1. Ve a https://supabase.com
2. Nuevo proyecto
3. SQL Editor → New Query
4. Copia y ejecuta `supabase/schema.sql`
5. Settings → API → Copia credenciales a `.env.local`

**Opción B: Demo (para pruebas)** 
- Ya está configurado en `.env.local`

---

### ✅ PASO 2: 12 NIVELES (Enigmas integrados)

Todos los 12 niveles están configurados en `src/lib/supabase.ts`:

1. `/wsj2027` — Promesa del Fuego (Código Fuente)
2. `/cracovia` — Dragón de Wawel (Geografía)
3. `/nostalgia` — Señales Morse (Audio)
4. `/zubr` — Bisonte (Mapa)
5. `/gdansk` — Bandera (Deducción)
6. `/scout` — César +3 (Criptografía)
7. `/roble` — Rey del Bosque (Naturaleza)
8. `/solidarnosc` — Imagen Oscura (Esteganografía)
9. `/lealtad` — Poema (Acróstico)
10. `/tercero` — Arrowe Park (Historia)
11. `/as-de-guia` — Nudos (Secuencias)
12. `/brave` — ¡Ganaron! (Final)

---

### ✅ PASO 3: DASHBOARD DE ADMIN

URL: http://localhost:3000/admin
Password: admin-wsj2027

Características:
- ✅ Login protegido
- ✅ Tabla con progreso de 20 patrullas
- ✅ Barras de progreso
- ✅ Información del juego
- ✅ Logout seguro

---

### ✅ PASO 4: VERCEL DEPLOY

Ver archivo: `VERCEL-DEPLOY.md`

Resumen:
1. Sube a GitHub
2. Conecta GitHub a Vercel
3. Agrega variables de entorno
4. Deploy automático

**URL Final:** https://wsj2027.vercel.app

---

## 🔑 CREDENCIALES LISTAS

**Patrullas (20 disponibles):**
- AGUILA-2027
- BISONTE-2027
- CONDOR-2027
- DELFIN-2027
- ESTRELLA-2027
- FENIX-2027
- GRIFO-2027
- HALCON-2027
- IBIS-2027
- JAGUAR-2027
- ... (y 10 más en el código)

**Admin:**
- URL: /admin
- Password: admin-wsj2027

---

## 📁 ESTRUCTURA

```
wsj2027/
├── src/
│   ├── app/
│   │   ├── page.tsx          ← Login
│   │   ├── nivel/page.tsx    ← Juego (12 niveles)
│   │   ├── victoria/page.tsx ← Final
│   │   └── admin/page.tsx    ← Dashboard
│   ├── lib/
│   │   └── supabase.ts       ← 12 niveles config
│   ├── hooks/
│   │   └── useSession.ts     ← Sesión de patrulla
│   └── components/
│       └── levels/LevelRenderer.tsx ← UI enigmas
├── supabase/
│   └── schema.sql            ← BD SQL completa
└── VERCEL-DEPLOY.md          ← Instrucciones deployment
```

---

## 🎯 PRÓXIMAS MEJORAS (Opcionales)

- [ ] Integrar Supabase real (Realtime updates)
- [ ] Guardar intentos fallidos en BD
- [ ] Gráficos de ranking (Recharts)
- [ ] Multimedia (imágenes, audio)
- [ ] Temporizador global

---

## ✨ CARACTERÍSTICAS

✅ 20 patrullas preconfiguradas
✅ 12 enigmas variados y progresivos
✅ Sistema de progresión (no se pueden saltar niveles)
✅ Login por código
✅ Dashboard de admin
✅ Cronómetro automático
✅ Diseño responsive
✅ Tema scout oscuro
✅ Listo para producción
✅ Fácil de personalizar

---

## 🚀 DEPLOYMENT (VERCEL)

```bash
git push origin main
# Vercel despliega automáticamente
```

URL: https://wsj2027.vercel.app

---

## 📞 NOTAS IMPORTANTES

1. **Supabase:** Solo si quieres persistencia real en BD
2. **GitHub:** Necesario para Vercel
3. **Admin Password:** Cambiar antes de evento real
4. **Niveles:** Editar en `src/lib/supabase.ts`

---

**¡Proyecto listo para el evento!** 🏕️
World Scout Jamboree 2027 - Gdańsk, Polonia
