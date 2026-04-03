// src/canvas/scenes/room.js
import { clear, drawRect, drawSprite, drawText } from '../renderer.js'
import { SPRITES, getCharPalette, POOP_SPRITE, POOP_PALETTE, MOP_SPRITE, MOP_PALETTE } from '../sprites.js'

const V_W = 160
const FLOOR_Y = 170

// ── Colors ────────────────────────────────────────────────
const WALL_BG    = '#0e0e1e'
const WALL_DARK  = '#0a0a16'
const FLOOR_BASE = '#1e1610'
const FLOOR_LINE = '#2a2018'
const PLANK_LINE = '#1a1208'

// ── Wall + floor base ──────────────────────────────────────
function drawWall() {
  drawRect(0, 0, V_W, FLOOR_Y, WALL_BG)
  // subtle wall texture lines
  for (let y = 0; y < FLOOR_Y; y += 24) {
    drawRect(0, y, V_W, 1, '#10101e')
  }
  // baseboard
  drawRect(0, FLOOR_Y - 3, V_W, 3, '#1a1420')
  drawRect(0, FLOOR_Y - 4, V_W, 1, '#252030')
}

function drawFloor() {
  drawRect(0, FLOOR_Y, V_W, 70, FLOOR_BASE)
  drawRect(0, FLOOR_Y, V_W, 1, FLOOR_LINE)
  // floorboard planks
  for (let x = 0; x < V_W; x += 32) drawRect(x, FLOOR_Y, 1, 70, PLANK_LINE)
  drawRect(0, FLOOR_Y + 18, V_W, 1, PLANK_LINE)
  drawRect(16, FLOOR_Y + 36, V_W, 1, PLANK_LINE)
  // floor highlight near wall
  drawRect(0, FLOOR_Y + 1, V_W, 1, '#241c12')
}

// ── Furniture pieces ──────────────────────────────────────

function drawWindow(x, y) {
  // curtain rod
  drawRect(x - 8, y - 6, 62, 3, '#4a3a50')
  drawRect(x - 8, y - 7, 62, 1, '#5a4a60')
  // curtains
  drawRect(x - 8, y - 4, 10, 38, '#3a2848')
  drawRect(x - 6, y - 4, 2, 38, '#4a3858')
  drawRect(x + 44, y - 4, 10, 38, '#3a2848')
  drawRect(x + 44, y - 4, 2, 38, '#4a3858')
  // window frame
  drawRect(x - 1, y - 1, 46, 32, '#3a3050')
  // glass panes - night sky
  drawRect(x, y, 44, 30, '#0a0820')
  // stars in window
  drawRect(x + 6, y + 4, 1, 1, '#ffffff')
  drawRect(x + 18, y + 8, 1, 1, '#ddddff')
  drawRect(x + 32, y + 3, 1, 1, '#ffffff')
  drawRect(x + 38, y + 12, 1, 1, '#aaaadd')
  drawRect(x + 12, y + 16, 1, 1, '#ddddff')
  // moon
  drawRect(x + 28, y + 6, 6, 6, '#e8e0c0')
  drawRect(x + 30, y + 5, 4, 1, '#e8e0c0')
  drawRect(x + 29, y + 12, 4, 1, '#e8e0c0')
  drawRect(x + 27, y + 7, 1, 4, '#e8e0c0')
  drawRect(x + 34, y + 7, 1, 4, '#e8e0c0')
  // moon shadow (crescent)
  drawRect(x + 30, y + 7, 3, 3, '#0a0820')
  // dividers
  drawRect(x + 21, y, 2, 30, '#3a3050')
  drawRect(x, y + 14, 44, 2, '#3a3050')
  // moonlight glow on floor
  drawRect(x - 4, FLOOR_Y + 1, 52, 6, '#18161a')
  drawRect(x + 4, FLOOR_Y + 1, 36, 4, '#1c1a20')
}

