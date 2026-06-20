'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getNivelByOrden } from '@/src/lib/supabase'

export default function Level1Page() {
  const router = useRouter()
  const [patrulla, setPatrulla] = useState<any>(null)
  const [currentNivel, setCurrentNivel] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [answer, setAnswer] = useState('')

  useEffect(() => {
    // Leer patrulla del localStorage
    const stored = localStorage.getItem('wsj2027_patrulla')
    if (!stored) {
      router.push('/')
      return
    }
    
    const p = JSON.parse(stored)
    setPatrulla(p)
    
    const nivel = getNivelByOrden(1)
    if (nivel) {
      setCurrentNivel(nivel)
    }
  }, [router])

  if (!patrulla || !currentNivel) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#e8e2d0' }}>Cargando...</div>
  }

  const handleAnswer = (e: React.FormEvent) => {
    e.preventDefault()
    setAttempts(a => a + 1)

    if (answer.toLowerCase() === currentNivel.url_respuesta) {
      setMessage('✅ ¡Respuesta correcta!')
      setTimeout(() => {
        localStorage.setItem('wsj2027_patrulla', JSON.stringify({
          ...patrulla,
          nivel_actual: 2
        }))
        router.push('/nivel/cracovia')
      }, 1500)
    } else {
      setMessage(`❌ Respuesta incorrecta (Intento ${attempts + 1})`)
      setAnswer('')
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

      <div style={{ background: 'rgba(26, 46, 26, 0.6)', padding: '30px', borderRadius: '8px', marginTop: '20px' }}>
        <h2 style={{ color: '#c9a84c', marginBottom: '15px' }}>{currentNivel.titulo}</h2>
        <p style={{ color: '#e8e2d0', marginBottom: '20px', fontSize: '1.1em' }}>{currentNivel.descripcion}</p>

        {currentNivel.pista && (
          <div style={{ background: 'rgba(201, 168, 76, 0.1)', padding: '15px', borderRadius: '4px', marginBottom: '20px', borderLeft: '4px solid #c9a84c' }}>
            <strong style={{ color: '#c9a84c' }}>💡 Pista:</strong>
            <p style={{ color: '#e8e2d0', marginTop: '8px' }}>{currentNivel.pista}</p>
          </div>
        )}

        <form onSubmit={handleAnswer}>
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#c9a84c', fontSize: '0.9em', textTransform: 'uppercase' }}>
              Tu respuesta:
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={`Ej: ${currentNivel.url_respuesta}`}
              style={{
                background: '#1a2e1a',
                border: '1px solid #3a5c3a',
                color: '#00d4aa',
                padding: '12px',
                borderRadius: '4px',
                width: '100%',
                fontFamily: 'monospace',
                fontSize: '1em',
              }}
              autoFocus
            />
            <p style={{ color: '#a8a8a8', fontSize: '0.85em', marginTop: '8px' }}>
              Presiona Enter o haz click en Enviar
            </p>
          </div>

          <button
            type="submit"
            style={{
              background: '#c9a84c',
              color: '#0d1b2a',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginTop: '15px',
              width: '100%'
            }}
          >
            Enviar respuesta
          </button>
        </form>
      </div>

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
