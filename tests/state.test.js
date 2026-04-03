// tests/state.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { getState, setState, canPoop, recordPoop } from '../src/state.js'

beforeEach(() => {
  localStorage.clear()
})

describe('getState', () => {
  it('returns defaults when localStorage is empty', () => {
    const s = getState()
    expect(s.userId).toBeNull()
    expect(s.nickname).toBeNull()
    expect(s.characterType).toBeNull()
    expect(s.frameColor).toBe('pink')
    expect(s.roomStyle).toBe('oneroom')
  })
})

describe('setState', () => {
  it('persists values to localStorage', () => {
    setState({ nickname: 'tester', frameColor: 'purple' })
    const s = getState()
    expect(s.nickname).toBe('tester')
    expect(s.frameColor).toBe('purple')
  })
})

describe('canPoop', () => {
  it('returns true when never pooped', () => {
    setState({ lastPoopTime: null })
    expect(canPoop()).toBe(true)
  })

  it('returns false within 1 hour of last poop', () => {
    const fiftyMinutesAgo = Date.now() - 50 * 60 * 1000
    setState({ lastPoopTime: fiftyMinutesAgo })
    expect(canPoop()).toBe(false)
  })

  it('returns true after 1 hour has passed', () => {
    const seventyMinutesAgo = Date.now() - 70 * 60 * 1000
    setState({ lastPoopTime: seventyMinutesAgo })
    expect(canPoop()).toBe(true)
  })
})

describe('recordPoop', () => {
  it('sets lastPoopTime to now', () => {
    recordPoop()
    const s = getState()
    expect(s.lastPoopTime).toBeCloseTo(Date.now(), -2)
  })
})
