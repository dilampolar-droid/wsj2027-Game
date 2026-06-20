# 🚀 DEPLOY EN VERCEL (Paso 4)

## ¿Por qué Vercel?
- Gratis para proyectos Next.js
- Despliega en 1 minuto
- Actualización automática desde GitHub
- SSL incluido

## Pasos:

### 1. Crear repositorio GitHub
```bash
git init
git add .
git commit -m "WSJ 2027 - Puzzle Game"
git branch -M main
git remote add origin https://github.com/tu-usuario/wsj2027.git
git push -u origin main
```

### 2. Ir a Vercel
- Ve a https://vercel.com
- Click "Sign Up" → conecta tu GitHub
- Click "Import Project"
- Selecciona el repositorio wsj2027

### 3. Variables de entorno
En Vercel, ve a **Settings → Environment Variables**

Agrega:
```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
ADMIN_PASSWORD=tu-password-segura
```

### 4. Deploy
Click "Deploy"

¡Listo! Tu proyecto estará en: `https://wsj2027.vercel.app`

---

## URL Lista para el evento

Comparte con las 20 patrullas:
```
https://wsj2027.vercel.app
```

Código admin:
```
https://wsj2027.vercel.app/admin
Password: [la que hayas puesto]
```
