import { useEffect, useMemo, useState } from 'react'
import MinecraftBackground from './components/MinecraftBackground.jsx'
import Bracket from './components/Bracket.jsx'
import PlayerEditor from './components/PlayerEditor.jsx'
import { DEFAULT_PLAYERS, ROUND_SIZES, buildRounds, emptyWinners } from './data/players.js'
import './App.css'

const STORAGE_KEY = 'mc-torneo-v1'

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (
      saved?.players?.length === 16 &&
      saved.winners?.length === 4 &&
      saved.winners.every((r, i) => r.length === ROUND_SIZES[i])
    ) {
      return saved
    }
  } catch {
    /* sin almacenamiento disponible */
  }
  return { players: DEFAULT_PLAYERS, winners: emptyWinners() }
}

export default function App() {
  const [initial] = useState(loadState)
  const [players, setPlayers] = useState(initial.players)
  const [winners, setWinners] = useState(initial.winners)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ players, winners }))
    } catch {
      /* ignorar */
    }
  }, [players, winners])

  const rounds = useMemo(() => buildRounds(players, winners), [players, winners])

  const pick = (r, m, slot) => {
    setWinners((prev) => {
      const next = prev.map((row) => [...row])
      next[r][m] = prev[r][m] === slot ? null : slot
      // si cambia un resultado, se limpian las rondas siguientes de esa rama
      for (let k = r + 1, idx = m >> 1; k < ROUND_SIZES.length; k++, idx >>= 1) next[k][idx] = null
      return next
    })
  }

  const shuffle = () => {
    const arr = [...players]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    setPlayers(arr)
    setWinners(emptyWinners())
  }

  const reset = () => {
    if (window.confirm('¿Reiniciar todos los resultados?')) setWinners(emptyWinners())
  }

  const saveNames = (names) => {
    setPlayers((prev) => prev.map((p, i) => ({ ...p, name: names[i] })))
    setEditing(false)
  }

  return (
    <>
      <MinecraftBackground />
      <main className="app">
        <header className="header">
          <div className="title-wrap">
            <h1 className="title">
              TORNEO <span>MINECRAFT</span>
            </h1>
            <p className="splash">¡Edición Llaves!</p>
          </div>
          <p className="hint">Haz clic en un jugador para que avance de ronda</p>
          <div className="toolbar">
            <button type="button" className="mc-btn" onClick={() => setEditing(true)}>Editar jugadores</button>
            <button type="button" className="mc-btn" onClick={shuffle}>Mezclar</button>
            <button type="button" className="mc-btn mc-btn-red" onClick={reset}>Reiniciar</button>
          </div>
        </header>

        <div className="bracket-scroll">
          <Bracket rounds={rounds} onPick={pick} />
        </div>
      </main>

      {editing && <PlayerEditor players={players} onSave={saveNames} onClose={() => setEditing(false)} />}
    </>
  )
}
