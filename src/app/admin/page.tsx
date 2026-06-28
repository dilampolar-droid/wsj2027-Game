'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { getSupabaseBrowser } from '@/src/lib/supabaseBrowser'

const ADMIN_TOKEN_KEY = 'wsj2027_admin_token'

interface PatrullaRow {
  usuario: string
  nombre_patrulla: string
  nivel_actual: number
  puntos: number
  estado: string
  tiempo_inicio: string | null
  tiempo_fin: string | null
  updated_at: string
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem(ADMIN_TOKEN_KEY) : null
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(path, { ...options, headers, cache: 'no-store' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || 'Error de servidor') as Error & { status?: number }
    err.status = res.status
    throw err
  }
  return data
}

function ordenarRanking(filas: PatrullaRow[]): PatrullaRow[] {
  return [...filas].sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos
    return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
  })
}

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [verificandoSesion, setVerificandoSesion] = useState(true)
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [verificando, setVerificando] = useState(false)
  const [patrullas, setPatrullas] = useState<PatrullaRow[]>([])
  const [conectadoRealtime, setConectadoRealtime] = useState(false)

  const usuarioActualRef = useRef(usuario)
  usuarioActualRef.current = usuario

  // Si ya había una sesión admin guardada, intentamos reutilizarla pidiendo el ranking.
  useEffect(() => {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (!token) {
      setVerificandoSesion(false)
      return
    }
    apiFetch('/api/admin/ranking')
      .then((data) => {
        setPatrullas(ordenarRanking(data.patrullas))
        setAutenticado(true)
      })
      .catch(() => localStorage.removeItem(ADMIN_TOKEN_KEY))
      .finally(() => setVerificandoSesion(false))
  }, [])

  const cargarRanking = useCallback(() => {
    apiFetch('/api/admin/ranking')
      .then((data) => setPatrullas(ordenarRanking(data.patrullas)))
      .catch(() => {
        // si el token caducó a media sesión, no es crítico: Realtime sigue
        // intentando refrescar, y el próximo refresh manual lo detectará.
      })
  }, [])

  // Ranking en tiempo real: Supabase Realtime empuja cada cambio en la tabla
  // `patrullas` (desde CUALQUIER dispositivo donde una patrulla esté jugando)
  // directamente a este panel, sin que el admin tenga que refrescar la página.
  useEffect(() => {
    if (!autenticado) return

    // Carga inicial + refresco periódico de respaldo (por si el WebSocket
    // se cae un instante, esto sirve de red de seguridad).
    cargarRanking()
    const intervalRespaldo = setInterval(cargarRanking, 10000)

    const supabase = getSupabaseBrowser()
    if (!supabase) {
      return () => clearInterval(intervalRespaldo)
    }

    const canal = supabase
      .channel('ranking-patrullas')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'patrullas' },
        () => {
          cargarRanking()
        }
      )
      .subscribe((status) => {
        setConectadoRealtime(status === 'SUBSCRIBED')
      })

    return () => {
      clearInterval(intervalRespaldo)
      supabase.removeChannel(canal)
    }
  }, [autenticado, cargarRanking])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setVerificando(true)
    try {
      const data = await apiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ usuario, password }),
      })
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token)
      setAutenticado(true)
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas')
    } finally {
      setVerificando(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    setAutenticado(false)
    setUsuario('')
    setPassword('')
    setPatrullas([])
  }

  const reiniciarDatos = async () => {
    if (!confirm('¿Estás seguro de que deseas reiniciar TODAS las partidas? Esto pone a las 20 patrullas de vuelta en el nivel 1 con 0 puntos.')) return
    try {
      await apiFetch('/api/admin/reiniciar', { method: 'POST' })
      cargarRanking()
    } catch (err: any) {
      alert('Error al reiniciar: ' + (err.message || 'desconocido'))
    }
  }

  if (verificandoSesion) {
    return <div style={{ textAlign: 'center', marginTop: '100px', color: '#a8a8a8' }}>Cargando…</div>
  }

  if (!autenticado) {
    return (
      <div style={{ maxWidth: '500px', margin: '100px auto', padding: '0 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5em', color: '#c9a84c', marginBottom: '10px' }}>🛡️ Panel Admin</h1>
          <p style={{ color: '#00d4aa', fontSize: '0.9em' }}>WSJ 2027 - Escape Room</p>
        </div>

        <div style={{ background: 'rgba(26, 46, 26, 0.8)', border: '2px solid #c9a84c', padding: '40px', borderRadius: '8px' }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#c9a84c', fontSize: '0.9em', textTransform: 'uppercase', fontWeight: 'bold' }}>Usuario</label>
              <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} style={{ background: '#0d1b2a', border: '2px solid #3a5c3a', color: '#00d4aa', padding: '10px', borderRadius: '4px', width: '100%', fontSize: '1em' }} autoFocus autoComplete="username" />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#c9a84c', fontSize: '0.9em', textTransform: 'uppercase', fontWeight: 'bold' }}>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ background: '#0d1b2a', border: '2px solid #3a5c3a', color: '#00d4aa', padding: '10px', borderRadius: '4px', width: '100%', fontSize: '1em' }} autoComplete="current-password" />
            </div>

            {error && <p style={{ color: '#e85d26', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}

            <button type="submit" disabled={verificando} style={{ background: '#c9a84c', color: '#0d1b2a', padding: '10px', border: 'none', borderRadius: '4px', width: '100%', fontSize: '1em', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase', opacity: verificando ? 0.7 : 1 }}>
              {verificando ? 'Verificando...' : 'Acceder'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px', color: '#e8e2d0', minHeight: '100vh', background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(26, 46, 26, 0.95))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ color: '#c9a84c', fontSize: '2em', margin: 0 }}>📊 Dashboard Admin - {usuario.toUpperCase()}</h1>
          <p style={{ color: conectadoRealtime ? '#00d4aa' : '#a8a8a8', fontSize: '0.8em', marginTop: '6px' }}>
            {conectadoRealtime ? '🟢 Ranking en vivo (todos los dispositivos)' : '🟡 Conectando al ranking en vivo…'}
          </p>
        </div>
        <button onClick={handleLogout} style={{ background: '#e85d26', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Logout
        </button>
      </div>

      <div style={{ background: 'rgba(26, 46, 26, 0.8)', border: '1px solid rgba(201, 168, 76, 0.2)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <p style={{ color: '#a8a8a8', marginBottom: '5px' }}>Patrullas en Juego</p>
            <p style={{ color: '#00d4aa', fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>{patrullas.filter((p) => p.estado === 'jugando').length}</p>
          </div>
          <div>
            <p style={{ color: '#a8a8a8', marginBottom: '5px' }}>Completadas</p>
            <p style={{ color: '#00d4aa', fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>{patrullas.filter((p) => p.estado === 'completado').length}</p>
          </div>
          <div>
            <p style={{ color: '#a8a8a8', marginBottom: '5px' }}>Total Patrullas</p>
            <p style={{ color: '#c9a84c', fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>{patrullas.length}</p>
          </div>
          <button onClick={reiniciarDatos} style={{ background: '#e85d26', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            🔄 Reiniciar Partidas
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(26, 46, 26, 0.8)', border: '1px solid rgba(201, 168, 76, 0.2)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(201, 168, 76, 0.1)', borderBottom: '1px solid rgba(201, 168, 76, 0.2)' }}>
              <th style={{ padding: '15px', textAlign: 'left', color: '#c9a84c', fontWeight: 'bold' }}>#</th>
              <th style={{ padding: '15px', textAlign: 'left', color: '#c9a84c', fontWeight: 'bold' }}>Patrulla</th>
              <th style={{ padding: '15px', textAlign: 'center', color: '#c9a84c', fontWeight: 'bold' }}>Nivel</th>
              <th style={{ padding: '15px', textAlign: 'center', color: '#c9a84c', fontWeight: 'bold' }}>Puntos</th>
              <th style={{ padding: '15px', textAlign: 'center', color: '#c9a84c', fontWeight: 'bold' }}>Progreso</th>
              <th style={{ padding: '15px', textAlign: 'center', color: '#c9a84c', fontWeight: 'bold' }}>Estado</th>
              <th style={{ padding: '15px', textAlign: 'center', color: '#c9a84c', fontWeight: 'bold' }}>Inicio</th>
            </tr>
          </thead>
          <tbody>
            {patrullas.map((p, idx) => (
              <tr key={p.usuario} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '12px', color: '#a8a8a8' }}>{idx + 1}</td>
                <td style={{ padding: '12px', color: '#e8e2d0', fontFamily: 'monospace' }}>{p.nombre_patrulla}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#00d4aa', fontWeight: 'bold' }}>{p.nivel_actual}/12</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#c9a84c', fontWeight: 'bold' }}>{p.puntos}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ background: '#1a2e1a', height: '6px', borderRadius: '3px', width: '100px', margin: '0 auto', overflow: 'hidden' }}>
                    <div style={{ background: '#00d4aa', height: '100%', width: `${(p.nivel_actual / 12) * 100}%` }}></div>
                  </div>
                </td>
                <td style={{ padding: '12px', textAlign: 'center', color: p.estado === 'completado' ? '#00d4aa' : '#c9a84c' }}>
                  {p.estado === 'completado' ? '✅ Completado' : p.estado === 'tiempo_agotado' ? '⏰ Tiempo agotado' : p.estado === 'jugando' ? '🎮 Jugando' : '⏳ Sin empezar'}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#a8a8a8', fontSize: '0.85em' }}>
                  {p.tiempo_inicio ? new Date(p.tiempo_inicio).toLocaleTimeString() : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patrullas.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#a8a8a8' }}>
            No hay patrullas registradas
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(201, 168, 76, 0.1)', borderRadius: '8px', fontSize: '0.9em', color: '#a8a8a8' }}>
        <p style={{ marginBottom: '10px' }}>⏱️ <strong>Sistema de Puntos:</strong> 1000 pts por nivel + 500 bonus si respondes en menos de 2 minutos</p>
        <p style={{ marginBottom: '10px' }}>⏰ <strong>Tiempo Límite:</strong> 45 minutos por juego</p>
        <p>🔄 <strong>Actualización:</strong> El ranking llega en vivo desde cualquier dispositivo que esté jugando, vía Supabase Realtime</p>
      </div>
    </div>
  )
}