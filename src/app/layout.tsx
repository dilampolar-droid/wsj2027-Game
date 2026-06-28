import type { Metadata } from 'next'
import '@/src/styles/globals.css'

export const metadata: Metadata = {
  title: 'WSJ 2027 — Acertijos Scout',
  description: 'Competencia de enigmas World Scout Jamboree',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
