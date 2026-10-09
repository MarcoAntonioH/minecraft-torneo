import { useEffect, useRef } from 'react'

// Paisaje estilo Minecraft dibujado en canvas, generado proceduralmente
// (sin imágenes externas) y con desplazamiento parallax infinito.

const hash = (x, y = 0) => {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

const smooth = (x, seed) => {
  const i = Math.floor(x)
  const f = x - i
  const t = f * f * (3 - 2 * f)
  const a = hash(i, seed)
  const b = hash(i + 1, seed)
  return a + (b - a) * t
}

const PALETTES = {
  grass: ['#5fa53b', '#6bb447', '#559a33', '#7cc153'],
  dirt: ['#866043', '#79553a', '#966c4a', '#5d4128'],
  stone: ['#7d7d7d', '#6e6e6e', '#8f8f8f', '#5f5f5f'],
  sand: ['#dbd3a0', '#d1c88f', '#e3dbab', '#c9bf85'],
  leaves: ['#3f8a2b', '#357a23', '#4c9e33', '#2c6a1c'],
  log: ['#6b4f2a', '#5a4122', '#7a5b33', '#4a3519'],
  water: ['#3f76e4', '#3b6fd8', '#4a82ee', '#3566c9'],
}

const PIX = 8 // cada bloque es de 8x8 "píxeles"

function makeBlock(size, type, variant) {
  const c = document.createElement('canvas')
  c.width = size
  c.height = size
  const ctx = c.getContext('2d')
  const p = size / PIX
  for (let y = 0; y < PIX; y++) {
    for (let x = 0; x < PIX; x++) {
      let pal = PALETTES[type]
      if (type === 'grassBlock') {
        const edge = y < 2 || (y === 2 && hash(x, variant * 17 + 3) < 0.55)
        pal = edge ? PALETTES.grass : PALETTES.dirt
      }
      let r = hash(x + variant * 31, y + variant * 57 + type.length * 101)
      if (type === 'log') r = (hash(x, variant) * 0.7 + r * 0.3)
      const idx = r < 0.5 ? 0 : r < 0.72 ? 1 : r < 0.9 ? 2 : 3
      ctx.fillStyle = pal[idx]
      ctx.fillRect(x * p, y * p, p, p)
    }
  }
  return c
}

function buildTextures(size) {
  const types = ['grassBlock', 'dirt', 'stone', 'sand', 'leaves', 'log', 'water']
  const tex = {}
  for (const t of types) tex[t] = [0, 1, 2].map((v) => makeBlock(size, t, v))
  return tex
}

const WATER = 5
const fgHeight = (wx) =>
  3 + Math.floor(smooth(wx / 14, 31) * 5 + smooth(wx / 5, 32) * 2)
const isTree = (wx) => {
  const t = (x) => hash(x, 7) < 0.09
  return t(wx) && !t(wx - 1) && !t(wx - 2) && !t(wx - 3) && fgHeight(wx) > WATER
}

export default function MinecraftBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const speedFactor = reduced ? 0.15 : 1

    let W = 0
    let H = 0
    let B = 24
    let tex = null
    let raf = 0
    let last = performance.now()
    let fgOff = 0
    let cloudOff = 0

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.imageSmoothingEnabled = false
      const nb = W < 700 ? 16 : 24
      if (nb !== B || !tex) {
        B = nb
        tex = buildTextures(B)
      }
    }

    const block = (type, wx, k, x, y) => {
      const v = Math.floor(hash(wx, k + 900) * 3)
      ctx.drawImage(tex[type][v], x, y, B, B)
    }

    const drawSky = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#5a9bea')
      g.addColorStop(0.6, '#9fcdfb')
      g.addColorStop(1, '#cfe8ff')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)

      const s = B * 3
      const sx = W * 0.82
      const sy = H * 0.1
      ctx.fillStyle = 'rgba(255, 251, 208, 0.35)'
      ctx.fillRect(sx - s * 0.35, sy - s * 0.35, s * 1.7, s * 1.7)
      ctx.fillStyle = '#fff7a8'
      ctx.fillRect(sx, sy, s, s)
      ctx.fillStyle = '#fffbd6'
      ctx.fillRect(sx + s * 0.2, sy + s * 0.2, s * 0.6, s * 0.6)
    }

    const drawClouds = () => {
      const CELL = Math.round(B * 1.2)
      const SEG = CELL * 11
      const start = Math.floor(cloudOff / SEG) - 1
      const end = start + Math.ceil(W / SEG) + 2
      for (let s = start; s <= end; s++) {
        if (hash(s, 41) > 0.7) continue
        const w = 4 + Math.floor(hash(s, 42) * 6)
        const h = 2 + Math.floor(hash(s, 43) * 2)
        const ox = s * SEG - cloudOff + hash(s, 44) * (SEG - w * CELL)
        const oy = H * 0.04 + hash(s, 45) * H * 0.28
        for (let cx = 0; cx < w; cx++) {
          for (let cy = 0; cy < h; cy++) {
            const corner = (cx === 0 || cx === w - 1) && (cy === 0 || cy === h - 1)
            if (corner && hash(s * 31 + cx, cy + 50) < 0.6) continue
            ctx.fillStyle = cy === h - 1 ? 'rgba(226, 236, 246, 0.92)' : 'rgba(255, 255, 255, 0.92)'
            ctx.fillRect(Math.floor(ox + cx * CELL), Math.floor(oy + cy * CELL * 0.6), CELL, Math.ceil(CELL * 0.6))
          }
        }
      }
    }

    const drawRange = (off, size, seed, baseFrac, ampFrac, body, top, cap) => {
      const start = Math.floor(off / size)
      const shift = off - start * size
      const cols = Math.ceil(W / size) + 2
      for (let i = 0; i < cols; i++) {
        const wx = start + i
        const n = smooth(wx / 9, seed) * 0.75 + smooth(wx / 3, seed + 1) * 0.25
        const hpx = Math.round((H * baseFrac + n * H * ampFrac) / size) * size
        const x = Math.floor(i * size - shift)
        ctx.fillStyle = body
        ctx.fillRect(x, H - hpx, size + 1, hpx)
        ctx.fillStyle = cap && n > 0.68 ? cap : top
        ctx.fillRect(x, H - hpx, size + 1, size)
      }
    }

    const drawForeground = () => {
      const start = Math.floor(fgOff / B)
      const shift = fgOff - start * B
      const cols = Math.ceil(W / B) + 2

      for (let i = 0; i < cols; i++) {
        const wx = start + i
        const x = Math.floor(i * B - shift)
        const h = fgHeight(wx)
        for (let k = 0; k < h; k++) {
          const y = H - (k + 1) * B
          let type = 'stone'
          if (k === h - 1) type = h <= WATER ? 'sand' : 'grassBlock'
          else if (k >= h - 4) type = h <= WATER ? 'sand' : 'dirt'
          block(type, wx, k, x, y)
        }
        if (h < WATER) {
          ctx.globalAlpha = 0.85
          for (let k = h; k < WATER; k++) block('water', wx, k, x, H - (k + 1) * B)
          ctx.globalAlpha = 1
        }
        // flores
        if (h > WATER && !isTree(wx) && hash(wx, 9) < 0.14) {
          const p = B / PIX
          const fx = x + p * 3
          const fy = H - h * B
          ctx.fillStyle = '#3d7a24'
          ctx.fillRect(fx + p * 0.5, fy - p * 3, p, p * 3)
          ctx.fillStyle = hash(wx, 10) < 0.5 ? '#e0302a' : '#f4d03f'
          ctx.fillRect(fx, fy - p * 5, p * 2, p * 2)
        }
      }

      // árboles (pueden ocupar columnas vecinas)
      for (let i = -3; i < cols + 3; i++) {
        const wx = start + i
        if (!isTree(wx)) continue
        const h = fgHeight(wx)
        const x = Math.floor(i * B - shift)
        const y = (k) => H - (k + 1) * B
        for (let dx = -2; dx <= 2; dx++) {
          block('leaves', wx + dx, h + 3, x + dx * B, y(h + 3))
          block('leaves', wx + dx, h + 4, x + dx * B, y(h + 4))
        }
        for (let dx = -1; dx <= 1; dx++) block('leaves', wx + dx, h + 5, x + dx * B, y(h + 5))
        block('leaves', wx, h + 6, x, y(h + 6))
        for (let k = h; k < h + 5; k++) block('log', wx, k, x, y(k))
      }
    }

    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      fgOff += 38 * dt * speedFactor
      cloudOff += 14 * dt * speedFactor

      drawSky()
      drawClouds()
      drawRange(fgOff * 0.15, Math.round(B * 0.7), 21, 0.18, 0.32, '#97b3cc', '#a9c2d8', '#eef4fa')
      drawRange(fgOff * 0.4, Math.round(B * 0.85), 23, 0.12, 0.18, '#4b7a3a', '#5d9147')
      drawForeground()
      raf = requestAnimationFrame(frame)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(frame)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="mc-background" aria-hidden="true" />
}
