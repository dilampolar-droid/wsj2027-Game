import crypto from 'crypto'

export function sha256(texto: string): string {
  return crypto.createHash('sha256').update(texto).digest('hex')
}
