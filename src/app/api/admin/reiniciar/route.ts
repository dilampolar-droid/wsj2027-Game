import { NextRequest, NextResponse } from 'next/server'
import { requiereAdmin } from '@/src/lib/authGuard'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const auth = await requiereAdmin(req)
  if ('error' in auth) return auth.error
  const { supabase } = auth

  const { error } = await supabase
    .from('patrullas')
    .update({
      nivel_actual: 1,
      puntos: 0,
      estado: 'sin_empezar',
      tiempo_inicio: null,
      tiempo_fin: null,
      intentos_nivel_actual: 0,
    })
    .neq('id', '00000000-0000-0000-0000-000000000000') // update masivo: afecta a todas las filas

  if (error) {
    console.error('Error al reiniciar partidas:', error)
    return NextResponse.json({ error: 'Error de servidor' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
