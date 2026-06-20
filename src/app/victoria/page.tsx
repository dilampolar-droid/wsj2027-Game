'use client'
import { useRouter } from 'next/navigation'
import { useSession } from '@/src/hooks/useSession'

export default function VictoriaPage() {
  const router = useRouter()
  const { patrulla } = useSession()

  const tiempo = patrulla?.tiempo_inicio && patrulla?.tiempo_fin
    ? Math.floor((new Date(patrulla.tiempo_fin).getTime() - new Date(patrulla.tiempo_inicio).getTime()) / 60000)
    : 0

  return (
    <div style={{
      maxWidth: '700px', margin: '0 auto', padding: '60px 20px', textAlign: 'center', color: '#e8e2d0'
    }}>
      <h1 style={{ fontSize: '3em', marginBottom: '20px' }}>⚜️</h1>
      <h1 style={{ color: '#c9a84c', fontSize: '2.5em', marginBottom: '10px' }}>¡GANARON!</h1>
      <p style={{ color: '#00d4aa', fontSize: '1.2em', marginBottom: '30px' }}>{patrulla?.nombre}</p>

      <div style={{ background: 'rgba(26, 46, 26, 0.6)', border: '1px solid rgba(201, 168, 76, 0.3)', padding: '30px', borderRadius: '8px', marginBottom: '30px' }}>
        <p style={{ marginBottom: '15px', fontSize: '1.1em' }}>Han completado los 12 enigmas.</p>
        {tiempo > 0 && <p style={{ color: '#00d4aa', fontSize: '1.3em', fontWeight: 'bold' }}>⏱ Tiempo: {tiempo} minutos</p>}
      </div>

      <button
        onClick={() => router.push('/')}
        style={{ background: '#c9a84c', color: '#0d1b2a', padding: '12px 30px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em', fontWeight: 'bold' }}
      >
        Volver al inicio
      </button>
    </div>
  )
}
