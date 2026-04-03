// src/screens/onboarding.js
import { setState } from '../state.js'
import { createUser, fetchUserByNickname } from '../db.js'
import { initFrame } from '../frame.js'
import { navigate } from '../main.js'
import { clear, drawRect, drawSprite, drawText } from '../canvas/renderer.js'
import { SPRITES, CHAR_PALETTE } from '../canvas/sprites.js'
import { startLoop } from '../canvas/gameloop.js'
import { Animator } from '../canvas/animator.js'

const CHARACTERS = ['cat', 'rabbit', 'bear', 'dog', 'duck']
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
  let selectedChar = 'cat'
  let selectedColor = 'pink'
  let selectedRoom = 'oneroom'
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
  confirmBtn.onclick = async () => {
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
  }

  form.append(title, input, errDiv, confirmBtn)
  overlay.appendChild(form)

  // ── Animators for character preview ─────────────────────
  const charAnimators = {}
  CHARACTERS.forEach(c => { charAnimators[c] = new Animator(SPRITES[c].idle, 6) })

  // ── Canvas render ────────────────────────────────────────
  function tick(delta) {
    if (step === 'nickname') return
    CHARACTERS.forEach(c => charAnimators[c].tick(delta))
  }

  function render() {
    if (step === 'nickname') return
    clear('#111111')

    if (step === 'character') {
      drawText('캐릭터 선택', 80, 10, { color: '#aaa', align: 'center', size: 7 })
      CHARACTERS.forEach((ch, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 12 + col * 48
        const y = 30 + row * 60
        if (ch === selectedChar) drawRect(x - 2, y - 2, 44, 56, '#333333')
        drawSprite(charAnimators[ch].currentFrame(), CHAR_PALETTE, x + 2, y + 2, 2)
        drawText(ch, x + 20, y + 46, { color: ch === selectedChar ? '#fff' : '#666', align: 'center', size: 5 })
      })
    }

    if (step === 'color') {
      drawText('프레임 색상', 80, 10, { color: '#aaa', align: 'center', size: 7 })
      COLORS.forEach((c, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 16 + col * 46
        const y = 38 + row * 54
        if (c === selectedColor) drawRect(x - 3, y - 3, 42, 42, '#ffffff')
        drawRect(x, y, 36, 36, COLOR_HEX[c])
        drawText(c, x + 18, y + 40, { color: '#888', align: 'center', size: 5 })
      })
    }

    if (step === 'roomstyle') {
      drawText('방 스타일', 80, 10, { color: '#aaa', align: 'center', size: 7 })
      ROOM_STYLES.forEach((s, i) => {
        const x = 10 + i * 50
        const y = 30
        if (s === selectedRoom) drawRect(x - 2, y - 2, 44, 86, '#333333')
        // simple thumbnail
        drawRect(x, y, 40, 80, '#0d0d0d')
        drawRect(x, y + 48, 40, 32, '#181818')
        drawRect(x, y + 48, 40, 1, '#2a2a2a')
        if (s === 'oneroom') {
          drawRect(x + 10, y + 4, 20, 16, '#1a1a2e') // window
        } else if (s === 'minimal') {
          drawRect(x + 2, y + 30, 36, 14, '#1a1a1a') // sofa
        } else if (s === 'kids') {
          drawRect(x + 2, y + 4, 16, 46, '#252525') // bunkbed
        }
        drawText(ROOM_LABELS[s], x + 20, y + 84, { color: s === selectedRoom ? '#fff' : '#666', align: 'center', size: 5 })
      })
    }
  }

  // ── Canvas click/touch to select ─────────────────────────
  const canvas = document.getElementById('game-canvas')
  function onCanvasTap(e) {
    e.preventDefault()
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const vx = ((clientX - rect.left) / rect.width) * 160
    const vy = ((clientY - rect.top) / rect.height) * 240

    if (step === 'character') {
      CHARACTERS.forEach((ch, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 12 + col * 48
        const y = 30 + row * 60
        if (vx >= x - 2 && vx <= x + 42 && vy >= y - 2 && vy <= y + 54) selectedChar = ch
      })
    }
    if (step === 'color') {
      COLORS.forEach((c, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 16 + col * 46
        const y = 38 + row * 54
        if (vx >= x && vx <= x + 36 && vy >= y && vy <= y + 36) {
          selectedColor = c
          initFrame(c)
        }
      })
    }
    if (step === 'roomstyle') {
      ROOM_STYLES.forEach((s, i) => {
        const x = 10 + i * 50
        if (vx >= x - 2 && vx <= x + 42) selectedRoom = s
      })
    }
  }
  canvas.addEventListener('click', onCanvasTap)
  canvas.addEventListener('touchstart', onCanvasTap, { passive: false })

  // ── Next button ──────────────────────────────────────────
  const nextBtn = document.createElement('button')
  nextBtn.className = 'action-btn'
  nextBtn.style.cssText += 'width:140px;font-size:14px;'
  nextBtn.innerHTML = '다음 →'
  btnRow.appendChild(nextBtn)

  nextBtn.onclick = async () => {
    if (step === 'character') { step = 'color'; return }
    if (step === 'color') { step = 'roomstyle'; return }
    if (step === 'roomstyle') {
      nextBtn.disabled = true
      nextBtn.innerHTML = '저장 중...'
      try {
        const user = await createUser({
          nickname,
          characterType: selectedChar,
          frameColor: selectedColor,
          roomStyle: selectedRoom,
        })
        setState({ userId: user.id, nickname, characterType: selectedChar, frameColor: selectedColor, roomStyle: selectedRoom })
        navigate('myroom')
      } catch {
        nextBtn.disabled = false
        nextBtn.innerHTML = '다음 →'
      }
    }
  }

  startLoop(tick, render)

  return () => {
    canvas.removeEventListener('click', onCanvasTap)
    canvas.removeEventListener('touchstart', onCanvasTap)
    overlay.innerHTML = ''
    btnRow.innerHTML = ''
  }
}
