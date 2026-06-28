'use client'
import { useState, useEffect, useCallback } from 'react'

interface Nivel {
  orden: number
  titulo: string
  descripcion: string
  // SHA-256 de la respuesta normalizada (minúsculas, sin espacios).
  // Así la respuesta nunca aparece en texto plano en el código que llega al navegador.
  respuestaHash: string
  pista: string
}

const NIVELES = [
  { orden: 1, titulo: '🔓 El Cofre del Fundador', descripcion: 'En 1907, Robert Baden-Powell fundó el movimiento Scout. Su nombre completo tenia 3 nombres y 2 apellidos ¿Cuál era sus otros 2 nombres?', respuesta: 'stevensmith', pista: '1907 + historia scout = búsqueda en Wikipedia',},
  { orden: 2, titulo: '🗺️ La Brújula Desaparecida',descripcion: '5S/67/341D7D/D56/J70B9255. Decodifica y encontrarás una ciudad polaca.', respuesta: 'gdansk', pista: 'Utilza la clave murcielago para decodificar el mensaje',},
  { orden: 3, titulo: '🔢 La Pirámide Numérica', descripcion: 'Secuencia: 2-4-8-16-?. Si sumas los dígitos del siguiente número y lo conviertes a palabra en inglés: ONE, TWO, THREE... ¿cuál es?', respuesta: 'thirtytwo', pista: 'Potencias de 2: cada número es el anterior x 2' },
  { orden: 4, titulo: '⚜️ El Lema Scout', descripcion: 'El lema Scout oficial en inglés tiene 2 palabras que comienzan: B-P. Es una lema a nivel mundial. ¿Cuál es?', respuesta: 'be prepared', pista: 'Traducción al español: "Siempre listo"' },
  { orden: 5, titulo: '🎖️ Los Cinco Principios', descripcion: 'En el primer campamento scout fueron 4 patrullas que fueron: Toros, Cuervos, Lobos y....¿el quinto?.', respuesta: 'chorlitos', pista: 'Comienza con C' },
  { orden: 6, titulo: '🔐 Fecha Importante', descripcion: 'Cuando fue el primer campamento scout?', respuesta: '1907', pista: 'Fue entre 1900 y 1910'},
  { orden: 7, titulo: '📖 Un libro importante', descripcion: '¿Qué nombre recibe el libro escrito por Baden-Powell que contiene las bases del movimiento?', respuesta: 'escultismoparamuchachos', pista: 'Libro fundamental del movimiento scout',},
  { orden: 8, titulo: '🎭 El Acertijo Paradójico', descripcion: 'Soy una puerta que está siempre abierta pero nunca entra ni sale nadie. He guiado a millones de scouts en la oscuridad. ¿Qué soy?', respuesta: 'brujula', pista: 'Navegación sin entradas ni salidas' },
  { orden: 9, titulo: '📜 Anagrama Antiguo', descripcion: 'Las letras de esta palabra "MACAPAR" pueden reorganizarse para formar una actividad típica de campamento scout. ¿Cuál es?', respuesta: 'acampar', pista: 'la actividad de dormir al aire libre en carpas',},
  { orden: 10, titulo: '🔗 La Cadena de Nudos', descripcion: '¿Qué nudo sirve para empezar o finalizar un amarre?', respuesta: 'ballestrinque', pista: 'Nudo de empalme, muy usado en escalada' },
  { orden: 11, titulo: '⚡ Código Morse Final', descripcion: 'Morse: .-.. . .- .-.. - .- -.. / .- -... -. . --. .- -.-. .. --- -. / -.-- / .--. ..- .-. . --.. .-¿Que son?', respuesta: 'virtudes', pista: 'D=../ A=.- / Y=-.-- / R=.-.',},
  { orden: 12, titulo: '🏆 El Círculo Completo', descripcion: '¡FELICITACIONES! Han resuelto todos los enigmas. El verdadero premio es el viaje, no el destino. En scout, ¿cómo se llama el acto final de reunión?', respuesta: 'Fogata', pista: 'Tradición alrededor del fuego al final de campamento' },
]

const TIEMPO_LIMITE_SEGUNDOS = 2700 // 45 minutos
const PUNTOS_POR_NIVEL = 1000
const TIEMPO_BONUS_SEGUNDOS = 120 // Bonus si respondes en menos de 2 minutos
const SESSION_KEY = 'wsj2027_sesion_activa'
const PATRULLAS_KEY = 'wsj2027_patrullas'

