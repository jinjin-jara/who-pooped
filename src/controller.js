// src/controller.js — Bind the fixed ◀ ■ ▶ hardware buttons

let cleanup = null

/**
 * Bind controller buttons for the current screen.
 */
export function bindController({ onLeft, onRight, onAction, onLeftUp, onRightUp } = {}) {
  unbindController()

  const btnL = document.getElementById('btn-left')
  const btnA = document.getElementById('btn-action')
  const btnR = document.getElementById('btn-right')
  if (!btnL || !btnA || !btnR) return

  const handlers = []

  function on(el, evt, fn, opts) {
    el.addEventListener(evt, fn, opts)
    handlers.push([el, evt, fn, opts])
  }

  // Track which button is pressed to release on global up
  let leftDown = false
  let rightDown = false

  if (onLeft) {
    on(btnL, 'touchstart', (e) => { e.preventDefault(); leftDown = true; onLeft() }, { passive: false })
    on(btnL, 'mousedown', () => { leftDown = true; onLeft() })
  }
  if (onRight) {
    on(btnR, 'touchstart', (e) => { e.preventDefault(); rightDown = true; onRight() }, { passive: false })
    on(btnR, 'mousedown', () => { rightDown = true; onRight() })
  }
  if (onAction) {
    on(btnA, 'touchstart', (e) => { e.preventDefault(); onAction() }, { passive: false })
    on(btnA, 'mousedown', (e) => { e.preventDefault(); onAction() })
  }

  // Global release handlers — catches release even if finger/mouse drifted off button
  function globalUp() {
    if (leftDown && onLeftUp) { leftDown = false; onLeftUp() }
    if (rightDown && onRightUp) { rightDown = false; onRightUp() }
  }

  document.addEventListener('mouseup', globalUp)
  document.addEventListener('touchend', globalUp)
  document.addEventListener('touchcancel', globalUp)
  handlers.push([document, 'mouseup', globalUp])
  handlers.push([document, 'touchend', globalUp])
  handlers.push([document, 'touchcancel', globalUp])

  cleanup = () => {
    handlers.forEach(([el, evt, fn, opts]) => el.removeEventListener(evt, fn, opts))
  }
}

export function unbindController() {
  if (cleanup) { cleanup(); cleanup = null }
}
