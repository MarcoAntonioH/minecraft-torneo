import { useEffect, useState } from 'react'
import { Head } from './MatchCloud.jsx'

export default function PlayerEditor({ players, onSave, onClose }) {
  const [names, setNames] = useState(players.map((p) => p.name))

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const submit = (e) => {
    e.preventDefault()
    onSave(names.map((n, i) => n.trim() || `Jugador ${i + 1}`))
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="editor cloud-panel" onSubmit={submit}>
        <h2>Editar jugadores</h2>
        <div className="editor-grid">
          {players.map((p, i) => (
            <label key={p.id} className="editor-row">
              <span className="editor-num">{i % 2 === 0 ? `P${i / 2 + 1}` : 'vs'}</span>
              <Head player={p} />
              <input
                value={names[i]}
                maxLength={14}
                onChange={(e) => setNames((prev) => prev.map((n, j) => (j === i ? e.target.value : n)))}
              />
            </label>
          ))}
        </div>
        <div className="editor-actions">
          <button type="button" className="mc-btn" onClick={onClose}>Cancelar</button>
          <button type="submit" className="mc-btn mc-btn-green">Guardar</button>
        </div>
      </form>
    </div>
  )
}
