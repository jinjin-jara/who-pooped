// src/canvas/scenes/room.js
import { clear, drawRect, drawSprite, drawText } from '../renderer.js'
import { SPRITES, CHAR_PALETTE, POOP_SPRITE, POOP_PALETTE, MOP_SPRITE, MOP_PALETTE } from '../sprites.js'

const V_W = 160
const FLOOR_Y = 170

// ── Wall + floor base ──────────────────────────────────────
function drawWall() {
  drawRect(0, 0, V_W, FLOOR_Y, '#0d0d0d')
}

function drawFloor() {
  drawRect(0, FLOOR_Y, V_W, 70, '#181818')
  drawRect(0, FLOOR_Y, V_W, 1, '#2a2a2a')
  // floorboard dividers
  for (let x = 0; x < V_W; x += 40) drawRect(x, FLOOR_Y, 1, 70, '#222222')
  drawRect(0, FLOOR_Y + 22, V_W, 1, '#222222')
}

// ── Furniture pieces ──────────────────────────────────────
function drawWindow(x, y) {
  drawRect(x, y, 44, 30, '#1a1a2e')
  // frame border (4 sides)
  drawRect(x, y, 44, 1, '#444444')
  drawRect(x, y + 29, 44, 1, '#444444')
  drawRect(x, y, 1, 30, '#444444')
  drawRect(x + 43, y, 1, 30, '#444444')
  // dividers
  drawRect(x + 21, y, 2, 30, '#444444')
  drawRect(x, y + 14, 44, 2, '#444444')
  // curtains
  drawRect(x - 6, y - 2, 8, 34, '#2a2a2a')
  drawRect(x + 42, y - 2, 8, 34, '#2a2a2a')
  drawRect(x - 6, y - 4, 58, 4, '#444444')
}

function drawBed(x, y) {
  drawRect(x, y, 42, 44, '#202020')
  drawRect(x, y, 42, 8, '#2a2a2a')
  drawRect(x + 3, y + 10, 36, 32, '#181818')
  drawRect(x + 3, y + 12, 36, 3, '#333333')
}

function drawPlant(x, y) {
  drawRect(x + 2, y + 10, 10, 8, '#222222')
  drawRect(x + 4, y + 3, 6, 9, '#1a1a1a')
  drawRect(x, y, 7, 6, '#1e1e1e')
  drawRect(x + 7, y - 3, 6, 8, '#1e1e1e')
}

function drawSofa(x, y) {
  drawRect(x, y, 60, 26, '#202020')
  drawRect(x, y, 60, 7, '#282828')
  drawRect(x, y, 5, 26, '#282828')
  drawRect(x + 55, y, 5, 26, '#282828')
  drawRect(x + 6, y + 9, 48, 16, '#1a1a1a')
}

function drawShelf(x, y) {
  drawRect(x, y, 55, 3, '#2a2a2a')
  drawRect(x + 3, y + 3, 3, 10, '#222222')
  drawRect(x + 49, y + 3, 3, 10, '#222222')
  // items on shelf
  drawRect(x + 6, y - 14, 7, 14, '#1a1a1a')
  drawRect(x + 16, y - 10, 10, 10, '#1a1a1a')
  drawRect(x + 29, y - 16, 6, 16, '#1a1a1a')
  drawRect(x + 38, y - 11, 8, 11, '#1a1a1a')
}

function drawBunkBed(x, y) {
  drawRect(x, y, 50, 80, '#252525')
  drawRect(x, y, 50, 4, '#333333')
  drawRect(x, y + 36, 50, 4, '#333333')
  drawRect(x + 3, y + 5, 44, 30, '#1a1a1a')
  drawRect(x + 3, y + 41, 44, 36, '#1a1a1a')
  // ladder
  drawRect(x + 46, y + 5, 3, 75, '#2a2a2a')
  for (let ly = y + 15; ly < y + 75; ly += 12) drawRect(x + 44, ly, 8, 2, '#333333')
}

function drawMobile(x, y) {
  drawRect(x + 5, y, 2, 18, '#333333')
  drawRect(x, y + 17, 20, 1, '#333333')
  drawRect(x + 1, y + 18, 1, 10, '#333333')
  drawRect(x + 18, y + 18, 1, 10, '#333333')
  drawRect(x - 1, y + 27, 6, 6, '#222222')
  drawRect(x + 16, y + 27, 6, 6, '#222222')
}

function drawToyBox(x, y) {
  drawRect(x, y, 32, 24, '#222222')
  drawRect(x, y, 32, 4, '#2a2a2a')
  drawRect(x + 12, y - 4, 10, 5, '#2a2a2a')
  // toys poking out
  drawRect(x + 3, y + 6, 6, 6, '#1a1a1a')
  drawRect(x + 11, y + 8, 5, 4, '#1a1a1a')
  drawRect(x + 18, y + 5, 7, 7, '#1a1a1a')
}

// ── Room backgrounds ───────────────────────────────────────

export function drawRoomBackground(style) {
  clear('#111111')
  drawWall()
  drawFloor()

  if (style === 'oneroom') {
    drawWindow(58, 12)
    drawBed(4, FLOOR_Y - 44)
    drawPlant(136, FLOOR_Y - 22)
  } else if (style === 'minimal') {
    drawWindow(58, 12)
    drawSofa(10, FLOOR_Y - 28)
    drawShelf(82, 36)
  } else if (style === 'kids') {
    drawBunkBed(4, FLOOR_Y - 82)
    drawMobile(110, 14)
    drawToyBox(82, FLOOR_Y - 24)
  }
}

// ── Poop positions (up to 4 poops shown) ──────────────────
const POOP_POSITIONS = [
  { x: 28, y: FLOOR_Y + 8 },
  { x: 80, y: FLOOR_Y + 18 },
  { x: 120, y: FLOOR_Y + 10 },
  { x: 50, y: FLOOR_Y + 26 },
]

export function drawPoops(poops) {
  poops.forEach((_, i) => {
    const pos = POOP_POSITIONS[i % POOP_POSITIONS.length]
    drawSprite(POOP_SPRITE, POOP_PALETTE, pos.x, pos.y, 2)
  })
}

// ── Character ─────────────────────────────────────────────
export function drawCharacter(characterType, animFrame, vx, vy) {
  drawSprite(animFrame, CHAR_PALETTE, vx, vy, 2)
}

// ── Mop (shown during clean animation) ────────────────────
export function drawMop(vx, vy) {
  drawSprite(MOP_SPRITE, MOP_PALETTE, vx, vy, 2)
}

// ── Room thumbnail for onboarding/room-picker ─────────────
export function drawRoomThumbnail(style, x, y, w, h) {
  drawRect(x, y, w, h, '#0d0d0d')
  const floorStart = y + Math.floor(h * 0.6)
  drawRect(x, floorStart, w, h - (floorStart - y), '#181818')
  drawRect(x, floorStart, w, 1, '#2a2a2a')
  if (style === 'oneroom') {
    drawRect(x + Math.floor(w * 0.25), y + 2, Math.floor(w * 0.5), Math.floor(h * 0.3), '#1a1a2e')
  } else if (style === 'minimal') {
    drawRect(x + 2, y + Math.floor(h * 0.38), w - 4, Math.floor(h * 0.22), '#1a1a1a')
  } else if (style === 'kids') {
    drawRect(x + 2, y + 2, Math.floor(w * 0.38), Math.floor(h * 0.72), '#252525')
  }
}
