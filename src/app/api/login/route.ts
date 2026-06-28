import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSupabaseAdmin } from '@/src/lib/supabaseAdmin'
import { firmarToken } from '@/src/lib/session'
import { TIEMPO_LIMITE_SEGUNDOS } from '@/src/lib/niveles'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  let body: { usuario?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 })
  }

  const usuario = (body.usuario || '').trim().toLowerCase()
  const password = body.password || ''

  if (!usuario || !password) {
    return NextResponse.json({ error: 'Usuario y contraseña son obligatorios' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()
  const { data: patrulla, error } = await supabase
    .from('patrullas')
    .select('*')
    .eq('usuario', usuario)
    .maybeSingle()

  if (error) {
    console.error('Error Supabase en /api/login:', error)
    return NextResponse.json({ error: 'Error de servidor' }, { status: 500 })
  }

  if (!patrulla) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
  }

  const passwordOk = await bcrypt.compare(password, patrulla.password_hash)
  if (!passwordOk) {
    return NextResponse.json({ error: 'Usuario o contraseña incorrectos' }, { status: 401 })
  }

  const ahora = new Date()

  // Si la partida ya terminó (completada o tiempo agotado), no se puede volver a entrar.
  if (patrulla.estado === 'completado' || patrulla.estado === 'tiempo_agotado') {
    return NextResponse.json(
      { error: 'Esta patrulla ya finalizó su partida.', estado: patrulla.estado, puntos: patrulla.puntos },
      { status: 409 }
    )
  }

  let tiempoInicio = patrulla.tiempo_inicio
  let nivelActual = patrulla.nivel_actual
  let puntos = patrulla.puntos
  let estado = patrulla.estado

  if (!tiempoInicio) {
    // Primera vez que esta patrulla entra: arranca su cronómetro de 45 min.
    tiempoInicio = ahora.toISOString()
    estado = 'jugando'
    const { error: updateError } = await supabase
      .from('patrullas')
      .update({ tiempo_inicio: tiempoInicio, estado })
      .eq('id', patrulla.id)
    if (updateError) {
      console.error('Error al iniciar cronómetro:', updateError)
      return NextResponse.json({ error: 'Error de servidor' }, { status: 500 })
    }
  } else {
    // Ya había empezado antes (reload de página): comprobamos si se le acabó el tiempo
    // mientras estaba desconectada.
    const transcurrido = Math.floor((ahora.getTime() - new Date(tiempoInicio).getTime()) / 1000)
    if (transcurrido >= TIEMPO_LIMITE_SEGUNDOS && estado === 'jugando') {
      estado = 'tiempo_agotado'
      await supabase
        .from('patrullas')
        .update({ estado, tiempo_fin: ahora.toISOString() })
        .eq('id', patrulla.id)
      return NextResponse.json(
        { error: 'Esta patrulla ya gastó su tiempo (45 min).', estado, puntos },
        { status: 409 }
      )
    }
  }

  const token = firmarToken({
    tipo: 'patrulla',
    usuario: patrulla.usuario,
    exp: Date.now() + TIEMPO_LIMITE_SEGUNDOS * 1000 + 5 * 60 * 1000, // margen de 5 min extra
  })

  return NextResponse.json({
    token,
    patrulla: {
      usuario: patrulla.usuario,
      nombrePatrulla: patrulla.nombre_patrulla,
      nivelActual,
      puntos,
      estado,
      tiempoInicio,
      intentosNivelActual: patrulla.intentos_nivel_actual,
    },
  })
}
