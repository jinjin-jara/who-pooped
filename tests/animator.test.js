// tests/animator.test.js
import { describe, it, expect } from 'vitest'
import { Animator } from '../src/canvas/animator.js'

describe('Animator', () => {
  it('starts at frame 0', () => {
    const a = new Animator(['f0', 'f1', 'f2'], 6)
    expect(a.currentFrame()).toBe('f0')
  })

  it('advances frame after enough time at 6fps (>166ms)', () => {
    const a = new Animator(['f0', 'f1'], 6)
    a.tick(200)
    expect(a.currentFrame()).toBe('f1')
  })

  it('loops back to frame 0 after last frame', () => {
    const a = new Animator(['f0', 'f1'], 6)
    a.tick(200) // → f1
    a.tick(200) // → f0
    expect(a.currentFrame()).toBe('f0')
  })

  it('does not advance if not enough time has passed', () => {
    const a = new Animator(['f0', 'f1'], 6)
    a.tick(100)
    expect(a.currentFrame()).toBe('f0')
  })

  it('can be reset to frame 0', () => {
    const a = new Animator(['f0', 'f1'], 6)
    a.tick(200)
    a.reset()
    expect(a.currentFrame()).toBe('f0')
  })
})
