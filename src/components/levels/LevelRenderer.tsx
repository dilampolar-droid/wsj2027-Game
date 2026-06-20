'use client'
import { Nivel } from '@/src/lib/supabase'

interface Props {
  nivel: Nivel
  onAnswerSubmit: (answer: string) => void
}

export function LevelRenderer({ nivel, onAnswerSubmit }: Props) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const input = (e.target as HTMLInputElement).value.toLowerCase()
      onAnswerSubmit(input)
    }
  }

  return (
    <div style={{ background: 'rgba(26, 46, 26, 0.6)', padding: '30px', borderRadius: '8px', marginTop: '20px' }}>
      <h2 style={{ color: '#c9a84c', marginBottom: '15px' }}>{nivel.titulo}</h2>
      <p style={{ color: '#e8e2d0', marginBottom: '20px', fontSize: '1.1em' }}>{nivel.descripcion}</p>

      {nivel.pista && (
        <div style={{ background: 'rgba(201, 168, 76, 0.1)', padding: '15px', borderRadius: '4px', marginBottom: '20px', borderLeft: '4px solid #c9a84c' }}>
          <strong style={{ color: '#c9a84c' }}>💡 Pista:</strong>
          <p style={{ color: '#e8e2d0', marginTop: '8px' }}>{nivel.pista}</p>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#c9a84c', fontSize: '0.9em', textTransform: 'uppercase' }}>
          Tu respuesta (URL):
        </label>
        <input
          type="text"
          placeholder={`/nivel/${nivel.url_respuesta}`}
          onKeyPress={handleKeyPress}
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
          Escribe la URL de la siguiente página y presiona Enter
        </p>
      </div>
    </div>
  )
}
