import { NextRequest, NextResponse } from 'next/server'
import { requiereAdmin } from '@/src/lib/authGuard'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requiereAdmin(req)
  if ('error' in auth) return auth.error
  const { supabase } = auth

  const { data, error } = await supabase
    .from('patrullas')
    .select('usuario, nombre_patrulla, nivel_actual, puntos, estado, tiempo_inicio, tiempo_fin, updated_at')
    .order('puntos', { ascending: false })
    .order('updated_at', { ascending: true })

  if (error) {
    console.error('Error al leer ranking:', error)
    return NextResponse.json({ error: 'Error de servidor' }, { status: 500 })
  }

  return NextResponse.json({ patrullas: data })
}
