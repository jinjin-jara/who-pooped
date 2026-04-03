// src/screens/otherroom.js
import { getState, setState, canPoop, recordPoop, poopCooldownRemaining } from '../state.js'
import { createPoop, fetchPoopsInHouse, fetchNotes, createNote } from '../db.js'
import { joinRoomChannel, leaveRoomChannel, broadcastPoop, broadcastKick } from '../realtime.js'
import { drawRoomBackground, drawPoops, drawCharacter } from '../canvas/scenes/room.js'
import { drawText, drawRect } from '../canvas/renderer.js'
import { SPRITES } from '../canvas/sprites.js'
import { Animator } from '../canvas/animator.js'
import { startLoop } from '../canvas/gameloop.js'
import { navigate } from '../main.js'
import { bindController, unbindController } from '../controller.js'

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
  let notes       = []
  let ownerPresent = false
  let othersInRoom = []  // other users present via realtime
  let visitorAction = 'idle'
  let ownerAction   = 'idle'
  let kickedTimer   = 0
  let poopTimer     = 0

  let menuOpen = false
  let menuIdx = 0
  let menuItems = []

  // Notes viewer
  let viewingNotes = false
  let noteScroll = 0

  // Note writing
  let writingNote = false

  const myType    = state.characterType
  const ownerType = targetUser.character_type

  const myIdle    = new Animator(SPRITES[myType].idle,    6)
  const myPoop    = new Animator(SPRITES[myType].poop,    6)
  const myKicked  = new Animator(SPRITES[myType].kicked,  6)
  const ownerIdle = new Animator(SPRITES[ownerType].idle, 6)
  const ownerKick = new Animator(SPRITES[ownerType].kick, 6)

  async function refreshPoops() {
    poops = await fetchPoopsInHouse(targetUser.id)
    buildMenu()
  }

  async function refreshNotes() {
    try { notes = await fetchNotes(targetUser.id) } catch { notes = [] }
  }

  refreshPoops()
  refreshNotes()

  // Auto-deposit
  if (state.holdingPoop && state.userId !== targetUser.id && canPoop()) {
    setState({ holdingPoop: false })
    recordPoop()
    setTimeout(async () => {
      await createPoop(targetUser.id, state.userId)
      broadcastPoop(targetUser.id, state.userId)
      await refreshPoops()
    }, 200)
  } else if (state.holdingPoop && !canPoop()) {
    setState({ holdingPoop: false })
  }

  const cooldownInterval = setInterval(() => buildMenu(), 1000)

  joinRoomChannel(targetUser.id, {
    onPoop:     ()         => refreshPoops(),
    onClean:    ()         => refreshPoops(),
    onPresence: (list)     => {
      ownerPresent = list.some(p => p.userId === targetUser.id)
      // Track other visitors (not me, not owner)
      othersInRoom = list.filter(p => p.userId !== state.userId && p.userId !== targetUser.id)
      buildMenu()
    },
    onKick:     (targetId) => {
      if (targetId === state.userId) startKickedSequence()
    },
  })

  function startKickedSequence() {
    visitorAction = 'kicked'
    myKicked.reset()
    kickedTimer   = 1200
    menuOpen = false
    writingNote = false
    viewingNotes = false
  }

  function buildMenu() {
    menuItems = []
    if (state.userId !== targetUser.id) {
      const poopReady = canPoop()
      const remaining = poopCooldownRemaining()
      const poopLabel = poopReady ? '💩 똥싸기' : `⏳ ${formatCooldown(remaining)}`
      menuItems.push({ label: poopLabel, key: 'poop', disabled: !poopReady })
    }
    menuItems.push({ label: '✉ 쪽지 보내기', key: 'write' })
    menuItems.push({ label: '📋 쪽지 보기', key: 'notes' })
    if (state.userId === targetUser.id && ownerPresent) {
      menuItems.push({ label: '👟 걷어차기', key: 'kick' })
    }
    menuItems.push({ label: '🚪 나가기', key: 'exit' })
    menuIdx = 0
  }
  buildMenu()

  bindController({
    onLeft: () => {
      if (writingNote || viewingNotes) {
        if (viewingNotes) noteScroll = Math.max(0, noteScroll - 1)
      } else if (menuOpen) {
        menuIdx = (menuIdx - 1 + menuItems.length) % menuItems.length
      }
    },
    onRight: () => {
      if (writingNote || viewingNotes) {
        if (viewingNotes) noteScroll = Math.min(Math.max(0, notes.length - 1), noteScroll + 1)
      } else if (menuOpen) {
        menuIdx = (menuIdx + 1) % menuItems.length
      }
    },
    onAction: () => {
      if (writingNote) return // handled by DOM
      if (viewingNotes) { viewingNotes = false; return }
      if (visitorAction === 'kicked') return
      if (!menuOpen) {
        menuOpen = true
        buildMenu()
      } else {
        executeMenu()
      }
    },
  })

  async function executeMenu() {
    const item = menuItems[menuIdx]
    if (!item || item.disabled) return
    menuOpen = false

    if (item.key === 'poop') {
      if (!canPoop() || visitorAction !== 'idle') return
      visitorAction = 'poop'
      poopTimer = 900
      myPoop.reset()
      recordPoop()
      await createPoop(targetUser.id, state.userId)
      broadcastPoop(targetUser.id, state.userId)
      await refreshPoops()
    } else if (item.key === 'write') {
      showNoteInput()
    } else if (item.key === 'notes') {
      await refreshNotes()
      viewingNotes = true
      noteScroll = 0
    } else if (item.key === 'kick') {
      ownerAction = 'kick'
      ownerKick.reset()
      broadcastKick(targetUser.id, state.userId)
      setTimeout(() => { ownerAction = 'idle' }, 600)
    } else if (item.key === 'exit') {
      navigate('street')
    }
  }

  function showNoteInput() {
    writingNote = true
    const form = document.createElement('div')
    form.style.cssText = `
      position:absolute;inset:0;background:rgba(0,0,0,0.92);
      display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:20px;
    `
    const label = document.createElement('div')
    label.style.cssText = 'color:#e8d870;font-family:monospace;font-size:11px;'
    label.textContent = `${targetUser.nickname}에게 쪽지`

    const textarea = document.createElement('textarea')
    textarea.maxLength = 50
    textarea.placeholder = '50자 이내 메시지'
    textarea.style.cssText = `
      background:#1a1828;border:2px solid #444;color:#eee;font-family:monospace;
      font-size:12px;padding:8px;border-radius:6px;width:100%;height:60px;
      resize:none;outline:none;text-align:center;
    `

    const charCount = document.createElement('div')
    charCount.style.cssText = 'color:#555;font-family:monospace;font-size:9px;'
    charCount.textContent = '0/50'
    textarea.oninput = () => { charCount.textContent = `${textarea.value.length}/50` }

    const sendBtn = document.createElement('button')
    sendBtn.textContent = '보내기 ✉'
    sendBtn.style.cssText = `
      background:#444;border:none;color:#eee;font-family:monospace;font-size:12px;
      padding:8px 0;border-radius:6px;cursor:pointer;width:100%;
    `
    sendBtn.onclick = async () => {
      const msg = textarea.value.trim()
      if (!msg) return
      sendBtn.textContent = '보내는 중...'
      sendBtn.disabled = true
      try {
        await createNote(targetUser.id, state.userId, state.nickname, msg)
        await refreshNotes()
      } catch { /* ignore */ }
      overlay.removeChild(form)
      writingNote = false
    }

    const cancelBtn = document.createElement('button')
    cancelBtn.textContent = '취소'
    cancelBtn.style.cssText = 'background:none;border:none;color:#666;font-family:monospace;font-size:10px;cursor:pointer;'
    cancelBtn.onclick = () => {
      overlay.removeChild(form)
      writingNote = false
    }

    form.append(label, textarea, charCount, sendBtn, cancelBtn)
    overlay.appendChild(form)
    textarea.focus()
  }

  // ── Tick ────────────────────────────────────────────────
  function tick(delta) {
    ;[myIdle, myPoop, myKicked, ownerIdle, ownerKick].forEach(a => a.tick(delta))

    if (poopTimer > 0) {
      poopTimer -= delta
      if (poopTimer <= 0) { poopTimer = 0; visitorAction = 'idle' }
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

    const myAnim = visitorAction === 'poop'   ? myPoop
                 : visitorAction === 'kicked' ? myKicked
                 : myIdle
    drawCharacter(myType, myAnim.currentFrame(), VISITOR_X, CHAR_Y, state.nickname)

    // Owner
    if (ownerPresent) {
      const owAnim = ownerAction === 'kick' ? ownerKick : ownerIdle
      drawCharacter(ownerType, owAnim.currentFrame(), OWNER_X, CHAR_Y, targetUser.nickname)
    }

    // Other visitors
    othersInRoom.forEach((other, i) => {
      const ox = 70 + i * 24
      const charType = other.characterType || 'cat'
      const otherIdle = SPRITES[charType]?.idle?.[0] || SPRITES.cat.idle[0]
      drawCharacter(charType, otherIdle, ox, CHAR_Y, other.nickname)
    })

    // Room name header
    drawRect(0, 0, 160, 14, 'rgba(0,0,0,0.5)')
    drawText(`${targetUser.nickname}의 집`, 80, 3, { color: '#ccc', align: 'center', size: 6 })

    // Cooldown + poop count below header
    let infoY = 16
    const remaining = poopCooldownRemaining()
    if (remaining > 0) {
      drawRect(0, infoY, 160, 12, '#2a0000')
      drawText(`⏳ ${formatCooldown(remaining)}`, 80, infoY + 2, { color: '#ff6b6b', align: 'center', size: 6 })
      infoY += 13
    }

    if (poops.length > 0) {
      drawRect(2, infoY, 36, 12, '#333333')
      drawText(`💩 x${poops.length}`, 4, infoY + 2, { color: '#ff6b6b', size: 7 })
    }

    // Note count on wall
    if (notes.length > 0 && !viewingNotes && !menuOpen && !writingNote) {
      drawRect(130, 50, 24, 16, '#e8d870')
      drawRect(131, 51, 22, 14, '#d8c860')
      drawText(`✉${notes.length}`, 133, 53, { color: '#4a4020', size: 6 })
    }

    // Notes viewer
    if (viewingNotes) {
      drawRect(0, 0, 160, 240, 'rgba(8,8,16,0.92)')
      drawText('✉ 쪽지함', 80, 6, { color: '#e8d870', align: 'center', size: 7 })

      if (notes.length === 0) {
        drawText('쪽지가 없어요', 80, 110, { color: '#666', align: 'center', size: 6 })
      } else {
        const perPage = 5
        const start = noteScroll
        const visible = notes.slice(start, start + perPage)
        visible.forEach((n, i) => {
          const ny = 22 + i * 38
          drawRect(8, ny, 144, 34, '#1a1828')
          drawRect(8, ny, 144, 1, '#333')
          drawText(n.sender_nickname, 12, ny + 3, { color: '#e8d870', size: 6 })
          const msg = n.message.length > 18 ? n.message.slice(0, 18) + '…' : n.message
          drawText(msg, 12, ny + 14, { color: '#ccc', size: 6 })
          const d = new Date(n.created_at)
          const timeStr = `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`
          drawText(timeStr, 148, ny + 3, { color: '#555', align: 'right', size: 5 })
        })
        if (notes.length > perPage) {
          drawText(`${noteScroll + 1}-${Math.min(noteScroll + perPage, notes.length)} / ${notes.length}`, 80, 214, { color: '#555', align: 'center', size: 5 })
        }
      }
      drawText('◀ ▶ 스크롤  ■ 닫기', 80, 228, { color: '#555', align: 'center', size: 5 })
      return
    }

    // Action menu
    if (menuOpen) {
      const mw = 106
      const mh = menuItems.length * 16 + 8
      const mx = 27
      const my = 200 - mh
      drawRect(mx, my, mw, mh, 'rgba(10,10,20,0.9)')
      drawRect(mx, my, mw, 1, '#444')
      drawRect(mx, my + mh - 1, mw, 1, '#444')
      drawRect(mx, my, 1, mh, '#444')
      drawRect(mx + mw - 1, my, 1, mh, '#444')

      menuItems.forEach((item, i) => {
        const iy = my + 4 + i * 16
        if (i === menuIdx) drawRect(mx + 2, iy, mw - 4, 14, '#333355')
        drawText(item.label, mx + 8, iy + 3, {
          color: item.disabled ? '#553333' : i === menuIdx ? '#fff' : '#888',
          size: 6,
        })
      })
    } else if (visitorAction !== 'kicked' && !writingNote) {
      drawText('■ 메뉴', 80, 228, { color: '#444', align: 'center', size: 5 })
    }
  }

  // ── Canvas tap for menu ─────────────────────────────────
  const canvas = document.getElementById('game-canvas')
  function onCanvasTap(e) {
    e.preventDefault()
    const rect = canvas.getBoundingClientRect()
    const cx = e.touches ? e.changedTouches[0].clientX : e.clientX
    const cy = e.touches ? e.changedTouches[0].clientY : e.clientY
    const vx = ((cx - rect.left) / rect.width) * 160
    const vy = ((cy - rect.top) / rect.height) * 240

    if (viewingNotes) { viewingNotes = false; return }
    if (writingNote) return

    if (menuOpen) {
      const mw = 106, mx = 27
      const mh = menuItems.length * 16 + 8
      const my = 200 - mh
      if (vx >= mx && vx <= mx + mw && vy >= my && vy <= my + mh) {
        const idx = Math.floor((vy - my - 4) / 16)
        if (idx >= 0 && idx < menuItems.length) {
          menuIdx = idx
          executeMenu()
        }
      } else {
        menuOpen = false
      }
    } else if (visitorAction !== 'kicked') {
      menuOpen = true
      buildMenu()
    }
  }
  canvas.addEventListener('click', onCanvasTap)
  canvas.addEventListener('touchend', onCanvasTap, { passive: false })

  startLoop(tick, render)

  return () => {
    unbindController()
    leaveRoomChannel(targetUser.id)
    clearInterval(cooldownInterval)
    canvas.removeEventListener('click', onCanvasTap)
    canvas.removeEventListener('touchend', onCanvasTap)
    overlay.innerHTML = ''
    btnRow.innerHTML  = ''
  }
}

function formatCooldown(ms) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}
