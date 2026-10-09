export function Head({ player }) {
  return (
    <span
      className="head"
      style={{ '--skin': player?.skin ?? '#c9d6e3', '--eyes': player?.eyes ?? '#c9d6e3' }}
    />
  )
}

function PlayerRow({ player, state, disabled, onClick }) {
  return (
    <button
      type="button"
      className={`player ${state} ${player ? '' : 'empty'}`}
      disabled={disabled}
      onClick={onClick}
      title={player && !disabled ? `Hacer ganar a ${player.name}` : undefined}
    >
      <Head player={player} />
      <span className="player-name">{player ? player.name : '???'}</span>
      {state === 'win' && <span className="check">✔</span>}
    </button>
  )
}

export default function MatchCloud({ match, round, index, onPick, final = false }) {
  const [a, b] = match.players
  const ready = Boolean(a && b)
  const stateOf = (slot) =>
    match.winner == null ? '' : match.winner === slot ? 'win' : 'lose'
  // pequeño desfase para que las nubes no floten todas a la vez
  const delay = `${-((round * 7 + index * 3) % 10) * 0.5}s`

  return (
    <div className={`cloud ${final ? 'cloud-final' : ''}`} style={{ animationDelay: delay }}>
      <span className="puff puff-1" />
      <span className="puff puff-2" />
      <span className="puff puff-3" />
      <div className="cloud-body">
        <PlayerRow player={a} state={stateOf(0)} disabled={!ready} onClick={() => onPick(round, index, 0)} />
        <div className="vs">VS</div>
        <PlayerRow player={b} state={stateOf(1)} disabled={!ready} onClick={() => onPick(round, index, 1)} />
      </div>
    </div>
  )
}
