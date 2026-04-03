// src/screens/myroom.js
import { getState, setState } from '../state.js'
import { fetchPoopsInHouse, cleanAllPoops, updateRoomStyle } from '../db.js'
import { joinRoomChannel, leaveRoomChannel, broadcastClean } from '../realtime.js'
import { drawRoomBackground, drawPoops, drawCharacter, drawMop } from '../canvas/scenes/room.js'
import { drawText, drawRect } from '../canvas/renderer.js'
import { SPRITES } from '../canvas/sprites.js'
import { Animator } from '../canvas/animator.js'
import { startLoop } from '../canvas/gameloop.js'
import { navigate } from '../main.js'

const CHAR_X = 62
const CHAR_Y = 136

export function mountMyRoom() {
  const state = getState()
  const overlay = document.getElementById('ui-overlay')
  const btnRow = document.getElementById('btn-row')
  overlay.innerHTML = ''
  btnRow.innerHTML = ''

  let poops = []
  let action = 'idle'  // 'idle' | 'clean' | 'angry'
  let cleanFlash = 0   // countdown frames for clean flash effect

  const idleAnim  = new Animator(SPRITES[state.characterType].idle, 6)
  const angryAnim = new Animator(SPRITES[state.characterType].angry, 6)
  const cleanAnim = new Animator(SPRITES[state.characterType].clean, 6)

  async function refreshPoops() {
    poops = await fetchPoopsInHouse(state.userId)
    action = poops.length > 0 ? 'angry' : 'idle'
    renderButtons()
  }
  refreshPoops()

  // Realtime: subscribe to own room channel to catch others' events
  joinRoomChannel(state.userId, {
    onPoop: () => refreshPoops(),
    onClean: () => refreshPoops(),
  })

  // ── Tick + Render ──────────────────────────────────────
  function tick(delta) {
    const anim = action === 'clean' ? cleanAnim : action === 'angry' ? angryAnim : idleAnim
    anim.tick(delta)
    if (cleanFlash > 0) cleanFlash--
  }

  function render() {
    drawRoomBackground(state.roomStyle)
    drawPoops(poops)

    const anim = action === 'clean' ? cleanAnim : action === 'angry' ? angryAnim : idleAnim
    drawCharacter(state.characterType, anim.currentFrame(), CHAR_X, CHAR_Y)

    if (action === 'clean') drawMop(CHAR_X + 22, CHAR_Y + 4)

    // Flash overlay after cleaning
    if (cleanFlash > 0) {
      drawRect(0, 140, 160, 100, `rgba(255,255,255,${(cleanFlash / 8) * 0.3})`)
    }

    // Poop count badge
    if (poops.length > 0) {
      drawRect(2, 2, 36, 12, '#333333')
      drawText(`💩 x${poops.length}`, 4, 3, { color: '#ff6b6b', size: 8 })
    }

    // Room label
    drawText(`${state.nickname}의 집`, 80, 4, { color: '#555555', align: 'center', size: 5 })
  }

  // ── Buttons ────────────────────────────────────────────
  function renderButtons() {
    btnRow.innerHTML = ''

    const cleanBtn = makeBtn('🧹', '청소', poops.length === 0, async () => {
      action = 'clean'
      cleanAnim.reset()
      renderButtons() // disable during clean
      await cleanAllPoops(state.userId)
      broadcastClean(state.userId)
      cleanFlash = 8
      await refreshPoops()
      action = poops.length > 0 ? 'angry' : 'idle'
    })

    const moveBtn = makeBtn('💩', '옮기기', poops.length === 0, () => {
      setState({ holdingPoop: true })
      navigate('street')
    })

    const exitBtn = makeBtn('🚪', '나가기', false, () => {
      navigate('street')
    })

    const decoBtn = makeBtn('🎨', '꾸미기', false, showRoomStylePicker)

    btnRow.append(cleanBtn, moveBtn, exitBtn, decoBtn)
  }

  function showRoomStylePicker() {
    const s = getState()
    const picker = document.createElement('div')
    picker.style.cssText = `
      position:absolute;inset:0;background:rgba(0,0,0,0.92);
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;
    `
    const label = document.createElement('p')
    label.textContent = '방 스타일 선택'
    label.style.cssText = 'color:#aaa;font-family:monospace;font-size:12px;'
    picker.appendChild(label)

    const styles = [
      { key: 'oneroom', label: '원룸' },
      { key: 'minimal', label: '미니멀' },
      { key: 'kids', label: '어린이방' },
    ]
    styles.forEach(st => {
      const btn = document.createElement('button')
      btn.textContent = st.label
      btn.style.cssText = `
        background:${s.roomStyle === st.key ? '#555' : '#2a2a2a'};border:none;
        color:#eee;font-family:monospace;font-size:13px;
        padding:10px 28px;border-radius:8px;cursor:pointer;width:160px;
      `
      btn.onclick = async () => {
        await updateRoomStyle(s.userId, st.key)
        setState({ roomStyle: st.key })
        overlay.removeChild(picker)
      }
      picker.appendChild(btn)
    })

    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = '취소'
    cancelBtn.style.cssText = 'background:none;border:none;color:#666;font-family:monospace;font-size:11px;cursor:pointer;'
    cancelBtn.onclick = () => overlay.removeChild(picker)
    picker.appendChild(cancelBtn)
    overlay.appendChild(picker)
  }

  startLoop(tick, render)

  return () => {
    leaveRoomChannel(state.userId)
    overlay.innerHTML = ''
    btnRow.innerHTML = ''
  }
}

function makeBtn(icon, label, disabled, onClick) {
  const btn = document.createElement('button')
  btn.className = 'action-btn'
  btn.disabled = disabled
  btn.innerHTML = `${icon}<span class="btn-label">${label}</span>`
  btn.onclick = onClick
  return btn
}
