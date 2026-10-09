import MatchCloud, { Head } from './MatchCloud.jsx'
import { ROUND_LABELS } from '../data/players.js'

// Trofeo en pixel art (cada letra es un color)
const TROPHY = [
  '..gggggggg..',
  'GGgYYYYYYgGG',
  'G.gYYYYYYg.G',
  'G.gYYYYYYg.G',
  '.GgYYYYYYgG.',
  '...gYYYYg...',
  '....gYYg....',
  '.....gg.....',
  '.....gg.....',
  '...bbbbbb...',
  '...bBBBBb...',
  '...bbbbbb...',
]
const TROPHY_COLORS = { g: '#c98a0c', G: '#e0a417', Y: '#ffd83d', b: '#5d4128', B: '#866043' }

function Trophy() {
  return (
    <svg className="trophy" viewBox="0 0 12 12" shapeRendering="crispEdges" aria-hidden="true">
      {TROPHY.flatMap((row, y) =>
        [...row].map((c, x) =>
          c === '.' ? null : <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={TROPHY_COLORS[c]} />,
        ),
      )}
    </svg>
  )
}

function Column({ rounds, round, indices, side, onPick }) {
  const pairs = []
  for (let i = 0; i < indices.length; i += 2) pairs.push(indices.slice(i, i + 2))

  return (
    <div className={`column column-${side} round-${round}`}>
      <h2 className="round-label">{ROUND_LABELS[round]}</h2>
      <div className="column-body">
        {pairs.map((pair) => (
          <div className={`pair ${pair.length === 2 ? 'pair-2' : 'pair-1'}`} key={pair[0]}>
            {pair.map((m) => (
              <div className="slot" key={m}>
                <MatchCloud match={rounds[round][m]} round={round} index={m} onPick={onPick} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Bracket({ rounds, onPick }) {
  const champion = rounds[3][0].winnerPlayer
  const range = (from, n) => Array.from({ length: n }, (_, i) => from + i)

  return (
    <div className="bracket">
      <Column rounds={rounds} round={0} indices={range(0, 4)} side="left" onPick={onPick} />
      <Column rounds={rounds} round={1} indices={range(0, 2)} side="left" onPick={onPick} />
      <Column rounds={rounds} round={2} indices={[0]} side="left" onPick={onPick} />

      <div className="column column-final">
        <h2 className="round-label">{ROUND_LABELS[3]}</h2>
        <div className="column-body">
          <div className={`champion ${champion ? 'has-champion' : ''}`}>
            <Trophy />
            {champion ? (
              <>
                <span className="champion-title">¡Campeón!</span>
                <span className="champion-name">
                  <Head player={champion} /> {champion.name}
                </span>
              </>
            ) : (
              <span className="champion-title muted">¿Quién ganará?</span>
            )}
          </div>
          <div className="pair pair-1">
            <div className="slot">
              <MatchCloud match={rounds[3][0]} round={3} index={0} onPick={onPick} final />
            </div>
          </div>
        </div>
      </div>

      <Column rounds={rounds} round={2} indices={[1]} side="right" onPick={onPick} />
      <Column rounds={rounds} round={1} indices={range(2, 2)} side="right" onPick={onPick} />
      <Column rounds={rounds} round={0} indices={range(4, 4)} side="right" onPick={onPick} />
    </div>
  )
}
