// src/canvas/scenes/street.js
import { clear, drawRect, drawSprite, drawText } from '../renderer.js'
import { getCharPalette } from '../sprites.js'

const V_W = 160
const GROUND_Y = 178
const HOUSE_W = 64
const HOUSE_GAP = 16

// House accent colors (cycle through for variety)
const HOUSE_COLORS = [
  { roof: '#6a3848', roofLight: '#7a4858', wall: '#2a2230', door: '#3a5880' },
  { roof: '#385868', roofLight: '#486878', wall: '#202830', door: '#8a5838' },
  { roof: '#4a5838', roofLight: '#5a6848', wall: '#222820', door: '#a85848' },
  { roof: '#5a3858', roofLight: '#6a4868', wall: '#282030', door: '#48a870' },
  { roof: '#585838', roofLight: '#686848', wall: '#282820', door: '#7070a8' },
]

// ── Street background ──────────────────────────────────────
export function drawStreetBackground() {
  // Sky gradient (dark navy to lighter horizon)
  const skyColors = ['#040410', '#060818', '#0a0c20', '#0e1028', '#101430', '#141838', '#182040', '#1c2448', '#202850']
  const bandH = Math.ceil(GROUND_Y / skyColors.length)
  skyColors.forEach((c, i) => drawRect(0, i * bandH, V_W, bandH + 1, c))

  // Moon — crescent
  const mx = 122, my = 12
  // Full circle
  drawRect(mx + 2, my, 6, 1, '#e8e0c8')
  drawRect(mx + 1, my + 1, 8, 1, '#e8e0c8')
  drawRect(mx, my + 2, 10, 1, '#e8e0c8')
  drawRect(mx, my + 3, 10, 1, '#e8e0c8')
  drawRect(mx, my + 4, 10, 1, '#e8e0c8')
  drawRect(mx, my + 5, 10, 1, '#e8e0c8')
  drawRect(mx, my + 6, 10, 1, '#e8e0c8')
  drawRect(mx, my + 7, 10, 1, '#e8e0c8')
  drawRect(mx + 1, my + 8, 8, 1, '#e8e0c8')
  drawRect(mx + 2, my + 9, 6, 1, '#e8e0c8')
  // Shadow to make crescent — overlaps right side with sky color
  const sky = '#182040'
  drawRect(mx + 4, my, 6, 1, sky)
  drawRect(mx + 3, my + 1, 6, 1, sky)
  drawRect(mx + 3, my + 2, 7, 1, sky)
  drawRect(mx + 2, my + 3, 8, 1, sky)
  drawRect(mx + 2, my + 4, 8, 1, sky)
  drawRect(mx + 2, my + 5, 8, 1, sky)
  drawRect(mx + 2, my + 6, 8, 1, sky)
  drawRect(mx + 3, my + 7, 7, 1, sky)
  drawRect(mx + 3, my + 8, 6, 1, sky)
  drawRect(mx + 4, my + 9, 6, 1, sky)
  // Glow
  drawRect(mx - 2, my - 1, 14, 12, 'rgba(200,190,160,0.04)')

  // Stars (scattered, varied brightness)
  const stars = [
    [8, 6, 1, '#ffffff'], [30, 18, 1, '#ddddff'], [55, 10, 1, '#ffffff'],
    [78, 22, 1, '#aaaadd'], [95, 8, 1, '#ffffff'], [140, 28, 1, '#ddddff'],
    [18, 38, 1, '#aaaadd'], [68, 32, 1, '#ddddff'], [108, 42, 1, '#ffffff'],
    [42, 5, 1, '#ffffff'], [150, 12, 1, '#aaaadd'], [5, 25, 1, '#ddddff'],
    [88, 48, 1, '#aaaacc'], [135, 40, 1, '#ffffff'], [25, 50, 1, '#aaaadd'],
    [112, 15, 2, '#ffffff'], [48, 28, 2, '#eeeeff'],  // two brighter stars
  ]
  stars.forEach(([sx, sy, sz, sc]) => drawRect(sx, sy, sz, sz, sc))

  // Ground
  drawRect(0, GROUND_Y, V_W, 62, '#141210')
  drawRect(0, GROUND_Y, V_W, 1, '#2a2420')
  // sidewalk
  drawRect(0, GROUND_Y + 1, V_W, 8, '#1a1810')
  drawRect(0, GROUND_Y + 9, V_W, 1, '#201c14')
  // cobblestone hint on sidewalk
  for (let cx = 4; cx < V_W; cx += 12) {
    drawRect(cx, GROUND_Y + 3, 6, 1, '#201c14')
    drawRect(cx + 3, GROUND_Y + 6, 6, 1, '#201c14')
  }
  // path/road below sidewalk
  drawRect(0, GROUND_Y + 10, V_W, 1, '#181410')
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
  const roofPeak = wallY - 18
  const colors = HOUSE_COLORS[Math.abs(Math.round(houseX * 7 + 13)) % HOUSE_COLORS.length]

  const mid = houseX + HOUSE_W / 2

  // Roof (triangle approximation)
  for (let i = 0; i <= 18; i++) {
    const c = i < 2 ? colors.roofLight : colors.roof
    drawRect(mid - i - 1, roofPeak + i, (i + 1) * 2, 1, c)
  }
  // roof edge highlight
  drawRect(mid - 1, roofPeak, 2, 1, colors.roofLight)

  // Chimney — sits on the roof slope
  const chimneyX = mid - 10
  const roofYAtChimney = roofPeak + (mid - chimneyX)
  const chimneyTop = roofPeak - 6
  drawRect(chimneyX, chimneyTop, 6, roofYAtChimney - chimneyTop, colors.roof)
  drawRect(chimneyX - 1, chimneyTop, 8, 2, colors.roofLight)
  // smoke puffs
  drawRect(chimneyX + 1, chimneyTop - 4, 2, 2, '#2a2838')
  drawRect(chimneyX + 3, chimneyTop - 8, 3, 3, '#22222e')

  // Wall
  const wallColor = isOwn ? '#302838' : colors.wall
  drawRect(houseX, wallY, HOUSE_W, 42, wallColor)
  // wall base
  drawRect(houseX, wallY + 38, HOUSE_W, 4, isOwn ? '#282030' : '#1a1820')

  // Door
  const doorX = houseX + Math.floor(HOUSE_W / 2) - 7
  drawRect(doorX, wallY + 16, 14, 26, colors.door)
  drawRect(doorX + 1, wallY + 17, 12, 24, '#0a0a14')
  // door frame
  drawRect(doorX, wallY + 16, 14, 2, colors.door)
  drawRect(doorX, wallY + 16, 2, 26, colors.door)
  drawRect(doorX + 12, wallY + 16, 2, 26, colors.door)
  // doorknob
  drawRect(doorX + 10, wallY + 28, 2, 2, '#c8b870')
  // door light
  drawRect(doorX + 3, wallY + 20, 8, 1, '#181828')

  // Windows (warm light inside)
  // left window
  drawRect(houseX + 5, wallY + 4, 16, 14, '#1a1828')
  drawRect(houseX + 6, wallY + 5, 14, 12, '#282840')
  // warm glow
  drawRect(houseX + 7, wallY + 6, 5, 10, '#302820')
  drawRect(houseX + 14, wallY + 6, 5, 10, '#302820')
  // dividers
  drawRect(houseX + 13, wallY + 4, 1, 14, '#1a1828')
  drawRect(houseX + 5, wallY + 10, 16, 1, '#1a1828')

  // right window
  drawRect(houseX + HOUSE_W - 21, wallY + 4, 16, 14, '#1a1828')
  drawRect(houseX + HOUSE_W - 20, wallY + 5, 14, 12, '#282840')
  drawRect(houseX + HOUSE_W - 19, wallY + 6, 5, 10, '#302820')
  drawRect(houseX + HOUSE_W - 12, wallY + 6, 5, 10, '#302820')
  drawRect(houseX + HOUSE_W - 13, wallY + 4, 1, 14, '#1a1828')
  drawRect(houseX + HOUSE_W - 21, wallY + 10, 16, 1, '#1a1828')

  // Window sill / flower box
  drawRect(houseX + 4, wallY + 18, 18, 2, '#3a3040')
  // tiny flower
  drawRect(houseX + 8, wallY + 16, 2, 2, '#e05070')
  drawRect(houseX + 12, wallY + 15, 2, 3, '#e8d050')
  drawRect(houseX + 9, wallY + 18, 1, 2, '#2a6838')
  drawRect(houseX + 13, wallY + 17, 1, 3, '#2a6838')

  // Ground decoration (tiny fence/path)
  drawRect(houseX + 2, GROUND_Y - 1, HOUSE_W - 4, 1, '#2a2420')

  // Own house glow
  if (isOwn) {
    drawRect(houseX + HOUSE_W / 2 - 4, wallY + 14, 8, 2, '#e8d870')
    drawRect(houseX + HOUSE_W / 2 - 3, wallY + 12, 6, 2, '#c8b850')
  }

  // Nickname
  const label = user.nickname.length > 6 ? user.nickname.slice(0, 6) + '\u2026' : user.nickname
  drawText(label, houseX + HOUSE_W / 2, GROUND_Y + 12, {
    color: isOwn ? '#c8b870' : '#686058',
    align: 'center',
    size: 5,
  })

  // Poop count badge
  if (poopCount > 0) {
    drawRect(houseX + HOUSE_W - 16, wallY - 2, 16, 12, '#4a2020')
    drawRect(houseX + HOUSE_W - 16, wallY - 2, 16, 1, '#6a3030')
    drawText(`\uD83D\uDCA9${poopCount}`, houseX + HOUSE_W - 14, wallY - 1, { color: '#ff6b6b', size: 7 })
  }
}

// ── Player character on street ─────────────────────────────
export function drawPlayerOnStreet(animFrame, charScreenX, characterType, nickname) {
  if (nickname) {
    drawText(nickname, charScreenX + 10, GROUND_Y - 38, { color: '#ddd', align: 'center', size: 5 })
  }
  drawSprite(animFrame, getCharPalette(characterType), charScreenX, GROUND_Y - 30, 2)
}

// ── Entry zone for a house ─────────────────────────────────
export function getEntryZone(houseX) {
  const doorX = houseX + Math.floor(HOUSE_W / 2)
  return { left: doorX - 10, right: doorX + 10 }
}
