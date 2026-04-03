// src/screens/street.js
import { getState } from '../state.js'
import { fetchAllUsers, fetchPoopsInHouse } from '../db.js'
import {
  drawStreetBackground, drawHouse, drawPlayerOnStreet,
  getHouseScreenX, getEntryZone, HOUSE_W_EXPORT, HOUSE_GAP_EXPORT
} from '../canvas/scenes/street.js'
import { drawText, drawRect } from '../canvas/renderer.js'
import { SPRITES } from '../canvas/sprites.js'
import { Animator } from '../canvas/animator.js'
import { startLoop } from '../canvas/gameloop.js'
import { navigate } from '../main.js'
import { bindController, unbindController } from '../controller.js'

const WALK_SPEED = 40    // virtual px per second
const CHAR_SCREEN_X = 60 // character's fixed x position on screen

export function mountStreet() {
  const state = getState()
  const overlay = document.getElementById('ui-overlay')
  const btnRow = document.getElementById('btn-row')
  overlay.innerHTML = ''
  btnRow.innerHTML = ''

  let users = []
  let poopCounts = {}
  let scrollX = 0
  let moveDir = 0      // -1, 0, 1
  let nearHouse = null // user object of the house player is in front of

  const idleAnim  = new Animator(SPRITES[state.characterType].idle, 6)
  const walkRAnim = new Animator(SPRITES[state.characterType].walkR, 6)
  const walkLAnim = new Animator(SPRITES[state.characterType].walkL, 6)

  // Load all users and their poop counts
  async function loadWorld() {
    users = await fetchAllUsers()
    // Start scroll at own house
    const myIdx = users.findIndex(u => u.id === state.userId)
    if (myIdx >= 0) scrollX = Math.max(0, myIdx * (HOUSE_W_EXPORT + HOUSE_GAP_EXPORT) - 30)
    // Load poop counts in parallel
    await Promise.all(users.map(async (u) => {
      const p = await fetchPoopsInHouse(u.id)
      poopCounts[u.id] = p.length
    }))
  }
  loadWorld()

  // ── Keyboard input ─────────────────────────────────────
  const keysDown = new Set()
  const onKeyDown = e => keysDown.add(e.key)
  const onKeyUp   = e => keysDown.delete(e.key)
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  // ── Controller: ◀ = walk left, ▶ = walk right, ■ = enter house / go home
  let ctrlDir = 0
  bindController({
    onLeft:    () => { ctrlDir = -1 },
    onLeftUp:  () => { if (ctrlDir === -1) ctrlDir = 0 },
    onRight:   () => { ctrlDir = 1 },
    onRightUp: () => { if (ctrlDir === 1) ctrlDir = 0 },
    onAction:  () => {
      if (nearHouse) {
        if (nearHouse.id === state.userId) navigate('myroom')
        else navigate('otherroom', { targetUser: nearHouse })
      } else {
        navigate('myroom')
      }
    },
  })

  // ── Tick ────────────────────────────────────────────────
  function tick(delta) {
    let dir = ctrlDir
    if (keysDown.has('ArrowLeft') || keysDown.has('a')) dir = -1
    if (keysDown.has('ArrowRight') || keysDown.has('d')) dir = 1
    moveDir = dir

    scrollX += dir * WALK_SPEED * (delta / 1000)
    const minScrollX = -CHAR_SCREEN_X  // allow reaching first house
    const maxScrollX = Math.max(0, users.length * (64 + 16) - CHAR_SCREEN_X)
    if (scrollX < minScrollX) scrollX = minScrollX
    if (scrollX > maxScrollX) scrollX = maxScrollX

    const activeAnim = dir < 0 ? walkLAnim : dir > 0 ? walkRAnim : idleAnim
    activeAnim.tick(delta)

    // Detect near house
    nearHouse = null
    users.forEach((u, i) => {
      const hx = getHouseScreenX(i, scrollX)
      const zone = getEntryZone(hx)
      if (CHAR_SCREEN_X >= zone.left && CHAR_SCREEN_X <= zone.right) {
        nearHouse = u
      }
    })
  }

  // ── Render ──────────────────────────────────────────────
  function render() {
    drawStreetBackground()

    users.forEach((u, i) => {
      const hx = getHouseScreenX(i, scrollX)
      drawHouse(u, hx, u.id === state.userId, poopCounts[u.id] ?? 0)
    })

    const activeAnim = moveDir < 0 ? walkLAnim : moveDir > 0 ? walkRAnim : idleAnim
    drawPlayerOnStreet(activeAnim.currentFrame(), CHAR_SCREEN_X, state.characterType, state.nickname)

    // Holding poop indicator
    if (state.holdingPoop) {
      drawRect(0, 0, 160, 14, '#333333')
      drawText('💩 들고 있음 — 집에 넣어!', 80, 2, { color: '#f39c12', align: 'center', size: 6 })
    }

    // House entry hint
    if (nearHouse) {
      const isOwn = nearHouse.id === state.userId
      const hint = isOwn ? '🏠 내 집' : `${nearHouse.nickname}네`
      drawRect(0, 220, 160, 20, 'rgba(0,0,0,0.7)')
      drawText(hint + ' — ■ 입장', 80, 224, { color: '#fff', align: 'center', size: 6 })
    } else {
      drawText('◀ ▶ 이동  ■ 내 집', 80, 228, { color: '#444', align: 'center', size: 5 })
    }
  }

  // ── Canvas tap to enter house (fallback) ────────────────
  const canvas = document.getElementById('game-canvas')
  function onTap(e) {
    e.preventDefault()
    if (!nearHouse) return
    if (nearHouse.id === state.userId) navigate('myroom')
    else navigate('otherroom', { targetUser: nearHouse })
  }
  canvas.addEventListener('click', onTap)
  canvas.addEventListener('touchend', onTap, { passive: false })

  startLoop(tick, render)

  return () => {
    unbindController()
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    canvas.removeEventListener('click', onTap)
    canvas.removeEventListener('touchend', onTap)
    overlay.innerHTML = ''
    btnRow.innerHTML = ''
  }
}
