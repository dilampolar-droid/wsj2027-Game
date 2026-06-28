import { NextRequest, NextResponse } from 'next/server'
import { validarAdmin } from '@/src/lib/adminCredenciales'
import { firmarToken } from '@/src/lib/session'

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

  if (!validarAdmin(usuario, password)) {
    return NextResponse.json({ error: 'Credenciales incorrectas' }, { status: 401 })
  }

  const token = firmarToken({
    tipo: 'admin',
    usuario,
    exp: Date.now() + 4 * 60 * 60 * 1000, // sesión admin: 4 horas
  })

  return NextResponse.json({ token, usuario })
}
