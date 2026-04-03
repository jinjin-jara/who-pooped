// src/state.js
const KEY = 'who-pooped-state'
const POOP_COOLDOWN_MS = 60 * 60 * 1000 // 1 hour

const DEFAULTS = {
  userId: null,
  nickname: null,
  characterType: null,
  frameColor: 'pink',
  roomStyle: 'oneroom',
  lastPoopTime: null,
  visitingUserId: null,
  holdingPoop: false,
}

export function getState() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function setState(patch) {
  const current = getState()
  const next = { ...current, ...patch }
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function canPoop() {
  const { lastPoopTime } = getState()
  if (!lastPoopTime) return true
  return Date.now() - lastPoopTime >= POOP_COOLDOWN_MS
}

export function recordPoop() {
  setState({ lastPoopTime: Date.now() })
}

export function poopCooldownRemaining() {
  const { lastPoopTime } = getState()
  if (!lastPoopTime) return 0
  const elapsed = Date.now() - lastPoopTime
  return Math.max(0, POOP_COOLDOWN_MS - elapsed)
}
