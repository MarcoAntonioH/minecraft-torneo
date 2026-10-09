// 16 jugadores iniciales: nombre + colores para su "cabeza" pixelada
export const DEFAULT_PLAYERS = [
  { id: 'p1', name: 'Steve', skin: '#c4956c', eyes: '#4a3aa8' },
  { id: 'p2', name: 'Creeper', skin: '#5dbb3f', eyes: '#111111' },
  { id: 'p3', name: 'Alex', skin: '#e8b48a', eyes: '#2e8b57' },
  { id: 'p4', name: 'Enderman', skin: '#1b1b1b', eyes: '#d77cff' },
  { id: 'p5', name: 'Zombie', skin: '#4f8a3a', eyes: '#1c1c1c' },
  { id: 'p6', name: 'Esqueleto', skin: '#cfcfcf', eyes: '#333333' },
  { id: 'p7', name: 'Aldeano', skin: '#b88563', eyes: '#2d6b2d' },
  { id: 'p8', name: 'Herobrine', skin: '#c4956c', eyes: '#ffffff' },
  { id: 'p9', name: 'Blaze', skin: '#f4b41a', eyes: '#2b1600' },
  { id: 'p10', name: 'Ghast', skin: '#f2f2f2', eyes: '#555555' },
  { id: 'p11', name: 'Wither', skin: '#2a2a2a', eyes: '#cfe8ff' },
  { id: 'p12', name: 'Warden', skin: '#0f3b44', eyes: '#4ff3ff' },
  { id: 'p13', name: 'Piglin', skin: '#e59a8f', eyes: '#2a1a14' },
  { id: 'p14', name: 'Slime', skin: '#7ccc5c', eyes: '#2e5e22' },
  { id: 'p15', name: 'Golem', skin: '#d8d0c0', eyes: '#8b0000' },
  { id: 'p16', name: 'Ajolote', skin: '#f7a8c8', eyes: '#222222' },
]

export const ROUND_SIZES = [8, 4, 2, 1]
export const ROUND_LABELS = ['Octavos', 'Cuartos', 'Semifinal', 'Final']

export const emptyWinners = () => ROUND_SIZES.map((n) => Array(n).fill(null))

// Construye todas las rondas a partir de los jugadores y los ganadores elegidos
export function buildRounds(players, winners) {
  const rounds = []
  ROUND_SIZES.forEach((size, r) => {
    const matches = []
    for (let m = 0; m < size; m++) {
      const pl =
        r === 0
          ? [players[2 * m], players[2 * m + 1]]
          : [rounds[r - 1][2 * m].winnerPlayer, rounds[r - 1][2 * m + 1].winnerPlayer]
      const w = winners[r][m]
      const valid = w != null && pl[0] && pl[1]
      matches.push({ players: pl, winner: valid ? w : null, winnerPlayer: valid ? pl[w] : null })
    }
    rounds.push(matches)
  })
  return rounds
}
