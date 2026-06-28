import { NextRequest, NextResponse } from 'next/server'
import { extraerToken, verificarToken } from './session'
import { getSupabaseAdmin } from './supabaseAdmin'

export async function requierePatrulla(req: NextRequest) {
  const token = extraerToken(req.headers.get('authorization'))
  const payload = verificarToken(token)

  if (!payload || payload.tipo !== 'patrulla') {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) } as const
  }

  const supabase = getSupabaseAdmin()
  const { data: patrulla, error } = await supabase
    .from('patrullas')
    .select('*')
    .eq('usuario', payload.usuario)
    .maybeSingle()

  if (error || !patrulla) {
    return { error: NextResponse.json({ error: 'Sesión inválida' }, { status: 401 }) } as const
  }

  return { patrulla, supabase } as const
}

export async function requiereAdmin(req: NextRequest) {
  const token = extraerToken(req.headers.get('authorization'))
  const payload = verificarToken(token)

  if (!payload || payload.tipo !== 'admin') {
    return { error: NextResponse.json({ error: 'No autenticado' }, { status: 401 }) } as const
  }

  return { usuario: payload.usuario, supabase: getSupabaseAdmin() } as const
}
