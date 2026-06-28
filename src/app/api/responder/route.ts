import { NextRequest, NextResponse } from 'next/server'
import { requierePatrulla } from '@/src/lib/authGuard'
import { sha256 } from '@/src/lib/hash'
import {
  NIVELES,
  normalizarRespuesta,
  PUNTOS_POR_NIVEL,
  TIEMPO_BONUS_SEGUNDOS,
  TIEMPO_LIMITE_SEGUNDOS,
} from '@/src/lib/niveles'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const auth = await requierePatrulla(req)
  if ('error' in auth) return auth.error
  const { patrulla, supabase } = auth

  let body: { respuesta?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Petición inválida' }, { status: 400 })
  }

  if (patrulla.estado !== 'jugando') {
    return NextResponse.json({ error: 'La partida no está activa' }, { status: 409 })
  }

  // Comprobar si el tiempo ya se agotó (cronómetro vive en el servidor,
  // basado en tiempo_inicio, no en lo que diga el navegador del jugador).
  const ahora = Date.now()
  const inicioMs = new Date(patrulla.tiempo_inicio).getTime()
  const transcurridoTotal = Math.floor((ahora - inicioMs) / 1000)

  if (transcurridoTotal >= TIEMPO_LIMITE_SEGUNDOS) {
    await supabase
      .from('patrullas')
      .update({ estado: 'tiempo_agotado', tiempo_fin: new Date(ahora).toISOString() })
      .eq('id', patrulla.id)
    return NextResponse.json(
      { error: 'Tiempo agotado', estado: 'tiempo_agotado', puntos: patrulla.puntos },
      { status: 409 }
    )
  }

  const nivelActual = NIVELES[patrulla.nivel_actual - 1]
  if (!nivelActual) {
    return NextResponse.json({ error: 'Nivel inválido' }, { status: 400 })
  }

  const respuestaTexto = (body.respuesta || '')
  const hashIngresado = sha256(normalizarRespuesta(respuestaTexto))
  const esCorrecta = nivelActual.respuestaHash !== '' && hashIngresado === nivelActual.respuestaHash

  if (!esCorrecta) {
    const nuevosIntentos = patrulla.intentos_nivel_actual + 1
    await supabase
      .from('patrullas')
      .update({ intentos_nivel_actual: nuevosIntentos })
      .eq('id', patrulla.id)
    return NextResponse.json({ correcto: false, intentos: nuevosIntentos })
  }

  // Respuesta correcta: calcular puntos (bonus si fue rápido) y avanzar nivel.
  const tiempoEnNivel = transcurridoTotal // aproximación simple: igual que en la versión original
  const puntosNivel = tiempoEnNivel < TIEMPO_BONUS_SEGUNDOS ? PUNTOS_POR_NIVEL + 500 : PUNTOS_POR_NIVEL
  const nuevosPuntos = patrulla.puntos + puntosNivel
  const esUltimoNivel = patrulla.nivel_actual === NIVELES.length
  const siguienteNivel = esUltimoNivel ? patrulla.nivel_actual : patrulla.nivel_actual + 1

  const updatePayload: Record<string, unknown> = {
    puntos: nuevosPuntos,
    nivel_actual: siguienteNivel,
    intentos_nivel_actual: 0,
  }

  if (esUltimoNivel) {
    updatePayload.estado = 'completado'
    updatePayload.tiempo_fin = new Date(ahora).toISOString()
  }

  const { error: updateError } = await supabase
    .from('patrullas')
    .update(updatePayload)
    .eq('id', patrulla.id)

  if (updateError) {
    console.error('Error al guardar progreso:', updateError)
    return NextResponse.json({ error: 'Error de servidor' }, { status: 500 })
  }

  return NextResponse.json({
    correcto: true,
    puntosGanados: puntosNivel,
    puntosTotales: nuevosPuntos,
    siguienteNivel,
    completado: esUltimoNivel,
  })
}
