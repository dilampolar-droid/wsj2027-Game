'use client'
import { useState, useEffect } from 'react'

const ADMIN_CREDENCIALES = [
  { usuario: 'admin1', password: 'scout2027' },
  { usuario: 'admin2', password: 'jamboree2027' },
  { usuario: 'director', password: 'gdansk2027' },
  { usuario: 'juez', password: 'enigma2027' },
]

export default function AdminPage() {
  const [autenticado, setAutenticado] = useState(false)
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [patrullas, setPatrullas] = useState([])

  // Cargar patrullas en tiempo real
  useEffect(() => {
    const cargarPatrullas = () => {
      const data = JSON.parse(localStorage.getItem('wsj2027_patrullas') || '[]')
      setPatrullas(data)
    }
    
    cargarPatrullas()
    const interval = setInterval(cargarPatrullas, 1000) // Actualizar cada segundo
    return () => clearInterval(interval)
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    setError('')
    
    const admin = ADMIN_CREDENCIALES.find(a => a.usuario === usuario && a.password === password)
    if (admin) {
      setAutenticado(true)
      localStorage.setItem('admin_loggedIn', JSON.stringify({ usuario, timestamp: Date.now() }))
    } else {
      setError('Credenciales incorrectas')
    }
  }

  const handleLogout = () => {
    setAutenticado(false)
    setUsuario('')
    setPassword('')
    localStorage.removeItem('admin_loggedIn')
  }

  const limpiarDatos = () => {
    if (confirm('¿Estás seguro de que deseas limpiar todos los datos?')) {
      localStorage.removeItem('wsj2027_patrullas')
      setPatrullas([])
    }
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
              <input type="text" value={usuario} onChange={(e) => setUsuario(e.target.value)} placeholder="admin1" style={{ background: '#0d1b2a', border: '2px solid #3a5c3a', color: '#00d4aa', padding: '10px', borderRadius: '4px', width: '100%', fontSize: '1em' }} autoFocus />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#c9a84c', fontSize: '0.9em', textTransform: 'uppercase', fontWeight: 'bold' }}>Contraseña</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="scout2027" style={{ background: '#0d1b2a', border: '2px solid #3a5c3a', color: '#00d4aa', padding: '10px', borderRadius: '4px', width: '100%', fontSize: '1em' }} />
            </div>

            {error && <p style={{ color: '#e85d26', marginBottom: '15px', textAlign: 'center' }}>{error}</p>}

            <button type="submit" style={{ background: '#c9a84c', color: '#0d1b2a', padding: '10px', border: 'none', borderRadius: '4px', width: '100%', fontSize: '1em', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}>
              Acceder
            </button>
          </form>

          <div style={{ marginTop: '30px', padding: '15px', background: 'rgba(0, 212, 170, 0.1)', borderRadius: '4px', fontSize: '0.85em', color: '#a8a8a8' }}>
            <p style={{ marginBottom: '10px', color: '#c9a84c', fontWeight: 'bold' }}>Credenciales Disponibles:</p>
            <p>👤 admin1 / scout2027</p>
            <p>👤 admin2 / jamboree2027</p>
            <p>👤 director / gdansk2027</p>
            <p>👤 juez / enigma2027</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px', color: '#e8e2d0', minHeight: '100vh', background: 'linear-gradient(135deg, rgba(13, 27, 42, 0.95), rgba(26, 46, 26, 0.95))' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#c9a84c', fontSize: '2em', margin: 0 }}>📊 Dashboard Admin - {usuario.toUpperCase()}</h1>
        <button onClick={handleLogout} style={{ background: '#e85d26', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Logout
        </button>
      </div>

      <div style={{ background: 'rgba(26, 46, 26, 0.8)', border: '1px solid rgba(201, 168, 76, 0.2)', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div>
            <p style={{ color: '#a8a8a8', marginBottom: '5px' }}>Patrullas en Juego</p>
            <p style={{ color: '#00d4aa', fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>{patrullas.filter(p => p.estado === 'jugando').length}</p>
          </div>
          <div>
            <p style={{ color: '#a8a8a8', marginBottom: '5px' }}>Completadas</p>
            <p style={{ color: '#00d4aa', fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>{patrullas.filter(p => p.estado === 'completado').length}</p>
          </div>
          <div>
            <p style={{ color: '#a8a8a8', marginBottom: '5px' }}>Total Patrullas</p>
            <p style={{ color: '#c9a84c', fontSize: '1.5em', fontWeight: 'bold', margin: 0 }}>{patrullas.length}</p>
          </div>
          <button onClick={limpiarDatos} style={{ background: '#e85d26', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', alignSelf: 'flex-end' }}>
            🗑️ Limpiar Datos
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(26, 46, 26, 0.8)', border: '1px solid rgba(201, 168, 76, 0.2)', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(201, 168, 76, 0.1)', borderBottom: '1px solid rgba(201, 168, 76, 0.2)' }}>
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
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '12px', color: '#e8e2d0', fontFamily: 'monospace' }}>{p.codigo}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#00d4aa', fontWeight: 'bold' }}>{p.nivel_actual}/12</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#c9a84c', fontWeight: 'bold' }}>{p.puntos}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ background: '#1a2e1a', height: '6px', borderRadius: '3px', width: '100px', margin: '0 auto', overflow: 'hidden' }}>
                    <div style={{ background: '#00d4aa', height: '100%', width: `${(p.nivel_actual / 12) * 100}%` }}></div>
                  </div>
                </td>
                <td style={{ padding: '12px', textAlign: 'center', color: p.estado === 'completado' ? '#00d4aa' : '#c9a84c' }}>
                  {p.estado === 'completado' ? '✅ Completado' : '🎮 Jugando'}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#a8a8a8', fontSize: '0.85em' }}>
                  {new Date(p.inicio).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patrullas.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#a8a8a8' }}>
            No hay patrullas jugando aún
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: 'rgba(201, 168, 76, 0.1)', borderRadius: '8px', fontSize: '0.9em', color: '#a8a8a8' }}>
        <p style={{ marginBottom: '10px' }}>⏱️ <strong>Sistema de Puntos:</strong> 1000 pts por nivel + 500 bonus si respondes en menos de 2 minutos</p>
        <p style={{ marginBottom: '10px' }}>⏰ <strong>Tiempo Límite:</strong> 45 minutos por juego</p>
        <p>🔄 <strong>Actualización:</strong> Los datos se actualizan en tiempo real cada segundo</p>
      </div>
    </div>
  )
}
