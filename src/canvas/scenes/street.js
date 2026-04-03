// src/canvas/scenes/street.js
import { clear, drawRect, drawSprite, drawText } from '../renderer.js'
import { CHAR_PALETTE } from '../sprites.js'

const V_W = 160
const GROUND_Y = 178
const HOUSE_W = 64
const HOUSE_GAP = 16

// ── Street background ──────────────────────────────────────
export function drawStreetBackground() {
  // Dark sky
  drawRect(0, 0, V_W, GROUND_Y, '#080810')
  // Stars (fixed positions)
  const stars = [[10,8],[35,20],[70,12],[100,5],[140,18],[20,35],[85,28],[130,8],[55,42],[115,36]]
  stars.forEach(([sx, sy]) => drawRect(sx, sy, 1, 1, '#ffffff'))
  // Ground
  drawRect(0, GROUND_Y, V_W, 62, '#181818')
  drawRect(0, GROUND_Y, V_W, 1, '#2a2a2a')
  drawRect(0, GROUND_Y + 8, V_W, 1, '#222222') // sidewalk line
}

// ── House ─────────────────────────────────────────────────
export const HOUSE_W_EXPORT = HOUSE_W
export const HOUSE_GAP_EXPORT = HOUSE_GAP

export function getHouseScreenX(index, scrollX) {
  return index * (HOUSE_W + HOUSE_GAP) - scrollX
}

export function drawHouse(user, houseX, isOwn, poopCount) {
  // Cull offscreen
  if (houseX > V_W + HOUSE_W || houseX < -HOUSE_W) return

  const wallY = GROUND_Y - 42
  const roofPeak = wallY - 16

  // Roof (triangle approximation with rects)
  const mid = houseX + HOUSE_W / 2
  for (let i = 0; i <= 16; i++) {
    const rowColor = i < 2 ? '#555555' : '#3a3a3a'
    drawRect(mid - i, roofPeak + i, i * 2, 1, rowColor)
  }

  // Wall
  drawRect(houseX, wallY, HOUSE_W, 42, isOwn ? '#333333' : '#252525')

  // Door
  const doorX = houseX + Math.floor(HOUSE_W / 2) - 6
  drawRect(doorX, wallY + 18, 12, 24, '#111111')
  drawRect(doorX + 9, wallY + 28, 2, 2, '#555555')

  // Windows (two small ones)
  drawRect(houseX + 6, wallY + 4, 14, 12, '#1a1a2e')
  drawRect(houseX + 13, wallY + 4, 1, 12, '#333333')
  drawRect(houseX + 6, wallY + 9, 14, 1, '#333333')

  drawRect(houseX + HOUSE_W - 20, wallY + 4, 14, 12, '#1a1a2e')
  drawRect(houseX + HOUSE_W - 13, wallY + 4, 1, 12, '#333333')
  drawRect(houseX + HOUSE_W - 20, wallY + 9, 14, 1, '#333333')

  // Nickname
  const label = user.nickname.length > 6 ? user.nickname.slice(0, 6) + '…' : user.nickname
  drawText(label, houseX + HOUSE_W / 2, GROUND_Y + 10, { color: isOwn ? '#aaaaaa' : '#555555', align: 'center', size: 5 })

  // Poop count badge
  if (poopCount > 0) {
    drawRect(houseX + HOUSE_W - 14, wallY, 14, 10, '#333333')
    drawText(`💩${poopCount}`, houseX + HOUSE_W - 12, wallY + 1, { color: '#ff6b6b', size: 7 })
  }
}

// ── Player character on street ─────────────────────────────
export function drawPlayerOnStreet(animFrame, charScreenX) {
  drawSprite(animFrame, CHAR_PALETTE, charScreenX, GROUND_Y - 30, 2)
}

// ── Entry zone for a house ─────────────────────────────────
export function getEntryZone(houseX) {
  const doorX = houseX + Math.floor(HOUSE_W / 2)
  return { left: doorX - 10, right: doorX + 10 }
}
