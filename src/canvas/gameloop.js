// src/canvas/gameloop.js
let rafId = null
let lastTime = 0
let activeTick = null   // function(deltaMs) — game logic update
let activeRender = null // function() — draw to canvas

export function startLoop(tick, render) {
  stopLoop()
  activeTick = tick
  activeRender = render
  lastTime = performance.now()
  rafId = requestAnimationFrame(loop)
}

export function stopLoop() {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  activeTick = null
  activeRender = null
}

function loop(now) {
  const delta = Math.min(now - lastTime, 100) // cap at 100ms to avoid huge jumps on tab switch
  lastTime = now
  if (activeTick) activeTick(delta)
  if (activeRender) activeRender()
  rafId = requestAnimationFrame(loop)
}
