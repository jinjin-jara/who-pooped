// src/main.js
import { initRenderer } from './canvas/renderer.js'
import { initFrame } from './frame.js'
import { getState } from './state.js'
import { mountOnboarding } from './screens/onboarding.js'
import { mountMyRoom } from './screens/myroom.js'
import { mountStreet } from './screens/street.js'
import { mountOtherRoom } from './screens/otherroom.js'

const SCREENS = {
  onboarding: mountOnboarding,
  myroom: mountMyRoom,
  street: mountStreet,
  otherroom: mountOtherRoom,
}

let currentUnmount = null

export function navigate(screen, params = {}) {
  if (currentUnmount) { currentUnmount(); currentUnmount = null }
  const mount = SCREENS[screen]
  if (!mount) throw new Error(`Unknown screen: ${screen}`)
  currentUnmount = mount(params) ?? null
}

async function boot() {
  initRenderer()
  const state = getState()
  initFrame(state.frameColor)

  // Loading splash
  const { clear, drawText } = await import('./canvas/renderer.js')
  clear('#111111')
  drawText('WHO POOPED?', 80, 108, { color: '#eeeeee', align: 'center', size: 10 })
  drawText('loading...', 80, 124, { color: '#555555', align: 'center', size: 6 })

  if (state.userId) {
    navigate('myroom')
  } else {
    navigate('onboarding')
  }
}

boot()
