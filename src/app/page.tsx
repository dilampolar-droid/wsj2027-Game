'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { NIVELES, TIEMPO_LIMITE_SEGUNDOS } from '@/src/lib/niveles'

const TOKEN_KEY = 'wsj2027_token'

type Estado = 'sin_empezar' | 'jugando' | 'completado' | 'tiempo_agotado'

interface PatrullaState {
  usuario: string
  nombrePatrulla: string
  nivelActual: number // 1..12
  puntos: number
  estado: Estado
  tiempoInicio: string | null
  intentosNivelActual: number
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(path, { ...options, headers, cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Error de servidor') as Error & { status?: number; data?: any }
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export default function Home() {
  const [screen, setScreen] = useState<'login' | 'game'>('login')
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [cargandoLogin, setCargandoLogin] = useState(false)

  const [patrulla, setPatrulla] = useState<PatrullaState | null>(null)
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [pistaVisible, setPistaVisible] = useState(false)
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_LIMITE_SEGUNDOS)
  const [verificando, setVerificando] = useState(false)
  const [finalizando, setFinalizando] = useState(false)

  const patrullaRef = useRef(patrulla)
  patrullaRef.current = patrulla

  const cerrarPartida = useCallback((titulo: string, detalle: string) => {
    localStorage.removeItem(TOKEN_KEY)
    setMessage('')
    setScreen('login')
    setUsuario('')
    setPassword('')
    setPatrulla(null)
    setAnswer('')
    alert(`${titulo}\n\n${detalle}`)
  }, [])

  // Al cargar la página, si hay un token guardado, recuperamos el estado desde el servidor
  // (esto es lo que permite "recargar la página a mitad de partida sin perder progreso",
  // pero ahora el progreso vive en el backend, no en localStorage del dispositivo).
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return
    apiFetch('/api/estado')
      .then((data) => {
        if (data.patrulla.estado === 'completado' || data.patrulla.estado === 'tiempo_agotado') {
          localStorage.removeItem(TOKEN_KEY)
          return
        }
        setPatrulla(data.patrulla)
        setScreen('game')
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
      })
  }, [])

  // Cronómetro: puramente visual. La verdad sobre si el tiempo se acabó la decide
  // siempre el servidor (con tiempo_inicio), nunca el reloj del navegador del jugador.
  useEffect(() => {
    if (screen !== 'game' || !patrulla?.tiempoInicio || finalizando) return

    const calcularRestante = () => {
      const transcurrido = Math.floor((Date.now() - new Date(patrulla.tiempoInicio as string).getTime()) / 1000)
      return Math.max(0, TIEMPO_LIMITE_SEGUNDOS - transcurrido)
    }

    setTiempoRestante(calcularRestante())

    const interval = setInterval(async () => {
      const restante = calcularRestante()
      setTiempoRestante(restante)

      if (restante <= 0) {
        clearInterval(interval)
        setFinalizando(true)
        try {
          const data = await apiFetch('/api/estado')
          cerrarPartida('⏰ ¡TIEMPO AGOTADO!', `Puntuación final: ${data.patrulla.puntos} pts`)
        } catch {
          cerrarPartida('⏰ ¡TIEMPO AGOTADO!', `Puntuación final: ${patrullaRef.current?.puntos ?? 0} pts`)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [screen, patrulla?.tiempoInicio, finalizando, cerrarPartida])

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    if (!usuario.trim() || !password) {
      setLoginError('Usuario y contraseña son obligatorios')
      return
    }

    setCargandoLogin(true)
    try {
      const data = await apiFetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ usuario: usuario.trim(), password }),
      })
      localStorage.setItem(TOKEN_KEY, data.token)
      setPatrulla(data.patrulla)
      setAnswer('')
      setMessage('')
      setPistaVisible(false)
      setScreen('game')
    } catch (err: any) {
      setLoginError(err.message || 'No se pudo iniciar sesión')
    } finally {
      setCargandoLogin(false)
    }
  }

  const responder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (verificando || !patrulla) return
    setVerificando(true)

