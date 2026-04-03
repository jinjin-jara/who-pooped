// src/screens/onboarding.js
import { setState } from '../state.js'
import { createUser, fetchUserByNickname } from '../db.js'
// import { initFrame } from '../frame.js'
import { navigate } from '../main.js'
import { clear, drawRect, drawSprite, drawText } from '../canvas/renderer.js'
import { SPRITES, getCharPalette } from '../canvas/sprites.js'
import { drawRoomBackground } from '../canvas/scenes/room.js'
import { startLoop } from '../canvas/gameloop.js'
import { Animator } from '../canvas/animator.js'
import { bindController, unbindController } from '../controller.js'

const CHARACTERS = ['cat', 'rabbit', 'bear', 'dog', 'duck', 'penguin']
const COLORS = ['pink', 'purple', 'orange', 'mint', 'blue', 'yellow']
const COLOR_HEX = {
  pink: '#ff69b4', purple: '#9b59b6', orange: '#f39c12',
  mint: '#1abc9c', blue: '#3498db', yellow: '#f1c40f',
}
const ROOM_STYLES = ['oneroom', 'minimal', 'kids']
const ROOM_LABELS = { oneroom: '원룸', minimal: '미니멀', kids: '어린이방' }

export function mountOnboarding() {
  let step = 'nickname'
  let nickname = ''
  let charIdx = 0
  let roomIdx = 0
  let loading = false

  const overlay = document.getElementById('ui-overlay')
  const btnRow = document.getElementById('btn-row')
  overlay.innerHTML = ''
  btnRow.innerHTML = ''

  // ── Nickname step: DOM overlay ──────────────────────────
  const form = document.createElement('div')
  form.style.cssText = `
    position:absolute;inset:0;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:14px;padding:24px;
    background:rgba(0,0,0,0.92);
  `
  const title = document.createElement('div')
  title.style.cssText = 'color:#eee;font-size:16px;font-family:monospace;letter-spacing:2px;'
  title.textContent = 'WHO POOPED?'

  const input = document.createElement('input')
  input.type = 'text'
  input.maxLength = 10
  input.placeholder = '닉네임 입력 (10자 이내)'
  input.style.cssText = `
    background:#222;border:2px solid #444;color:#eee;font-family:monospace;
    font-size:14px;padding:10px 14px;border-radius:6px;width:100%;
    text-align:center;outline:none;
  `

  const errDiv = document.createElement('div')
  errDiv.style.cssText = 'color:#ff6b6b;font-size:10px;font-family:monospace;min-height:14px;'

  const confirmBtn = document.createElement('button')
  confirmBtn.textContent = '확인 →'
  confirmBtn.style.cssText = `
    background:#444;border:none;color:#eee;font-family:monospace;font-size:13px;
    padding:10px 0;border-radius:6px;cursor:pointer;width:100%;
  `
  confirmBtn.onclick = handleNicknameConfirm

  form.append(title, input, errDiv, confirmBtn)
  overlay.appendChild(form)

  async function handleNicknameConfirm() {
    const val = input.value.trim()
    if (!val) { errDiv.textContent = '닉네임을 입력해줘!'; return }
    if (loading) return
    loading = true
    confirmBtn.textContent = '확인 중...'
    errDiv.textContent = ''
    const existing = await fetchUserByNickname(val)
    if (existing) {
      errDiv.textContent = '이미 쓰는 닉네임이야!'
      loading = false
      confirmBtn.textContent = '확인 →'
      return
    }
    nickname = val
    loading = false
    overlay.innerHTML = ''
    step = 'character'
    setupController()
  }

  // ── Animators for character preview ─────────────────────
  const charAnimators = {}
  CHARACTERS.forEach(c => { charAnimators[c] = new Animator(SPRITES[c].idle, 6) })

  // ── Controller binding per step ─────────────────────────
  function setupController() {
    bindController({
      onLeft:   () => handleNav(-1),
      onRight:  () => handleNav(1),
      onAction: () => handleNext(),
    })
  }

  function handleNav(dir) {
    if (step === 'character') {
      charIdx = (charIdx + dir + CHARACTERS.length) % CHARACTERS.length
    } else if (step === 'roomstyle') {
      roomIdx = (roomIdx + dir + ROOM_STYLES.length) % ROOM_STYLES.length
    }
  }

  async function handleNext() {
    if (step === 'character') { step = 'roomstyle'; return }
    if (step === 'roomstyle') {
      if (loading) return
      loading = true
      try {
        const user = await createUser({
          nickname,
          characterType: CHARACTERS[charIdx],
          frameColor: 'pink',
          roomStyle: ROOM_STYLES[roomIdx],
        })
        setState({
          userId: user.id,
          nickname,
          characterType: CHARACTERS[charIdx],
          frameColor: 'pink',
          roomStyle: ROOM_STYLES[roomIdx],
        })
        navigate('myroom')
      } catch {
        loading = false
      }
    }
  }

  // ── Canvas render ────────────────────────────────────────
  function tick(delta) {
    if (step === 'nickname') return
    CHARACTERS.forEach(c => charAnimators[c].tick(delta))
  }

  function render() {
    if (step === 'nickname') return
    clear('#111111')

    if (step === 'character') {
      drawText('캐릭터 선택', 80, 8, { color: '#aaa', align: 'center', size: 7 })
      drawText('◀ ▶ 선택  ■ 확인', 80, 225, { color: '#555', align: 'center', size: 5 })

      const ch = CHARACTERS[charIdx]
      // Big centered preview
      drawRect(48, 40, 64, 80, '#1a1a2a')
      drawSprite(charAnimators[ch].currentFrame(), getCharPalette(ch), 50, 48, 4)
      drawText(ch, 80, 126, { color: '#fff', align: 'center', size: 7 })

      // Small previews on sides
      const prevIdx = (charIdx - 1 + CHARACTERS.length) % CHARACTERS.length
      const nextIdx = (charIdx + 1) % CHARACTERS.length
      drawSprite(charAnimators[CHARACTERS[prevIdx]].currentFrame(), getCharPalette(CHARACTERS[prevIdx]), 4, 64, 2)
      drawSprite(charAnimators[CHARACTERS[nextIdx]].currentFrame(), getCharPalette(CHARACTERS[nextIdx]), 128, 64, 2)
      // Arrows
      drawText('<', 18, 54, { color: '#555', size: 8 })
      drawText('>', 140, 54, { color: '#555', size: 8 })
    }

    if (step === 'roomstyle') {
      const s = ROOM_STYLES[roomIdx]

      // Draw the actual full room as background preview
      drawRoomBackground(s)

      // Draw the selected character standing in the room
      const ch = CHARACTERS[charIdx]
      drawSprite(charAnimators[ch].currentFrame(), getCharPalette(ch), 62, 136, 2)

      // Overlay UI on top
      drawRect(0, 0, 160, 22, 'rgba(0,0,0,0.7)')
      drawText('방 스타일', 80, 4, { color: '#aaa', align: 'center', size: 7 })
      drawText(ROOM_LABELS[s], 80, 14, { color: '#fff', align: 'center', size: 5 })

      // Bottom hint + dots
      drawRect(0, 210, 160, 30, 'rgba(0,0,0,0.7)')
      drawText('◀ ▶ 선택  ■ 확인', 80, 225, { color: '#555', align: 'center', size: 5 })

      ROOM_STYLES.forEach((_, i) => {
        const dx = 80 + (i - ROOM_STYLES.length / 2 + 0.5) * 12
        drawRect(dx - 2, 215, 5, 5, i === roomIdx ? '#fff' : '#444')
      })
    }
  }

  // ── Canvas tap (fallback for selection) ──────────────────
  const canvas = document.getElementById('game-canvas')
  function onCanvasTap(e) {
    e.preventDefault()
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const vx = ((clientX - rect.left) / rect.width) * 160

    if (vx < 60) handleNav(-1)
    else if (vx > 100) handleNav(1)
    else handleNext()
  }
  canvas.addEventListener('click', onCanvasTap)
  canvas.addEventListener('touchstart', onCanvasTap, { passive: false })

  startLoop(tick, render)

  return () => {
    unbindController()
    canvas.removeEventListener('click', onCanvasTap)
    canvas.removeEventListener('touchstart', onCanvasTap)
    overlay.innerHTML = ''
    btnRow.innerHTML = ''
  }
}