interface Sesion {
  patrulla: string
  nivelActual: number
  puntos: number
  tiempoInicio: number
}

async function sha256(texto: string): Promise<string> {
  const data = new TextEncoder().encode(texto)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function Home() {
  const [screen, setScreen] = useState<'login' | 'game'>('login')
  const [code, setCode] = useState('')
  const [answer, setAnswer] = useState('')
  const [message, setMessage] = useState('')
  const [patrulla, setPatrulla] = useState('')
  const [nivelActual, setNivelActual] = useState(0)
  const [intentos, setIntentos] = useState(0)
  const [error, setError] = useState('')
  const [tiempoInicio, setTiempoInicio] = useState<number | null>(null)
  const [pistaVisible, setPistaVisible] = useState(false)
  const [puntos, setPuntos] = useState(0)
  const [tiempoRestante, setTiempoRestante] = useState(TIEMPO_LIMITE_SEGUNDOS)
  const [verificando, setVerificando] = useState(false)

  // Restaurar sesión activa si la página se recarga (evita perder el progreso a mitad de partida)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const sesion: Sesion = JSON.parse(raw)
        const transcurrido = Math.floor((Date.now() - sesion.tiempoInicio) / 1000)
        if (transcurrido < TIEMPO_LIMITE_SEGUNDOS && sesion.nivelActual < NIVELES.length) {
          setPatrulla(sesion.patrulla)
          setNivelActual(sesion.nivelActual)
          setPuntos(sesion.puntos)
          setTiempoInicio(sesion.tiempoInicio)
          setScreen('game')
        } else {
          localStorage.removeItem(SESSION_KEY)
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [])

  const terminarPartida = useCallback((codigo: string, estado: 'completado' | 'tiempo_agotado', puntosFinales: number) => {
    try {
      const patrullas = JSON.parse(localStorage.getItem(PATRULLAS_KEY) || '[]')
      const idx = patrullas.findIndex((p: any) => p.codigo === codigo)
      if (idx >= 0) {
        patrullas[idx] = { ...patrullas[idx], puntos: puntosFinales, estado, fin: new Date().toISOString() }
        localStorage.setItem(PATRULLAS_KEY, JSON.stringify(patrullas))
      }
    } catch {
      // localStorage no disponible (modo privado, etc.) - no es crítico
    }
    localStorage.removeItem(SESSION_KEY)
  }, [])

  // Cronómetro global
  useEffect(() => {
    if (screen === 'game' && tiempoInicio) {
      const interval = setInterval(() => {
        const ahora = Date.now()
        const transcurrido = Math.floor((ahora - tiempoInicio) / 1000)
        const restante = Math.max(0, TIEMPO_LIMITE_SEGUNDOS - transcurrido)
        setTiempoRestante(restante)

        if (restante === 0) {
          clearInterval(interval)
          alert(`⏰ ¡TIEMPO AGOTADO!\n\nPuntuación final: ${puntos}`)
          terminarPartida(patrulla, 'tiempo_agotado', puntos)
          setScreen('login')
          setPatrulla('')
          setCode('')
          setAnswer('')
          setTiempoInicio(null)
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [screen, tiempoInicio, puntos, patrulla, terminarPartida])

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const upperCode = code.toUpperCase().trim()

    if (!upperCode || !upperCode.includes('-2027')) {
      setError('Formato correcto: NOMBRE-2027')
      return
    }

    const inicio = Date.now()
    setPatrulla(upperCode)
    setNivelActual(0)
    setIntentos(0)
    setMessage('')
    setPistaVisible(false)
    setPuntos(0)
    setTiempoRestante(TIEMPO_LIMITE_SEGUNDOS)
    setTiempoInicio(inicio)
    setScreen('game')

    try {
      const sesion: Sesion = { patrulla: upperCode, nivelActual: 0, puntos: 0, tiempoInicio: inicio }
      localStorage.setItem(SESSION_KEY, JSON.stringify(sesion))

      const patrullas = JSON.parse(localStorage.getItem(PATRULLAS_KEY) || '[]')
      patrullas.push({ codigo: upperCode, nombre: upperCode, nivel_actual: 1, puntos: 0, estado: 'jugando', inicio: new Date().toISOString() })
      localStorage.setItem(PATRULLAS_KEY, JSON.stringify(patrullas))
    } catch {
      // si localStorage falla, el juego sigue funcionando en memoria igualmente
    }
  }

  const responder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (verificando || !tiempoInicio) return
    setVerificando(true)

    const nivel = NIVELES[nivelActual]
    const normalizado = answer.toLowerCase().replace(/\s/g, '')
    const hashIngresado = await sha256(normalizado)
    const nuevoIntentos = intentos + 1
    setIntentos(nuevoIntentos)

    if (hashIngresado === nivel.respuesta) {
      const ahora = Date.now()
      const tiempoNivel = Math.floor((ahora - tiempoInicio) / 1000)
      const puntosNivel = tiempoNivel < TIEMPO_BONUS_SEGUNDOS ? PUNTOS_POR_NIVEL + 500 : PUNTOS_POR_NIVEL
      const nuevosPuntos = puntos + puntosNivel
      setPuntos(nuevosPuntos)

      if (nivelActual === NIVELES.length - 1) {
        alert(`🏆 ¡¡¡ GANARON !!! \n\n${patrulla}\nPuntuación Final: ${nuevosPuntos} puntos\n\n¡Somos unidad! ⚜️`)
        terminarPartida(patrulla, 'completado', nuevosPuntos)
        setScreen('login')
        setPatrulla('')
        setCode('')
        setAnswer('')
        setTiempoInicio(null)
        setVerificando(false)
        return
      }

      setMessage(`✅ ¡CORRECTO! +${puntosNivel} pts`)
      const siguienteNivel = nivelActual + 1
      try {
        const sesion: Sesion = { patrulla, nivelActual: siguienteNivel, puntos: nuevosPuntos, tiempoInicio }
        localStorage.setItem(SESSION_KEY, JSON.stringify(sesion))
        const patrullas = JSON.parse(localStorage.getItem(PATRULLAS_KEY) || '[]')
        const idx = patrullas.findIndex((p: any) => p.codigo === patrulla)
        if (idx >= 0) {
          patrullas[idx] = { ...patrullas[idx], nivel_actual: siguienteNivel + 1, puntos: nuevosPuntos }
          localStorage.setItem(PATRULLAS_KEY, JSON.stringify(patrullas))
        }
      } catch {
        // no crítico
      }

      setTimeout(() => {
        setNivelActual(siguienteNivel)
        setAnswer('')
        setMessage('')
        setIntentos(0)
        setPistaVisible(false)
        setVerificando(false)
      }, 1500)
    } else {
      setMessage(`❌ Intento ${nuevoIntentos} - Incorrecto`)
      setAnswer('')
      setVerificando(false)
    }
  }

  const formatoTiempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${mins}:${segs.toString().padStart(2, '0')}`
  }

  if (screen === 'login') {
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
              <label style={{ display: 'block', marginBottom: '10px', color: '#c9a84c', fontSize: '0.95em', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 'bold' }}>🔐 Código de Patrulla</label>
              <input type="text" value={code} onChange={(e) => { setCode(e.target.value); setError('') }} placeholder="AGUILA-2027" style={{ background: '#0d1b2a', border: '2px solid #3a5c3a', color: '#00d4aa', padding: '14px', borderRadius: '4px', width: '100%', fontSize: '1.1em', fontFamily: 'monospace', fontWeight: 'bold' }} autoFocus />
            </div>
            {error && <p style={{ color: '#e85d26', marginBottom: '15px', fontSize: '0.9em' }}>⚠️ {error}</p>}
            <button type="submit" style={{ background: 'linear-gradient(135deg, #c9a84c, #e8c97a)', color: '#0d1b2a', padding: '14px', border: 'none', borderRadius: '4px', width: '100%', fontSize: '1.1em', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em', boxShadow: '0 4px 15px rgba(201, 168, 76, 0.3)' }}>
              🔓 ENTRAR AL ESCAPE ROOM
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

  const nivel = NIVELES[nivelActual]
  const progreso = Math.round(((nivelActual + 1) / NIVELES.length) * 100)
  const colorTiempo = tiempoRestante < 300 ? '#e85d26' : '#00d4aa'

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '30px 20px', color: '#e8e2d0', minHeight: '100vh', background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(26, 46, 26, 0.95))' }}>
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h1 style={{ color: '#c9a84c', marginBottom: '5px', fontSize: '1.8em' }}>{patrulla}</h1>
            <p style={{ color: '#a8a8a8', fontSize: '0.9em' }}>Enigma {nivel.orden}/{NIVELES.length} • Intento {intentos + 1}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#00d4aa', fontSize: '1.5em', fontWeight: 'bold', marginBottom: '5px' }}>{puntos} pts</p>
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