    try {
      const data = await apiFetch('/api/responder', {
        method: 'POST',
        body: JSON.stringify({ respuesta: answer }),
      })

      if (!data.correcto) {
        setMessage(`❌ Intento ${data.intentos} - Incorrecto`)
        setAnswer('')
        setPatrulla((p) => (p ? { ...p, intentosNivelActual: data.intentos } : p))
        setVerificando(false)
        return
      }

      setMessage(`✅ ¡CORRECTO! +${data.puntosGanados} pts`)

      if (data.completado) {
        setTimeout(() => {
          cerrarPartida('🏆 ¡¡¡ FIN !!!', `${patrulla.nombrePatrulla}\nPuntuación Final: ${data.puntosTotales} puntos\n\n¡FELICIDADES! ⚜️`)
        }, 800)
        return
      }

      setTimeout(() => {
        setPatrulla((p) =>
          p
            ? {
                ...p,
                nivelActual: data.siguienteNivel,
                puntos: data.puntosTotales,
                intentosNivelActual: 0,
              }
            : p
        )
        setAnswer('')
        setMessage('')
        setPistaVisible(false)
        setVerificando(false)
      }, 1500)
    } catch (err: any) {
      if (err.status === 409 && err.data?.estado === 'tiempo_agotado') {
        cerrarPartida('⏰ ¡TIEMPO AGOTADO!', `Puntuación final: ${err.data.puntos ?? patrulla.puntos} pts`)
        return
      }
      setMessage('⚠️ Error al verificar la respuesta. Intenta de nuevo.')
      setVerificando(false)
    }
  }

  const formatoTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${mins}:${segs.toString().padStart(2, '0')}`
  }

  if (screen === 'login' || !patrulla) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '3em', color: '#c9a84c', marginBottom: '10px', textShadow: '0 0 10px rgba(201, 168, 76, 0.5)' }}>🏕️ WSJ 2027</h1>
          <p style={{ color: '#00d4aa', fontSize: '1.1em', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '10px' }}>Escape Room Scout</p>
          <p style={{ color: '#a8a8a8', fontSize: '0.9em' }}>12 Enigmas • Criptografía • Historia Scout • 45 minutos • Sistema de Puntos</p>
        </div>

        <div style={{ background: 'rgba(26, 46, 26, 0.8)', border: '2px solid #c9a84c', padding: '40px', borderRadius: '8px', boxShadow: '0 0 20px rgba(201, 168, 76, 0.2)' }}>
          <form onSubmit={login}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#c9a84c', fontSize: '0.95em', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>🔐 Usuario de Patrulla</label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => { setUsuario(e.target.value); setLoginError('') }}
                placeholder="Nombre de tu Patrulla"
                style={{ background: '#0d1b2a', border: '2px solid #3a5c3a', color: '#00d4aa', padding: '14px', borderRadius: '4px', width: '100%', fontSize: '1.1em', fontFamily: 'monospace', fontWeight: 'bold' }}
                autoFocus
                autoComplete="username"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', color: '#c9a84c', fontSize: '0.95em', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>🔑 Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError('') }}
                placeholder="••••••"
                style={{ background: '#0d1b2a', border: '2px solid #3a5c3a', color: '#00d4aa', padding: '14px', borderRadius: '4px', width: '100%', fontSize: '1.1em', fontFamily: 'monospace', fontWeight: 'bold' }}
                autoComplete="current-password"
              />
            </div>

            {loginError && <p style={{ color: '#e85d26', marginBottom: '15px', fontSize: '0.9em' }}>⚠️ {loginError}</p>}

            <button
              type="submit"
              disabled={cargandoLogin}
              style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0d1b2a', padding: '14px', border: 'none', borderRadius: '4px', width: '100%', fontSize: '1.1em', fontWeight: 'bold', cursor: cargandoLogin ? 'default' : 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 15px rgba(201, 168, 76, 0.3)', opacity: cargandoLogin ? 0.7 : 1 }}
            >
              {cargandoLogin ? '⏳ Entrando...' : '🔓 ENTRAR AL ESCAPE ROOM'}
            </button>
          </form>

          <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(201, 168, 76, 0.1)', borderRadius: '4px', textAlign: 'center' }}>
            <p style={{ color: '#c9a84c', fontSize: '0.85em' }}>⏱️ Tiempo: 45 minutos | 12 Enigmas | Sistema de Puntos</p>
          </div>

          <div style={{ marginTop: '15px', textAlign: 'center' }}>
            <a href="/admin" style={{ color: '#c9a84c', textDecoration: 'none', fontSize: '0.85em', opacity: 0.6 }}>Panel de admin</a>
          </div>
        </div>
      </div>
    )
  }

  const nivel = NIVELES[patrulla.nivelActual - 1]
  const progreso = Math.round((patrulla.nivelActual / NIVELES.length) * 100)
  const colorTiempo = tiempoRestante < 300 ? '#e85d26' : '#00d4aa'

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px', color: '#e8e2d0', minHeight: '100vh', background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(26, 46, 26, 0.95))' }}>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h1 style={{ color: '#c9a84c', marginBottom: '5px', fontSize: '1.8em' }}>{patrulla.nombrePatrulla}</h1>
            <p style={{ color: '#a8a8a8', fontSize: '0.9em' }}>Enigma {nivel.orden}/{NIVELES.length} • Intento {patrulla.intentosNivelActual + 1}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#00d4aa', fontSize: '1.5em', fontWeight: 'bold', marginBottom: '5px' }}>{patrulla.puntos} pts</p>
            <p style={{ color: colorTiempo, fontSize: '1.3em', fontWeight: 'bold' }}>⏱️ {formatoTiempo(tiempoRestante)}</p>
          </div>
        </div>

        <div style={{ background: '#1a2e1a', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(90deg, #00d4aa, #c9a84c)', height: '100%', width: `${progreso}%`, transition: 'width 0.3s' }}></div>
        </div>
      </div>

      <div style={{ background: 'rgba(26, 46, 26, 0.8)', padding: '35px', borderRadius: '8px', marginTop: '20px', border: '1px solid rgba(201, 168, 76, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
          <span style={{ fontSize: '2em', marginRight: '15px' }}>{nivel.titulo.split(' ')[0]}</span>
          <h2 style={{ color: '#c9a84c', marginBottom: '0', fontSize: '1.6em' }}>{nivel.titulo.substring(2)}</h2>
        </div>

        <p style={{ color: '#e8e2d0', marginBottom: '25px', fontSize: '1.05em', lineHeight: '1.7', background: 'rgba(0, 0, 0, 0.3)', padding: '20px', borderRadius: '4px', borderLeft: '4px solid #c9a84c' }}>{nivel.descripcion}</p>

        {!pistaVisible && (
          <button
            onClick={() => setPistaVisible(true)}
            style={{
              background: 'rgba(201, 168, 76, 0.2)',
              border: '2px solid #c9a84c',
              color: '#c9a84c',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginBottom: '20px',
              fontSize: '0.95em'
            }}
          >
            💡 Mostrar Pista
          </button>
        )}

        {pistaVisible && (
          <div style={{ background: 'rgba(201, 168, 76, 0.15)', padding: '15px', borderRadius: '4px', marginBottom: '25px', borderLeft: '4px solid #c9a84c' }}>
            <strong style={{ color: '#c9a84c', fontSize: '0.95em' }}>💡 PISTA:</strong>
            <p style={{ color: '#d4b896', marginTop: '8px', fontSize: '0.95em' }}>{nivel.pista}</p>
          </div>
        )}

        <form onSubmit={responder}>
          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '10px', color: '#c9a84c', fontSize: '0.95em', textTransform: 'uppercase', fontWeight: 'bold' }}>🔑 Tu Respuesta:</label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={verificando}
              style={{ background: '#0d1b2a', border: '2px solid #3a5c3a', color: '#00d4aa', padding: '12px', borderRadius: '4px', width: '100%', fontFamily: 'monospace', fontSize: '1.05em', fontWeight: 'bold' }}
              autoFocus
            />
            <p style={{ color: '#a8a8a8', fontSize: '0.85em', marginTop: '8px' }}>Presiona Enter o haz click en Enviar</p>
          </div>

          <button
            type="submit"
            disabled={verificando}
            style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0d1b2a', padding: '12px 24px', border: 'none', borderRadius: '4px', cursor: verificando ? 'default' : 'pointer', fontWeight: 'bold', marginTop: '15px', width: '100%', fontSize: '1em', textTransform: 'uppercase', opacity: verificando ? 0.7 : 1 }}
          >
            {verificando ? '⏳ Verificando...' : '✓ ENVIAR RESPUESTA'}
          </button>
        </form>
      </div>

      {message && (
        <div style={{ marginTop: '20px', padding: '15px', background: message.includes('✅') ? 'rgba(0, 212, 170, 0.15)' : 'rgba(232, 93, 38, 0.15)', border: `2px solid ${message.includes('✅') ? '#00d4aa' : '#e85d26'}`, borderRadius: '4px', color: message.includes('✅') ? '#00d4aa' : '#e85d26', textAlign: 'center', fontWeight: 'bold', fontSize: '1.05em' }}>
          {message}
        </div>
      )}
    </div>
  )
}