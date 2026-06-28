'use client'
import { createClient } from '@supabase/supabase-js'

// Este cliente SÍ se usa en el navegador (panel admin), pero
// solo con la clave pública "anon". Esa clave no puede leer ni
// escribir la tabla `patrullas` vía REST/PostgREST porque RLS
// está activado sin políticas — solo puede recibir eventos de
// Realtime (cambios fila por fila) una vez el admin ya se
// autenticó contra /api/admin/login.
//
// Es decir: el ranking en tiempo real llega por WebSocket
// (Supabase Realtime), pero los datos "de verdad" siempre se
// leen/escriben pasando por las API routes del servidor.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export function getSupabaseBrowser() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  return createClient(supabaseUrl, supabaseAnonKey)
}
