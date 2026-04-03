// src/screens/otherroom.js
import { getState, setState, canPoop, recordPoop, poopCooldownRemaining } from '../state.js'
import { createPoop, fetchPoopsInHouse } from '../db.js'
import { joinRoomChannel, leaveRoomChannel, broadcastPoop, broadcastKick } from '../realtime.js'
import { drawRoomBackground, drawPoops, drawCharacter } from '../canvas/scenes/room.js'
import { drawText, drawRect } from '../canvas/renderer.js'
import { SPRITES } from '../canvas/sprites.js'
import { Animator } from '../canvas/animator.js'
import { startLoop } from '../canvas/gameloop.js'
import { navigate } from '../main.js'

const VISITOR_X = 38
const OWNER_X   = 92
const CHAR_Y    = 136

export function mountOtherRoom({ targetUser }) {
  const state = getState()
  const overlay = document.getElementById('ui-overlay')
  const btnRow  = document.getElementById('btn-row')
  overlay.innerHTML = ''
  btnRow.innerHTML  = ''

  let poops       = []
  let ownerPresent = false
  let visitorAction = 'idle'   // 'idle' | 'poop' | 'kicked'
  let ownerAction   = 'idle'   // 'idle' | 'kick'
  let kickedTimer   = 0        // ms remaining for kicked anim before exit
  let poopTimer     = 0        // ms remaining for poop animation

  const myType    = state.characterType
  const ownerType = targetUser.character_type

  const myIdle    = new Animator(SPRITES[myType].idle,    6)
  const myPoop    = new Animator(SPRITES[myType].poop,    6)
  const myKicked  = new Animator(SPRITES[myType].kicked,  6)
  const ownerIdle = new Animator(SPRITES[ownerType].idle, 6)
  const ownerKick = new Animator(SPRITES[ownerType].kick, 6)

  async function refreshPoops() {
    poops = await fetchPoopsInHouse(targetUser.id)
    renderButtons()
  }
  refreshPoops()

  // Auto-deposit if player carried a poop here from their own room
  const entryState = getState()
  if (entryState.holdingPoop && state.userId !== targetUser.id) {
    setState({ holdingPoop: false })
    // Brief delay so the screen renders first
    setTimeout(async () => {
      await createPoop(targetUser.id, state.userId)
      recordPoop()
      broadcastPoop(targetUser.id, state.userId)
      await refreshPoops()
    }, 200)
  }

  // Cooldown interval to update button label
  const cooldownInterval = setInterval(() => renderButtons(), 1000)

  // Realtime
  joinRoomChannel(targetUser.id, {
    onPoop:     ()         => refreshPoops(),
    onClean:    ()         => refreshPoops(),
    onPresence: (list)     => {
      ownerPresent = list.some(p => p.userId === targetUser.id)
      renderButtons()
    },
    onKick:     (targetId) => {
      if (targetId === state.userId) startKickedSequence()
    },
  })

  function startKickedSequence() {
    visitorAction = 'kicked'
    myKicked.reset()
    kickedTimer   = 1200
    renderButtons()
  }

  // ── Tick ────────────────────────────────────────────────
  function tick(delta) {
    ;[myIdle, myPoop, myKicked, ownerIdle, ownerKick].forEach(a => a.tick(delta))

    if (poopTimer > 0) {
      poopTimer -= delta
      if (poopTimer <= 0) {
        poopTimer = 0
        visitorAction = 'idle'
        renderButtons()
      }
    }

    if (kickedTimer > 0) {
      kickedTimer -= delta
      if (kickedTimer <= 0) navigate('street')
    }
  }

  // ── Render ──────────────────────────────────────────────
  function render() {
    drawRoomBackground(targetUser.room_style)
    drawPoops(poops)

    // Visitor
    const myAnim = visitorAction === 'poop'   ? myPoop
                 : visitorAction === 'kicked' ? myKicked
                 : myIdle
    drawCharacter(myType, myAnim.currentFrame(), VISITOR_X, CHAR_Y)

    // Owner (if in room)
    if (ownerPresent) {
      const owAnim = ownerAction === 'kick' ? ownerKick : ownerIdle
      drawCharacter(ownerType, owAnim.currentFrame(), OWNER_X, CHAR_Y)
    }

    // Labels
    drawText(`${targetUser.nickname}의 집`, 80, 4, { color: '#555555', align: 'center', size: 5 })

    // Cooldown display
    const remaining = poopCooldownRemaining()
    if (remaining > 0) {
      drawRect(0, 0, 160, 14, '#2a0000')
      drawText(`⏳ ${formatCooldown(remaining)}`, 80, 2, { color: '#ff6b6b', align: 'center', size: 7 })
    }

    // Poop count
    if (poops.length > 0) {
      drawRect(2, 16, 36, 12, '#333333')
      drawText(`💩 x${poops.length}`, 4, 17, { color: '#ff6b6b', size: 8 })
    }
  }

  // ── Buttons ────────────────────────────────────────────
  function renderButtons() {
    btnRow.innerHTML = ''

    const isPoooping = visitorAction === 'poop'
    const isKicked   = visitorAction === 'kicked'
    const poopReady  = canPoop()
    const remaining  = poopCooldownRemaining()

    // Poop button (only for visitors, not owner)
    if (state.userId !== targetUser.id) {
      const poopLabel = poopReady ? '똥 싸기' : formatCooldown(remaining)
      const poopBtn = makeBtn('💩', poopLabel, !poopReady || isPoooping || isKicked, handlePoop)
      btnRow.appendChild(poopBtn)
    }

    // Kick button (only shown to the house owner when they are present)
    if (state.userId === targetUser.id && ownerPresent) {
      const kickBtn = makeBtn('👟', '걷어차기', false, handleKick)
      btnRow.appendChild(kickBtn)
    }

    const exitBtn = makeBtn('🚪', '나가기', isKicked, () => navigate('street'))
    btnRow.appendChild(exitBtn)
  }

  async function handlePoop() {
    if (!canPoop() || visitorAction !== 'idle') return
    visitorAction = 'poop'
    poopTimer = 900 // ms — show poop animation
    myPoop.reset()
    renderButtons()

    await createPoop(targetUser.id, state.userId)
    recordPoop()
    broadcastPoop(targetUser.id, state.userId)
    await refreshPoops()
  }

  function handleKick() {
    ownerAction = 'kick'
    ownerKick.reset()
    broadcastKick(targetUser.id, state.userId)
    setTimeout(() => { ownerAction = 'idle' }, 600)
  }

  startLoop(tick, render)
  renderButtons()

  return () => {
    leaveRoomChannel(targetUser.id)
    clearInterval(cooldownInterval)
    overlay.innerHTML = ''
    btnRow.innerHTML  = ''
  }
}

function formatCooldown(ms) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

function makeBtn(icon, label, disabled, onClick) {
  const btn = document.createElement('button')
  btn.className = 'action-btn'
  btn.disabled = disabled
  btn.innerHTML = `${icon}<span class="btn-label">${label}</span>`
  btn.onclick = onClick
  return btn
}
