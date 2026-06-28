import crypto from 'crypto'

// Tokens de sesión simples, firmados con HMAC-SHA256.
//
// No usamos cookies de servidor con almacenamiento de sesión
// porque el juego es muy corto (45 min) y stateless es más
// simple de desplegar. El token contiene quién es (usuario/rol)
// y cuándo expira; va firmado para que nadie pueda fabricarse
// uno sin conocer el SESSION_SECRET (que vive solo en el
// servidor). El navegador lo guarda en localStorage y lo envía
// en la cabecera Authorization de cada petición a /api/*.
//
// Esto NO es para reemplazar la contraseña: la contraseña se
// verifica una sola vez en /api/login contra el hash bcrypt
// guardado en Supabase. El token es solo el "pase" que se usa
// después, para no reenviar la contraseña en cada respuesta.

interface PayloadBase {
  exp: number // timestamp ms de expiración
}

export interface PatrullaTokenPayload extends PayloadBase {
  tipo: 'patrulla'
  usuario: string
}

export interface AdminTokenPayload extends PayloadBase {
  tipo: 'admin'
  usuario: string
}

export type TokenPayload = PatrullaTokenPayload | AdminTokenPayload

function getSecret(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error('Falta la variable de entorno SESSION_SECRET')
  }
  return secret
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

export function firmarToken(payload: TokenPayload): string {
  const body = base64url(JSON.stringify(payload))
  const firma = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url')
  return `${body}.${firma}`
}

export function verificarToken(token: string | null | undefined): TokenPayload | null {
  if (!token) return null
  const partes = token.split('.')
  if (partes.length !== 2) return null
  const [body, firma] = partes
  const firmaEsperada = crypto.createHmac('sha256', getSecret()).update(body).digest('base64url')
  // Comparación en tiempo constante para evitar timing attacks
  const a = Buffer.from(firma)
  const b = Buffer.from(firmaEsperada)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null

  try {
    const payload: TokenPayload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (!payload.exp || Date.now() > payload.exp) return null
    return payload
  } catch {
    return null
  }
}

export function extraerToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  const [tipo, token] = authHeader.split(' ')
  if (tipo !== 'Bearer' || !token) return null
  return token
}
