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

  // ── Touch buttons ──────────────────────────────────────
  let touchDir = 0
  const leftBtn  = makeBtn('◀', '', false, null)
  const rightBtn = makeBtn('▶', '', false, null)
  const homeBtn  = makeBtn('🏠', '집', false, () => navigate('myroom'))

  leftBtn.addEventListener('touchstart',  () => { touchDir = -1 }, { passive: true })
  leftBtn.addEventListener('touchend',    () => { if (touchDir === -1) touchDir = 0 })
  leftBtn.addEventListener('mousedown',   () => { touchDir = -1 })
  leftBtn.addEventListener('mouseup',     () => { if (touchDir === -1) touchDir = 0 })
  rightBtn.addEventListener('touchstart', () => { touchDir = 1 }, { passive: true })
  rightBtn.addEventListener('touchend',   () => { if (touchDir === 1) touchDir = 0 })
  rightBtn.addEventListener('mousedown',  () => { touchDir = 1 })
  rightBtn.addEventListener('mouseup',    () => { if (touchDir === 1) touchDir = 0 })

  btnRow.append(leftBtn, rightBtn, homeBtn)

  // ── Tick ────────────────────────────────────────────────
  function tick(delta) {
    let dir = touchDir
    if (keysDown.has('ArrowLeft') || keysDown.has('a')) dir = -1
    if (keysDown.has('ArrowRight') || keysDown.has('d')) dir = 1
    moveDir = dir

    scrollX += dir * WALK_SPEED * (delta / 1000)
    if (scrollX < 0) scrollX = 0

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
    drawPlayerOnStreet(activeAnim.currentFrame(), CHAR_SCREEN_X)

    // Holding poop indicator
    if (state.holdingPoop) {
      drawRect(0, 0, 160, 14, '#333333')
      drawText('💩 들고 있음 — 집에 넣어!', 80, 2, { color: '#f39c12', align: 'center', size: 6 })
    }

    // House entry hint
    if (nearHouse) {
      const isOwn = nearHouse.id === state.userId
      const hint = isOwn ? '🏠 내 집' : `👆 ${nearHouse.nickname}네`
      drawRect(0, 220, 160, 20, 'rgba(0,0,0,0.7)')
      drawText(hint + ' — 탭해서 입장', 80, 223, { color: '#fff', align: 'center', size: 6 })
    }
  }

  // ── Canvas tap to enter house ───────────────────────────
  const canvas = document.getElementById('game-canvas')
  function onTap(e) {
    e.preventDefault()
    if (!nearHouse) return
    if (nearHouse.id === state.userId) {
      navigate('myroom')
    } else {
      navigate('otherroom', { targetUser: nearHouse })
    }
  }
  canvas.addEventListener('click', onTap)
  canvas.addEventListener('touchend', onTap, { passive: false })

  startLoop(tick, render)

  return () => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    canvas.removeEventListener('click', onTap)
    canvas.removeEventListener('touchend', onTap)
    overlay.innerHTML = ''
    btnRow.innerHTML = ''
  }
}

function makeBtn(icon, label, disabled, onClick) {
  const btn = document.createElement('button')
  btn.className = 'action-btn'
  btn.disabled = disabled
  btn.innerHTML = icon + (label ? `<span class="btn-label">${label}</span>` : '')
  if (onClick) btn.onclick = onClick
  return btn
}