function drawBed(x, y) {
  // bed frame
  drawRect(x, y, 42, 44, '#2a2030')
  // headboard
  drawRect(x, y, 42, 8, '#3a2840')
  drawRect(x + 2, y + 1, 38, 2, '#4a3850')
  // pillow
  drawRect(x + 3, y + 10, 16, 8, '#e0d8e8')
  drawRect(x + 4, y + 11, 14, 6, '#d0c8d8')
  // blanket
  drawRect(x + 3, y + 18, 36, 24, '#3858a0')
  drawRect(x + 3, y + 18, 36, 3, '#4868b0')
  // blanket fold detail
  drawRect(x + 3, y + 22, 36, 1, '#305090')
  drawRect(x + 10, y + 30, 22, 1, '#305090')
}

function drawPlant(x, y) {
  // pot
  drawRect(x + 2, y + 10, 10, 10, '#6a4030')
  drawRect(x + 1, y + 10, 12, 2, '#7a5040')
  drawRect(x + 3, y + 18, 8, 2, '#5a3020')
  // soil
  drawRect(x + 3, y + 12, 8, 2, '#3a2820')
  // leaves
  drawRect(x + 3, y + 2, 4, 8, '#2a6838')
  drawRect(x + 7, y - 1, 4, 8, '#388848')
  drawRect(x + 1, y + 4, 3, 5, '#1e5828')
  drawRect(x + 9, y + 1, 3, 6, '#2a6838')
  // leaf highlights
  drawRect(x + 4, y + 3, 1, 3, '#48a858')
  drawRect(x + 8, y, 1, 3, '#48a858')
}

function drawSofa(x, y) {
  // sofa body
  drawRect(x, y, 60, 26, '#703828')
  // back cushion
  drawRect(x, y, 60, 8, '#804838')
  drawRect(x + 2, y + 1, 56, 2, '#906050')
  // armrests
  drawRect(x, y, 6, 26, '#804838')
  drawRect(x + 54, y, 6, 26, '#804838')
  // seat cushions
  drawRect(x + 7, y + 10, 22, 15, '#602818')
  drawRect(x + 31, y + 10, 22, 15, '#602818')
  // cushion line
  drawRect(x + 29, y + 8, 2, 17, '#703828')
  // throw pillow
  drawRect(x + 10, y + 4, 8, 8, '#d8a848')
  drawRect(x + 11, y + 5, 6, 6, '#c89838')
}

function drawShelf(x, y) {
  // shelf board
  drawRect(x, y, 55, 3, '#3a2830')
  // brackets
  drawRect(x + 3, y + 3, 3, 8, '#2a1820')
  drawRect(x + 49, y + 3, 3, 8, '#2a1820')
  // items on shelf
  // book 1
  drawRect(x + 6, y - 14, 4, 14, '#c85050')
  drawRect(x + 10, y - 12, 3, 12, '#5090c8')
  drawRect(x + 13, y - 16, 4, 16, '#50a870')
  // vase
  drawRect(x + 20, y - 10, 6, 10, '#d8a060')
  drawRect(x + 19, y - 10, 8, 2, '#c89050')
  drawRect(x + 22, y - 14, 2, 4, '#48a858')
  // frame
  drawRect(x + 30, y - 14, 10, 12, '#3a3050')
  drawRect(x + 31, y - 13, 8, 10, '#806880')
  drawRect(x + 33, y - 11, 4, 6, '#a090b0')
  // small box
  drawRect(x + 44, y - 8, 8, 8, '#887060')
  drawRect(x + 44, y - 8, 8, 2, '#988070')
}

