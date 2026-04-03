// src/canvas/renderer.js

// Virtual resolution the game is designed at
export const V_WIDTH = 160
export const V_HEIGHT = 240

let canvas, ctx

export function initRenderer() {
  canvas = document.getElementById('game-canvas')
  ctx = canvas.getContext('2d')
  // Set virtual resolution
  canvas.width = V_WIDTH
  canvas.height = V_HEIGHT
}

export function clear(color = '#111111') {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT)
}

// Draw a filled rectangle in virtual pixels
export function drawRect(vx, vy, vw, vh, color) {
  ctx.fillStyle = color
  ctx.fillRect(Math.floor(vx), Math.floor(vy), Math.ceil(vw), Math.ceil(vh))
}

// Draw a sprite: data is array of strings, each char = pixel color code
// palette maps char → CSS color, '.' = transparent (skip)
// vx, vy = top-left virtual position
// pixelSize = how many virtual pixels wide/tall each sprite pixel is (default 1)
export function drawSprite(data, palette, vx, vy, pixelSize = 1) {
  for (let row = 0; row < data.length; row++) {
    const line = data[row]
    for (let col = 0; col < line.length; col++) {
      const ch = line[col]
      if (ch === '.' || !palette[ch]) continue
      ctx.fillStyle = palette[ch]
      ctx.fillRect(
        Math.floor(vx + col * pixelSize),
        Math.floor(vy + row * pixelSize),
        pixelSize,
        pixelSize
      )
    }
  }
}

// Draw text using Canvas built-in font
export function drawText(text, vx, vy, { color = '#fff', size = 6, align = 'left' } = {}) {
  ctx.fillStyle = color
  ctx.font = `${size}px "Courier New", monospace`
  ctx.textAlign = align
  ctx.textBaseline = 'top'
  ctx.fillText(text, vx, vy)
}

export function getCtx() { return ctx }
export function getCanvas() { return canvas }
