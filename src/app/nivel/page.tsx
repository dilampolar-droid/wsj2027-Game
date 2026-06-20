'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getNivelByOrden } from '@/src/lib/supabase'
import { useSession } from '@/src/hooks/useSession'
import { LevelRenderer } from '@/src/components/levels/LevelRenderer'

export default function NivelPage() {
  const router = useRouter()
  const { patrulla, loading, advanceLevel } = useSession()

  const [currentNivel, setCurrentNivel] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!loading && !patrulla) {
      router.push('/')
      return
    }
    if (patrulla && !currentNivel) {
      const nivel = getNivelByOrden(patrulla.nivel_actual)
      if (nivel) {
        setCurrentNivel(nivel)
      }
    }
  }, [patrulla, loading, currentNivel, router])

  if (loading || !currentNivel || !patrulla) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#e8e2d0' }}>Cargando...</div>
  }

  const handleAnswer = (answer: string) => {
    setAttempts(a => a + 1)
    if (answer === currentNivel.url_respuesta) {
      setMessage('✅ ¡Respuesta correcta!')
      setTimeout(() => {
        const nextOrden = currentNivel.orden + 1
        if (nextOrden > 12) {
          router.push('/victoria')
        } else {
          advanceLevel(nextOrden)
          const nextNivel = getNivelByOrden(nextOrden)
          if (nextNivel) {
            setCurrentNivel(nextNivel)
            setMessage('')
            setAttempts(0)
          }
        }
      }, 1500)
    } else {
      setMessage(`❌ Respuesta incorrecta (Intento ${attempts + 1})`)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px', color: '#e8e2d0' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ color: '#c9a84c', marginBottom: '5px' }}>
          {patrulla.nombre}
        </h1>
        <p style={{ color: '#a8a8a8', fontSize: '0.9em' }}>
          Nivel {currentNivel.orden}/12 ⏱ Intento {attempts + 1}
        </p>
      </div>

      <LevelRenderer nivel={currentNivel} onAnswerSubmit={handleAnswer} />

      {message && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          background: message.includes('✅') ? 'rgba(0, 212, 170, 0.1)' : 'rgba(232, 93, 38, 0.1)',
          border: `1px solid ${message.includes('✅') ? '#00d4aa' : '#e85d26'}`,
          borderRadius: '4px',
          color: message.includes('✅') ? '#00d4aa' : '#e85d26',
          textAlign: 'center',
          fontWeight: 'bold'
        }}>
          {message}
        </div>
      )}
    </div>
  )
}