function drawBunkBed(x, y) {
  // frame
  drawRect(x, y, 50, 80, '#483838')
  // rails
  drawRect(x, y, 50, 3, '#584848')
  drawRect(x, y + 38, 50, 3, '#584848')
  // top bunk mattress + blanket
  drawRect(x + 3, y + 4, 43, 32, '#1a1a28')
  drawRect(x + 3, y + 10, 43, 26, '#c85858')  // red blanket
  drawRect(x + 3, y + 10, 43, 3, '#d86868')
  // top pillow
  drawRect(x + 4, y + 5, 14, 6, '#e0d8e8')
  // bottom bunk mattress + blanket
  drawRect(x + 3, y + 42, 43, 34, '#1a1a28')
  drawRect(x + 3, y + 48, 43, 28, '#5070c8') // blue blanket
  drawRect(x + 3, y + 48, 43, 3, '#6080d8')
  // bottom pillow
  drawRect(x + 4, y + 43, 14, 6, '#e0d8e8')
  // ladder
  drawRect(x + 46, y + 4, 3, 74, '#584848')
  for (let ly = y + 14; ly < y + 76; ly += 10) {
    drawRect(x + 44, ly, 8, 2, '#685858')
  }
}

function drawMobile(x, y) {
  // ceiling hook
  drawRect(x + 8, y, 2, 2, '#585058')
  // string
  drawRect(x + 8, y + 2, 1, 14, '#484048')
  // crossbar
  drawRect(x, y + 15, 22, 2, '#585058')
  // strings to ornaments
  drawRect(x + 2, y + 17, 1, 10, '#484048')
  drawRect(x + 19, y + 17, 1, 10, '#484048')
  drawRect(x + 10, y + 17, 1, 7, '#484048')
  // star ornament
  drawRect(x, y + 26, 6, 6, '#e8d050')
  drawRect(x + 2, y + 24, 2, 2, '#e8d050')
  drawRect(x + 2, y + 32, 2, 2, '#e8d050')
  // heart ornament
  drawRect(x + 17, y + 26, 6, 5, '#e05070')
  drawRect(x + 17, y + 26, 2, 2, '#e05070')
  drawRect(x + 21, y + 26, 2, 2, '#e05070')
  // moon ornament
  drawRect(x + 8, y + 23, 6, 6, '#90b0e0')
  drawRect(x + 10, y + 24, 3, 3, '#0e0e1e')
}

function drawToyBox(x, y) {
  // box body
  drawRect(x, y, 32, 24, '#d8a050')
  drawRect(x + 1, y + 1, 30, 22, '#c89040')
  // lid
  drawRect(x - 1, y - 2, 34, 4, '#d8a850')
  drawRect(x + 10, y - 4, 12, 3, '#c89838')
  // handle
  drawRect(x + 13, y - 5, 6, 2, '#a87828')
  // toys poking out
  drawRect(x + 3, y + 4, 6, 6, '#e05060')   // red block
  drawRect(x + 11, y + 6, 5, 4, '#50a0e0')   // blue ball
  drawRect(x + 18, y + 3, 4, 7, '#48b858')   // green stick
  drawRect(x + 24, y + 5, 5, 5, '#e8d050')   // yellow star
}

// ── Wall decorations ──────────────────────────────────────
function drawWallFrame(x, y, w, h) {
  drawRect(x, y, w, h, '#2a2238')
  drawRect(x + 1, y + 1, w - 2, h - 2, '#1a1828')
  // simple "picture" inside
  drawRect(x + 2, y + 2, w - 4, h - 4, '#182030')
  drawRect(x + 3, y + Math.floor(h * 0.5), w - 6, Math.floor(h * 0.3), '#1a2818')
  // tiny moon/sun in picture
  drawRect(x + w - 6, y + 3, 2, 2, '#e8e0c0')
}

function drawRug(x, y, w, h, color1, color2) {
  drawRect(x, y, w, h, color1)
  // border pattern
  drawRect(x + 1, y + 1, w - 2, 1, color2)
  drawRect(x + 1, y + h - 2, w - 2, 1, color2)
  drawRect(x + 1, y + 1, 1, h - 2, color2)
  drawRect(x + w - 2, y + 1, 1, h - 2, color2)
  // center diamond pattern
  const cx = x + Math.floor(w / 2)
  const cy = y + Math.floor(h / 2)
  drawRect(cx - 1, cy - 2, 2, 4, color2)
  drawRect(cx - 2, cy - 1, 4, 2, color2)
}

