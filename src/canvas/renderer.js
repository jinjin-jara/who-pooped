// src/canvas/renderer.js

// Virtual resolution the game is designed at
export const V_WIDTH = 160
export const V_HEIGHT = 240

// Internal canvas renders at 2× for crisper text
const S = 2

let canvas, ctx

export async function initRenderer() {
  canvas = document.getElementById('game-canvas')
  ctx = canvas.getContext('2d')
  canvas.width = V_WIDTH * S
  canvas.height = V_HEIGHT * S
  ctx.imageSmoothingEnabled = false

  // Wait for pixel font to load
  try {
    await document.fonts.load('10px Mona10')
  } catch { /* font optional — falls back to monospace */ }
}

export function clear(color = '#111111') {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, V_WIDTH * S, V_HEIGHT * S)
}

export function drawRect(vx, vy, vw, vh, color) {
  ctx.fillStyle = color
  ctx.fillRect(
    Math.floor(vx * S),
    Math.floor(vy * S),
    Math.ceil(vw * S),
    Math.ceil(vh * S),
  )
}

export function drawSprite(data, palette, vx, vy, pixelSize = 1) {
  const ps = pixelSize * S
  for (let row = 0; row < data.length; row++) {
    const line = data[row]
    for (let col = 0; col < line.length; col++) {
      const ch = line[col]
      if (ch === '.' || !palette[ch]) continue
      ctx.fillStyle = palette[ch]
      ctx.fillRect(
        Math.floor((vx + col * pixelSize) * S),
        Math.floor((vy + row * pixelSize) * S),
        ps,
        ps,
      )
    }
  }
}

// Draw text using the Korean pixel font (Galmuri9)
// Falls back to monospace if font didn't load
export function drawText(text, vx, vy, { color = '#fff', size = 6, align = 'left' } = {}) {
  const fs = size * S
  ctx.fillStyle = color
  ctx.font = `${fs}px Mona10, "Courier New", monospace`
  ctx.textAlign = align
  ctx.textBaseline = 'top'
  ctx.fillText(text, Math.floor(vx * S), Math.floor(vy * S))
}

export function getCtx() { return ctx }
export function getCanvas() { return canvas }
