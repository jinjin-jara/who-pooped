// src/screens/myroom.js
import { getState, setState } from '../state.js'
import { fetchPoopsInHouse, cleanAllPoops, updateRoomStyle, fetchNotes } from '../db.js'
import { joinRoomChannel, leaveRoomChannel, broadcastClean } from '../realtime.js'
import { drawRoomBackground, drawPoops, drawCharacter, drawMop } from '../canvas/scenes/room.js'
import { drawText, drawRect } from '../canvas/renderer.js'
import { SPRITES } from '../canvas/sprites.js'
import { Animator } from '../canvas/animator.js'
import { startLoop } from '../canvas/gameloop.js'
import { navigate } from '../main.js'
import { bindController, unbindController } from '../controller.js'

const CHAR_X = 62
const CHAR_Y = 136

const ROOM_STYLES = ['oneroom', 'minimal', 'kids']
const ROOM_LABELS = { oneroom: '원룸', minimal: '미니멀', kids: '어린이방' }

export function mountMyRoom() {
  const state = getState()
  const overlay = document.getElementById('ui-overlay')
  const btnRow = document.getElementById('btn-row')
  overlay.innerHTML = ''
  btnRow.innerHTML = ''

  let poops = []
  let notes = []
  let action = 'idle'
  let cleanFlash = 0
  let cleanTimer = 0  // ms remaining for clean animation

  let menuOpen = false
  let menuIdx = 0
  let menuItems = []

  let pickingRoom = false
  let roomPickIdx = 0

  // Notes viewer state
  let viewingNotes = false
  let noteScroll = 0

  const idleAnim  = new Animator(SPRITES[state.characterType].idle, 6)
  const angryAnim = new Animator(SPRITES[state.characterType].angry, 6)
  const cleanAnim = new Animator(SPRITES[state.characterType].clean, 6)

  async function refreshPoops() {
    poops = await fetchPoopsInHouse(state.userId)
    action = poops.length > 0 ? 'angry' : 'idle'
    buildMenu()
  }

  async function refreshNotes() {
    try { notes = await fetchNotes(state.userId) } catch { notes = [] }
  }

  refreshPoops()
  refreshNotes()

  joinRoomChannel(state.userId, {
    onPoop: () => refreshPoops(),
    onClean: () => refreshPoops(),
  })

  function buildMenu() {
    menuItems = []
    if (poops.length > 0) menuItems.push({ label: '🧹 청소', key: 'clean' })
    if (poops.length > 0) menuItems.push({ label: '💩 옮기기', key: 'move' })
    menuItems.push({ label: '✉ 쪽지 보기', key: 'notes' })
    menuItems.push({ label: '🎨 꾸미기', key: 'deco' })
    menuItems.push({ label: '🚪 나가기', key: 'exit' })
    menuIdx = 0
  }
  buildMenu()

  bindController({
    onLeft: () => {
      if (viewingNotes) {
        noteScroll = Math.max(0, noteScroll - 1)
      } else if (pickingRoom) {
        roomPickIdx = (roomPickIdx - 1 + ROOM_STYLES.length) % ROOM_STYLES.length
      } else if (menuOpen) {
        menuIdx = (menuIdx - 1 + menuItems.length) % menuItems.length
      }
    },
    onRight: () => {
      if (viewingNotes) {
        noteScroll = Math.min(Math.max(0, notes.length - 1), noteScroll + 1)
      } else if (pickingRoom) {
        roomPickIdx = (roomPickIdx + 1) % ROOM_STYLES.length
      } else if (menuOpen) {
        menuIdx = (menuIdx + 1) % menuItems.length
      }
    },
    onAction: () => {
      if (viewingNotes) {
        viewingNotes = false
      } else if (pickingRoom) {
        confirmRoomPick()
      } else if (!menuOpen) {
        menuOpen = true
        menuIdx = 0
      } else {
        executeMenu()
      }
    },
  })

  async function executeMenu() {
    const item = menuItems[menuIdx]
    if (!item) return
    menuOpen = false

    if (item.key === 'clean') {
      action = 'clean'
      cleanAnim.reset()
      cleanTimer = 3000 // 3 seconds of cleaning animation
      // DB cleanup happens after animation finishes (in tick)
    } else if (item.key === 'move') {
      setState({ holdingPoop: true })
      navigate('street')
    } else if (item.key === 'notes') {
      await refreshNotes()
      viewingNotes = true
      noteScroll = 0
    } else if (item.key === 'deco') {
      pickingRoom = true
      roomPickIdx = ROOM_STYLES.indexOf(state.roomStyle)
      if (roomPickIdx < 0) roomPickIdx = 0
    } else if (item.key === 'exit') {
      navigate('street')
    }
  }

  async function confirmRoomPick() {
    const newStyle = ROOM_STYLES[roomPickIdx]
    await updateRoomStyle(state.userId, newStyle)
    setState({ roomStyle: newStyle })
    pickingRoom = false
    tapCooldown = Date.now() // prevent immediate menu open
  }

  function tick(delta) {
    const anim = action === 'clean' ? cleanAnim : action === 'angry' ? angryAnim : idleAnim
    anim.tick(delta)
    if (cleanFlash > 0) cleanFlash--

    // Clean animation timer
    if (cleanTimer > 0) {
      cleanTimer -= delta
      if (cleanTimer <= 0) {
        cleanTimer = 0
        // Now actually clean
        cleanAllPoops(state.userId).then(() => {
          broadcastClean(state.userId)
          cleanFlash = 8
          refreshPoops()
        })
      }
    }
  }

  function render() {
    const currentStyle = pickingRoom ? ROOM_STYLES[roomPickIdx] : state.roomStyle
    drawRoomBackground(currentStyle)
    drawPoops(poops)

    const anim = action === 'clean' ? cleanAnim : action === 'angry' ? angryAnim : idleAnim
    drawCharacter(state.characterType, anim.currentFrame(), CHAR_X, CHAR_Y, state.nickname)

    if (action === 'clean') {
      // Mop swings left-right during cleaning
      const swing = Math.sin(Date.now() / 150) * 8
      drawMop(CHAR_X + 22 + swing, CHAR_Y + 4)
    }

    if (cleanFlash > 0) {
      drawRect(0, 140, 160, 100, `rgba(255,255,255,${(cleanFlash / 8) * 0.3})`)
    }

    if (poops.length > 0) {
      drawRect(2, 2, 36, 12, '#333333')
      drawText(`💩 x${poops.length}`, 4, 3, { color: '#ff6b6b', size: 8 })
    }

    drawRect(0, 0, 160, 14, 'rgba(0,0,0,0.5)')
    drawText(`🏠 ${state.nickname}의 집`, 80, 3, { color: '#ccc', align: 'center', size: 6 })

    // Note count indicator on wall
    if (notes.length > 0 && !viewingNotes && !menuOpen && !pickingRoom) {
      drawRect(130, 50, 24, 16, '#e8d870')
      drawRect(131, 51, 22, 14, '#d8c860')
      drawText(`✉${notes.length}`, 133, 53, { color: '#4a4020', size: 6 })
    }

    // Room style picker
    if (pickingRoom) {
      drawRect(0, 0, 160, 22, 'rgba(0,0,0,0.7)')
      drawText('방 스타일 선택', 80, 3, { color: '#aaa', align: 'center', size: 6 })
      drawText(ROOM_LABELS[ROOM_STYLES[roomPickIdx]], 80, 12, { color: '#fff', align: 'center', size: 6 })
      drawRect(0, 216, 160, 24, 'rgba(0,0,0,0.7)')
      drawText('◀ ▶ 선택  ■ 확인', 80, 224, { color: '#555', align: 'center', size: 5 })
      ROOM_STYLES.forEach((_, i) => {
        const dx = 80 + (i - ROOM_STYLES.length / 2 + 0.5) * 12
        drawRect(dx - 2, 218, 5, 5, i === roomPickIdx ? '#fff' : '#444')
      })
      return
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
          // Truncate message to fit
          const msg = n.message.length > 18 ? n.message.slice(0, 18) + '…' : n.message
          drawText(msg, 12, ny + 14, { color: '#ccc', size: 6 })
          // Time
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
      const mw = 100
      const mh = menuItems.length * 16 + 8
      const mx = 30
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
          color: i === menuIdx ? '#fff' : '#888',
          size: 6,
        })
      })
    } else {
      drawText('■ 메뉴', 80, 228, { color: '#444', align: 'center', size: 5 })
    }
  }

  // ── Canvas tap for menu ─────────────────────────────────
  const canvas = document.getElementById('game-canvas')
  let tapCooldown = 0
  function onCanvasTap(e) {
    e.preventDefault()
    if (pickingRoom || viewingNotes || cleanTimer > 0) return
    if (Date.now() - tapCooldown < 200) return // debounce

    const rect = canvas.getBoundingClientRect()
    const cx = e.touches ? e.changedTouches[0].clientX : e.clientX
    const cy = e.touches ? e.changedTouches[0].clientY : e.clientY
    const vx = ((cx - rect.left) / rect.width) * 160
    const vy = ((cy - rect.top) / rect.height) * 240

    if (menuOpen) {
      const mw = 100, mx = 30
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
    } else {
      menuOpen = true
      menuIdx = 0
    }
    tapCooldown = Date.now()
  }
  canvas.addEventListener('click', onCanvasTap)
  canvas.addEventListener('touchend', onCanvasTap, { passive: false })

  startLoop(tick, render)

  return () => {
    unbindController()
    leaveRoomChannel(state.userId)
    canvas.removeEventListener('click', onCanvasTap)
    canvas.removeEventListener('touchend', onCanvasTap)
    overlay.innerHTML = ''
    btnRow.innerHTML = ''
  }
}