// ── Room backgrounds ───────────────────────────────────────

export function drawRoomBackground(style) {
  clear('#0a0a14')
  drawWall()
  drawFloor()

  if (style === 'oneroom') {
    drawWindow(58, 14)
    drawBed(4, FLOOR_Y - 44)
    drawPlant(136, FLOOR_Y - 24)
    drawWallFrame(10, 10, 18, 14)
    drawRug(50, FLOOR_Y + 8, 40, 16, '#3a2040', '#5a3060')
  } else if (style === 'minimal') {
    drawWindow(58, 14)
    drawSofa(10, FLOOR_Y - 28)
    drawShelf(72, 70)
    drawPlant(4, FLOOR_Y - 22)
    drawRug(30, FLOOR_Y + 8, 50, 18, '#2a2838', '#404060')
  } else if (style === 'kids') {
    drawBunkBed(4, FLOOR_Y - 82)
    drawMobile(110, 10)
    drawToyBox(82, FLOOR_Y - 24)
    drawWallFrame(64, 10, 16, 12)
    drawRug(60, FLOOR_Y + 6, 44, 20, '#d89040', '#e8a858')
    // star stickers on wall
    drawRect(72, 30, 2, 2, '#e8d060')
    drawRect(100, 20, 2, 2, '#e8d060')
    drawRect(88, 42, 1, 1, '#e8d060')
    drawRect(118, 35, 2, 2, '#90b0e0')
  }
}

// ── Poop positions — seeded random from poop index ────────
function seededRand(seed) {
  let s = seed
  return () => { s = (s * 16807 + 11) % 2147483647; return (s & 0x7fffffff) / 2147483647 }
}

export function drawPoops(poops) {
  poops.forEach((p, i) => {
    // Hash-like seed from index for better distribution
    const seed = ((i + 1) * 48271 ^ (i * 2654435761)) >>> 0
    const rand = seededRand(seed)
    // Burn a few values for better scatter
    rand(); rand(); rand()
    const px = 8 + Math.floor(rand() * 128)     // x: 8~136
    const py = FLOOR_Y + 2 + Math.floor(rand() * 44) // y: floor area
    drawSprite(POOP_SPRITE, POOP_PALETTE, px, py, 2)
  })
}

// ── Character ─────────────────────────────────────────────
export function drawCharacter(characterType, animFrame, vx, vy, nickname) {
  // Nickname above head
  if (nickname) {
    drawText(nickname, vx + 10, vy - 8, { color: '#ddd', align: 'center', size: 5 })
  }
  drawSprite(animFrame, getCharPalette(characterType), vx, vy, 2)
}

// ── Mop (shown during clean animation) ────────────────────
export function drawMop(vx, vy) {
  drawSprite(MOP_SPRITE, MOP_PALETTE, vx, vy, 2)
}

// ── Room thumbnail for onboarding/room-picker ─────────────
export function drawRoomThumbnail(style, x, y, w, h) {
  drawRect(x, y, w, h, WALL_BG)
  const floorStart = y + Math.floor(h * 0.6)
  drawRect(x, floorStart, w, h - (floorStart - y), FLOOR_BASE)
  drawRect(x, floorStart, w, 1, FLOOR_LINE)
  if (style === 'oneroom') {
    drawRect(x + Math.floor(w * 0.25), y + 2, Math.floor(w * 0.5), Math.floor(h * 0.3), '#0a0820')
    // tiny moon
    drawRect(x + Math.floor(w * 0.6), y + 4, 2, 2, '#e8e0c0')
  } else if (style === 'minimal') {
    drawRect(x + 2, y + Math.floor(h * 0.38), w - 4, Math.floor(h * 0.22), '#703828')
  } else if (style === 'kids') {
    drawRect(x + 2, y + 2, Math.floor(w * 0.38), Math.floor(h * 0.72), '#483838')
    drawRect(x + Math.floor(w * 0.5), y + 3, 3, 3, '#e8d050')
  }
}
