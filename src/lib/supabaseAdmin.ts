import { createClient } from '@supabase/supabase-js'

// Este cliente SOLO se usa dentro de las API routes (carpeta
// src/app/api/**), que corren en el servidor de Vercel/Node.
// Nunca se importa desde un componente 'use client', así que
// la SUPABASE_SERVICE_ROLE_KEY no llega nunca al navegador.
//
// La service role key ignora las políticas de RLS, por eso la
// tabla `patrullas` tiene RLS activado sin políticas públicas:
// la única puerta de entrada es este cliente, desde el servidor.

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Faltan variables de entorno SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY. ' +
      'Configúralas en .env.local (desarrollo) o en Vercel > Settings > Environment Variables (producción).'
    )
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}
