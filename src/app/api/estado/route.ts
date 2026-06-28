import { NextRequest, NextResponse } from 'next/server'
import { requierePatrulla } from '@/src/lib/authGuard'
import { TIEMPO_LIMITE_SEGUNDOS } from '@/src/lib/niveles'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requierePatrulla(req)
  if ('error' in auth) return auth.error
  const { patrulla, supabase } = auth

  // Si el cronómetro (calculado en servidor) ya llegó a 0 pero el
  // estado en la base de datos todavía dice "jugando", lo cerramos aquí.
  if (patrulla.estado === 'jugando' && patrulla.tiempo_inicio) {
    const transcurrido = Math.floor((Date.now() - new Date(patrulla.tiempo_inicio).getTime()) / 1000)
    if (transcurrido >= TIEMPO_LIMITE_SEGUNDOS) {
      await supabase
        .from('patrullas')
        .update({ estado: 'tiempo_agotado', tiempo_fin: new Date().toISOString() })
        .eq('id', patrulla.id)
      patrulla.estado = 'tiempo_agotado'
    }
  }

  return NextResponse.json({
    patrulla: {
      usuario: patrulla.usuario,
      nombrePatrulla: patrulla.nombre_patrulla,
      nivelActual: patrulla.nivel_actual,
      puntos: patrulla.puntos,
      estado: patrulla.estado,
      tiempoInicio: patrulla.tiempo_inicio,
      intentosNivelActual: patrulla.intentos_nivel_actual,
    },
  })
}
