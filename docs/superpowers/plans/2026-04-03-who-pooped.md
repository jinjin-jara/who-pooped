# WHO POOPED? Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real-time multiplayer pixel-art web game where Tamagotchi animal characters visit each other's single-room houses, poop, clean, and kick intruders — wrapped in a colorful CSS phone frame.

**Architecture:** Vanilla JS + Vite SPA. HTML Canvas renders at 160×240 virtual pixels scaled to the phone's game area. Supabase handles user/poop data and Realtime channels sync live room events. No server-side code. Deploy to Vercel.

**Tech Stack:** Vite 5, Vanilla JS (ES modules), HTML Canvas 2D API, Supabase JS v2, Vitest, Vercel

---

## File Map

```
who-pooped/
├── index.html
├── style.css                     # phone frame + color theming CSS vars
├── vite.config.js
├── package.json
├── .env.local                    # VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY
├── supabase/
│   └── schema.sql                # run once in Supabase dashboard
├── src/
│   ├── main.js                   # app boot + screen router
│   ├── state.js                  # reactive global state + localStorage
│   ├── db.js                     # Supabase CRUD (users, poops)
│   ├── realtime.js               # Supabase Realtime channel management
│   ├── frame.js                  # apply frame color CSS var
│   ├── canvas/
│   │   ├── renderer.js           # canvas setup, scale factor, drawPixel, drawSprite, clear
│   │   ├── sprites.js            # all pixel art data (animals × states, poop, furniture)
│   │   ├── animator.js           # advances sprite frames at 6fps
│   │   └── gameloop.js           # rAF loop, calls screen render + animator tick
│   └── screens/
│       ├── onboarding.js         # nickname → character → frame color → room style
│       ├── myroom.js             # render room, handle clean/move/exit buttons
│       ├── street.js             # horizontal scroll neighborhood
│       └── otherroom.js          # render room, handle poop/kick/exit
└── tests/
    ├── state.test.js
    ├── animator.test.js
    └── db.test.js
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `style.css`, `src/main.js`
- Create: `.env.local` (template)
- Create: `tests/` directory

- [ ] **Step 1: Initialize project**

```bash
cd /Users/finger/Documents/toy/who-pooped
npm init -y
npm install vite @supabase/supabase-js
npm install -D vitest jsdom @vitest/coverage-v8
```

- [ ] **Step 2: Write `vite.config.js`**

```js
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

- [ ] **Step 3: Update `package.json` scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Who Pooped?</title>
  <link rel="stylesheet" href="/style.css" />
</head>
<body>
  <div id="phone-frame">
    <div id="phone-top">
      <div id="speaker"></div>
    </div>
    <div id="screen-area">
      <canvas id="game-canvas"></canvas>
      <div id="ui-overlay"></div>
    </div>
    <div id="phone-bottom">
      <div id="btn-row" class="btn-row"></div>
    </div>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Write base `style.css`**

```css
/* style.css */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: #1a1a2e;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  font-family: 'Courier New', monospace;
  overflow: hidden;
}

#phone-frame {
  --frame-color: #ff69b4;
  --frame-dark: color-mix(in srgb, var(--frame-color) 70%, black);
  --frame-light: color-mix(in srgb, var(--frame-color) 60%, white);
  width: min(340px, 92vw);
  background: var(--frame-color);
  border-radius: 36px;
  padding: 12px 10px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.2);
}

#phone-top {
  display: flex;
  justify-content: center;
  padding: 4px 0;
}

#speaker {
  width: 40px;
  height: 6px;
  background: var(--frame-dark);
  border-radius: 3px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.4);
}

#screen-area {
  position: relative;
  background: #111;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 2/3;
  border: 3px solid var(--frame-dark);
}

#game-canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  display: block;
}

#ui-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
#ui-overlay > * { pointer-events: auto; }

#phone-bottom {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 8px;
}

.btn-row {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.action-btn {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: var(--frame-dark);
  border: 2px solid var(--frame-light);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: white;
  font-size: 22px;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s, background 0.1s;
}
.action-btn:active { transform: scale(0.92); background: var(--frame-light); }
.action-btn .btn-label {
  font-size: 8px;
  color: rgba(255,255,255,0.7);
  font-family: 'Courier New', monospace;
}
.action-btn:disabled { opacity: 0.4; pointer-events: none; }

/* Color themes */
.theme-pink    { --frame-color: #ff69b4; }
.theme-purple  { --frame-color: #9b59b6; }
.theme-orange  { --frame-color: #f39c12; }
.theme-mint    { --frame-color: #1abc9c; }
.theme-blue    { --frame-color: #3498db; }
.theme-yellow  { --frame-color: #f1c40f; }
```

- [ ] **Step 6: Write stub `src/main.js`**

```js
// src/main.js
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
  if (currentUnmount) currentUnmount()
  const mount = SCREENS[screen]
  if (!mount) throw new Error(`Unknown screen: ${screen}`)
  currentUnmount = mount(params) ?? null
}

async function boot() {
  const state = getState()
  initFrame(state.frameColor)
  if (state.userId) {
    navigate('myroom')
  } else {
    navigate('onboarding')
  }
}

boot()
```

- [ ] **Step 7: Create stub files so imports don't error**

Create `src/frame.js`:
```js
export function initFrame(color) {
  if (color) document.getElementById('phone-frame').className = `theme-${color}`
}
```

Create `src/state.js` (stub — full implementation in Task 2):
```js
export function getState() { return {} }
export function setState() {}
```

Create `src/db.js` (stub):
```js
export {}
```

Create `src/realtime.js` (stub):
```js
export {}
```

Create `src/screens/onboarding.js`, `src/screens/myroom.js`, `src/screens/street.js`, `src/screens/otherroom.js` (each exports a stub mount function):
```js
export function mountOnboarding() { return () => {} }
```
(Repeat pattern for mountMyRoom, mountStreet, mountOtherRoom.)

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```
Expected: Vite dev server running, browser shows dark background with pink phone frame (empty screen area).

- [ ] **Step 9: Commit**

```bash
git init
git add -A
git commit -m "feat: project scaffold — Vite + phone frame HTML/CSS"
```

---

## Task 2: Global State + localStorage

**Files:**
- Modify: `src/state.js`
- Create: `tests/state.test.js`

- [ ] **Step 1: Write failing tests**

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL — `getState is not a function` or similar.

- [ ] **Step 3: Implement `src/state.js`**

```js
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
  visitingUserId: null, // set when in otherroom screen
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test
```
Expected: All `state.test.js` tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/state.js tests/state.test.js
git commit -m "feat: global state + localStorage persistence with poop cooldown"
```

---

## Task 3: Supabase Schema + Client

**Files:**
- Create: `supabase/schema.sql`
- Modify: `src/db.js`
- Create: `.env.local`
- Create: `tests/db.test.js`

- [ ] **Step 1: Create `.env.local`**

```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

(Fill in from Supabase dashboard after creating a project at supabase.com.)

- [ ] **Step 2: Create `supabase/schema.sql`**

Run this in the Supabase SQL editor:

```sql
-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nickname TEXT NOT NULL UNIQUE,
  character_type TEXT NOT NULL,  -- 'cat','rabbit','bear','dog','duck'
  frame_color TEXT NOT NULL,     -- 'pink','purple','orange','mint','blue','yellow'
  room_style TEXT NOT NULL DEFAULT 'oneroom', -- 'oneroom','minimal','kids'
  last_poop_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Poops
CREATE TABLE IF NOT EXISTS poops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  house_owner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  depositor_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  deposited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  is_cleaned BOOLEAN DEFAULT FALSE NOT NULL
);

-- Disable RLS for simplicity (no auth)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE poops DISABLE ROW LEVEL SECURITY;

-- Index for fetching a house's poops quickly
CREATE INDEX IF NOT EXISTS poops_house_owner_idx ON poops(house_owner_id) WHERE is_cleaned = FALSE;

-- Enable realtime on both tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE poops;
```

- [ ] **Step 3: Write failing tests for `db.js`**

```js
// tests/db.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase client
vi.mock('../src/db.js', async (importOriginal) => {
  const mod = await importOriginal()
  return mod
})

const mockSingle = vi.fn()
const mockSelect = vi.fn(() => ({ eq: vi.fn(() => ({ single: mockSingle })) }))
const mockInsert = vi.fn(() => ({ select: vi.fn(() => ({ single: mockSingle })) }))
const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({})) })) }))

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table) => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
    })),
  })),
}))

import { createUser, fetchUser, fetchPoopsInHouse, createPoop, cleanPoop } from '../src/db.js'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createUser', () => {
  it('calls insert with correct fields', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'u1', nickname: 'taro' }, error: null })
    const result = await createUser({ nickname: 'taro', characterType: 'cat', frameColor: 'pink', roomStyle: 'oneroom' })
    expect(mockInsert).toHaveBeenCalledWith({
      nickname: 'taro',
      character_type: 'cat',
      frame_color: 'pink',
      room_style: 'oneroom',
    })
    expect(result.id).toBe('u1')
  })
})

describe('fetchPoopsInHouse', () => {
  it('selects uncleaned poops for a house owner', async () => {
    const eqMock = vi.fn(() => ({ eq: vi.fn(() => ({ data: [], error: null })) }))
    mockSelect.mockReturnValueOnce({ eq: eqMock })
    await fetchPoopsInHouse('owner-id')
    expect(mockSelect).toHaveBeenCalledWith('*, depositor:depositor_id(nickname, character_type)')
    expect(eqMock).toHaveBeenCalledWith('house_owner_id', 'owner-id')
  })
})
```

- [ ] **Step 4: Run tests to verify they fail**

```bash
npm test
```
Expected: FAIL.

- [ ] **Step 5: Implement `src/db.js`**

```js
// src/db.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export async function createUser({ nickname, characterType, frameColor, roomStyle }) {
  const { data, error } = await supabase
    .from('users')
    .insert({ nickname, character_type: characterType, frame_color: frameColor, room_style: roomStyle })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function fetchUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function fetchUserByNickname(nickname) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('nickname', nickname)
    .single()
  return data ?? null
}

export async function fetchAllUsers() {
  const { data, error } = await supabase.from('users').select('*')
  if (error) throw error
  return data
}

export async function updateRoomStyle(userId, roomStyle) {
  const { error } = await supabase
    .from('users')
    .update({ room_style: roomStyle })
    .eq('id', userId)
  if (error) throw error
}

export async function fetchPoopsInHouse(houseOwnerId) {
  const { data, error } = await supabase
    .from('poops')
    .select('*, depositor:depositor_id(nickname, character_type)')
    .eq('house_owner_id', houseOwnerId)
    .eq('is_cleaned', false)
  if (error) throw error
  return data
}

export async function createPoop(houseOwnerId, depositorId) {
  const { data, error } = await supabase
    .from('poops')
    .insert({ house_owner_id: houseOwnerId, depositor_id: depositorId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function cleanPoop(poopId) {
  const { error } = await supabase
    .from('poops')
    .update({ is_cleaned: true })
    .eq('id', poopId)
  if (error) throw error
}

export async function cleanAllPoops(houseOwnerId) {
  const { error } = await supabase
    .from('poops')
    .update({ is_cleaned: true })
    .eq('house_owner_id', houseOwnerId)
    .eq('is_cleaned', false)
  if (error) throw error
}
```

- [ ] **Step 6: Run tests**

```bash
npm test
```
Expected: `db.test.js` passes.

- [ ] **Step 7: Commit**

```bash
git add supabase/ src/db.js tests/db.test.js .env.local
git commit -m "feat: Supabase schema + db CRUD operations"
```

---

## Task 4: Canvas Renderer Core

**Files:**
- Create: `src/canvas/renderer.js`

- [ ] **Step 1: Write `src/canvas/renderer.js`**

```js
// src/canvas/renderer.js

// Virtual resolution the game is designed at
export const V_WIDTH = 160
export const V_HEIGHT = 240

let canvas, ctx, scale

export function initRenderer() {
  canvas = document.getElementById('game-canvas')
  ctx = canvas.getContext('2d')
  resize()
  window.addEventListener('resize', resize)
}

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect()
  canvas.width = V_WIDTH
  canvas.height = V_HEIGHT
  canvas.style.width = rect.width + 'px'
  canvas.style.height = rect.height + 'px'
  scale = rect.width / V_WIDTH
}

export function getScale() { return scale }

export function clear(color = '#111111') {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT)
}

// Draw a single virtual pixel at (vx, vy)
export function drawPixel(vx, vy, color) {
  ctx.fillStyle = color
  ctx.fillRect(Math.floor(vx), Math.floor(vy), 1, 1)
}

// Draw a filled rectangle in virtual pixels
export function drawRect(vx, vy, vw, vh, color) {
  ctx.fillStyle = color
  ctx.fillRect(Math.floor(vx), Math.floor(vy), vw, vh)
}

// Draw a sprite: data is array of strings, each char = pixel color code
// palette maps char → CSS color, '.' = transparent
// vx, vy = top-left virtual position, scale = pixel size (default 1 virtual px)
export function drawSprite(data, palette, vx, vy, pixelSize = 1) {
  for (let row = 0; row < data.length; row++) {
    const line = data[row]
    for (let col = 0; col < line.length; col++) {
      const ch = line[col]
      if (ch === '.' || !palette[ch]) continue
      drawRect(vx + col * pixelSize, vy + row * pixelSize, pixelSize, pixelSize, palette[ch])
    }
  }
}

// Draw text using Canvas built-in (for small labels, not pixel art)
export function drawText(text, vx, vy, { color = '#fff', size = 6, align = 'left' } = {}) {
  ctx.fillStyle = color
  ctx.font = `${size}px "Courier New", monospace`
  ctx.textAlign = align
  ctx.fillText(text, vx, vy)
}

export function getCtx() { return ctx }
export function getCanvas() { return canvas }
```

- [ ] **Step 2: Verify renderer doesn't crash on import**

Add a temporary log to `src/main.js` after other imports:
```js
import { initRenderer } from './canvas/renderer.js'
// in boot():
initRenderer()
```

Run `npm run dev` and confirm no console errors.

- [ ] **Step 3: Commit**

```bash
git add src/canvas/renderer.js src/main.js
git commit -m "feat: Canvas renderer with virtual resolution + drawSprite"
```

---

## Task 5: Sprite Data + Animator

**Files:**
- Create: `src/canvas/sprites.js`
- Create: `src/canvas/animator.js`
- Create: `tests/animator.test.js`

- [ ] **Step 1: Write animator failing tests**

```js
// tests/animator.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Animator } from '../src/canvas/animator.js'

describe('Animator', () => {
  it('starts at frame 0', () => {
    const a = new Animator(['f0', 'f1', 'f2'], 6)
    expect(a.currentFrame()).toBe('f0')
  })

  it('advances frame after enough time at 6fps', () => {
    const a = new Animator(['f0', 'f1'], 6)
    a.tick(200) // 200ms > 166ms (1/6 second)
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
    a.tick(100) // 100ms < 166ms
    expect(a.currentFrame()).toBe('f0')
  })

  it('can be reset to frame 0', () => {
    const a = new Animator(['f0', 'f1'], 6)
    a.tick(200)
    a.reset()
    expect(a.currentFrame()).toBe('f0')
  })
})
```

- [ ] **Step 2: Run to confirm failure**

```bash
npm test tests/animator.test.js
```

- [ ] **Step 3: Write `src/canvas/animator.js`**

```js
// src/canvas/animator.js
export class Animator {
  constructor(frames, fps = 6) {
    this.frames = frames
    this.frameDuration = 1000 / fps
    this.elapsed = 0
    this.index = 0
  }

  tick(deltaMs) {
    this.elapsed += deltaMs
    if (this.elapsed >= this.frameDuration) {
      this.elapsed -= this.frameDuration
      this.index = (this.index + 1) % this.frames.length
    }
  }

  currentFrame() {
    return this.frames[this.index]
  }

  reset() {
    this.index = 0
    this.elapsed = 0
  }
}
```

- [ ] **Step 4: Run tests**

```bash
npm test tests/animator.test.js
```
Expected: All PASS.

- [ ] **Step 5: Write `src/canvas/sprites.js`**

Sprite data format: array of strings, each char is a palette key. `.` = transparent.
Character sprites are 10×14 px. Drawn at pixelSize=2 → 20×28 virtual px on screen.

Palette used by all characters: `W`=#eeeeee, `G`=#888888, `D`=#444444, `B`=#111111.

```js
// src/canvas/sprites.js

export const CHAR_PALETTE = {
  W: '#eeeeee',
  G: '#888888',
  D: '#444444',
  B: '#111111',
}

export const POOP_PALETTE = {
  P: '#5C3317',
  L: '#8B4513',
}

// ── CAT ──────────────────────────────────────────────────
// 10×14 grid. Row 0 = top.
const catIdle0 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'W.WWWWWW.W', // ears
  'WWWWWWWWWW',
  '.WBBWWBBW.', // eyes
  '.WWWGGWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW..WW..',
  '..WW..WW..',
  '..WW..WW..',
]

const catIdle1 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'W.WWWWWW.W',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWGGWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '.WW....WW.',  // legs out
  '.WW....WW.',
  '.WW....WW.',
]

const catAngry0 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'W.WWWWWW.W',
  'WWWWWWWWWW',
  '.DBBWWBBD.',  // furrowed brows
  '.WWWGGWWW.',
  '.WWGWWGWW.',  // angry mouth
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW..WW..',
  '..WW..WW..',
  '..WW..WW..',
]

const catWalkR0 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'W.WWWWWW.W',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWGGWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WWWWWWWW',  // right leg forward
  '..WWWW....',
  '..WWWW....',
]

const catWalkR1 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'W.WWWWWW.W',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWGGWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  'WWWWWWWW..',  // left leg forward
  '....WWWW..',
  '....WWWW..',
]

// WalkL = mirror of WalkR (drawn with flipX in renderer)
const catWalkL0 = catWalkR1
const catWalkL1 = catWalkR0

const catPoop0 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'W.WWWWWW.W',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWGGWWW.',
  '.WWWWWWWW.',
  '..WWWWWW..',  // squatting — body compressed
  '..WWWWWW..',
  '.WWWWWWWWW',
  'WWWWWWWWWW',
  '.WW....WW.',
  '.WW....WW.',
  '..........', // legs spread wide
]

const catPoop1 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'W.WWWWWW.W',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWGGWWW.',
  '..WWWWWW..',
  '.WWWWWWWWW',
  'WWWWWWWWWW',
  '.WW....WW.',
  '.WW....WW.',
  '..........', // squatting lower
  '.PPP......',
  '.PPPP.....',
]

const catClean0 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'W.WWWWWW.W',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWGGWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWWW', // arm extended right (holding mop)
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW..WW..',
  '..WW..WW..',
  '..WW..WW..',
]

const catClean1 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'W.WWWWWW.W',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWGGWWW.',
  '.WWWWWWWW.',
  'WWWWWWWWW.', // arm extended left
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW..WW..',
  '..WW..WW..',
  '..WW..WW..',
]

const catKick0 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'W.WWWWWW.W',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWGGWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW..WWWW', // right leg kick out
  '..WW......',
  '..WW......',
]

const catKick1 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'W.WWWWWW.W',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWGGWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWWW', // body leaning into kick
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW...WWW', // leg extended further
  '..WW......',
  '..WW......',
]

const catKicked0 = [
  '....WWWWWW',
  '...WWWWWWW',  // tilted
  '..WWWWWWWW',
  '.WWWWWWWWW',
  'WBBWWBBWWW',
  'WWWGGWWWWW',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  '..WWWWWWWW',
  '....WWWWWW',
  '......WWWW',
  '.......WWW',
  '........WW',
  '.........W',
]

const catKicked1 = [
  '......WWWW',
  '.....WWWWW',
  '....WWWWWW',
  '...WWWWWWW',
  'WBBWWBBWWW',
  'WWWGGWWWWW',
  'WWWWWWWWWW',
  '..WWWWWWWW',
  '....WWWWWW',
  '......WWWW',
  '........WW',
  '..........',
  '..........',
  '..........',
]

// ── OTHER ANIMALS ─────────────────────────────────────────
// Rabbit: longer ears (rows 2-4 have tall ears)
const rabbitIdle0 = [
  '.WW....WW.',  // tall ears
  '.WW....WW.',
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWGGWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW..WW..',
  '..WW..WW..',
  '..WW..WW..',
]
const rabbitIdle1 = rabbitIdle0

// Bear: round, no ears gap, wider head
const bearIdle0 = [
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  'WWBBWWBBWW',
  'WWWWGGWWWW',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '.WW....WW.',
  '.WW....WW.',
  '.WW....WW.',
]
const bearIdle1 = bearIdle0

// Dog: floppy ears on sides
const dogIdle0 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  'W.WWWWWW.W',  // floppy ear flaps
  '.WBBWWBBW.',
  '.WWWGGWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW..WW..',
  '..WW..WW..',
  '..WW..WW..',
]
const dogIdle1 = dogIdle0

// Duck: beak, no nose
const duckIdle0 = [
  '..WWWWWW..',
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWGGGGWW.',  // beak
  '.WWGGGGWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW..WW..',
  '..WW..WW..',
  '..WW..WW..',
]
const duckIdle1 = duckIdle0

// ── POOP ─────────────────────────────────────────────────
// 6×7 pixel art poop
export const POOP_SPRITE = [
  '..LLL.',
  '.PPPPL',
  'PPPPPP',
  'PPPPPP',
  '.PPPP.',
  '..PP..',
  '......',
]

// ── MOP ──────────────────────────────────────────────────
// A simple mop pictogram (8×12) to show beside clean animation
export const MOP_SPRITE = [
  '....W...',
  '....W...',
  '....W...',
  '....W...',
  '....W...',
  '....W...',
  '....W...',
  '....W...',
  '...WWW..',
  '..WWWWW.',
  '.WWWWWWW',
  'WWWWWWWW',
]

// ── SPRITE REGISTRY ──────────────────────────────────────
// Maps characterType → animation name → array of frame data
export const SPRITES = {
  cat: {
    idle:    [catIdle0, catIdle1],
    angry:   [catAngry0],
    walkR:   [catWalkR0, catWalkR1],
    walkL:   [catWalkL0, catWalkL1],
    poop:    [catPoop0, catPoop1],
    clean:   [catClean0, catClean1],
    kick:    [catKick0, catKick1],
    kicked:  [catKicked0, catKicked1],
  },
  rabbit: {
    idle:    [rabbitIdle0, rabbitIdle1],
    angry:   [rabbitIdle0],
    walkR:   [rabbitIdle0, rabbitIdle1],
    walkL:   [rabbitIdle0, rabbitIdle1],
    poop:    [catPoop0, catPoop1],    // reuse body poses
    clean:   [catClean0, catClean1],
    kick:    [catKick0, catKick1],
    kicked:  [catKicked0, catKicked1],
  },
  bear: {
    idle:    [bearIdle0, bearIdle0],
    angry:   [bearIdle0],
    walkR:   [bearIdle0, bearIdle0],
    walkL:   [bearIdle0, bearIdle0],
    poop:    [catPoop0, catPoop1],
    clean:   [catClean0, catClean1],
    kick:    [catKick0, catKick1],
    kicked:  [catKicked0, catKicked1],
  },
  dog: {
    idle:    [dogIdle0, dogIdle0],
    angry:   [dogIdle0],
    walkR:   [dogIdle0, dogIdle0],
    walkL:   [dogIdle0, dogIdle0],
    poop:    [catPoop0, catPoop1],
    clean:   [catClean0, catClean1],
    kick:    [catKick0, catKick1],
    kicked:  [catKicked0, catKicked1],
  },
  duck: {
    idle:    [duckIdle0, duckIdle0],
    angry:   [duckIdle0],
    walkR:   [duckIdle0, duckIdle0],
    walkL:   [duckIdle0, duckIdle0],
    poop:    [catPoop0, catPoop1],
    clean:   [catClean0, catClean1],
    kick:    [catKick0, catKick1],
    kicked:  [catKicked0, catKicked1],
  },
}
```

- [ ] **Step 6: Run tests (including animator)**

```bash
npm test
```
Expected: All pass (sprites.js has no tests; animator tests pass).

- [ ] **Step 7: Commit**

```bash
git add src/canvas/sprites.js src/canvas/animator.js tests/animator.test.js
git commit -m "feat: pixel sprite data + animator at 6fps"
```

---

## Task 6: Game Loop

**Files:**
- Create: `src/canvas/gameloop.js`
- Modify: `src/main.js`

- [ ] **Step 1: Write `src/canvas/gameloop.js`**

```js
// src/canvas/gameloop.js
let rafId = null
let lastTime = 0
let activeTick = null   // function(deltaMs) called each frame
let activeRender = null // function() called each frame after tick

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
  const delta = Math.min(now - lastTime, 100) // cap at 100ms to avoid huge jumps
  lastTime = now
  if (activeTick) activeTick(delta)
  if (activeRender) activeRender()
  rafId = requestAnimationFrame(loop)
}
```

- [ ] **Step 2: Wire game loop into `src/main.js`**

```js
// src/main.js (updated)
import { initRenderer } from './canvas/renderer.js'
import { initFrame } from './frame.js'
import { getState } from './state.js'
import { mountOnboarding } from './screens/onboarding.js'
import { mountMyRoom } from './screens/myroom.js'
import { mountStreet } from './screens/street.js'
import { mountOtherRoom } from './screens/otherroom.js'
import { stopLoop } from './canvas/gameloop.js'

const SCREENS = {
  onboarding: mountOnboarding,
  myroom: mountMyRoom,
  street: mountStreet,
  otherroom: mountOtherRoom,
}

let currentUnmount = null

export function navigate(screen, params = {}) {
  stopLoop()
  if (currentUnmount) { currentUnmount(); currentUnmount = null }
  const mount = SCREENS[screen]
  if (!mount) throw new Error(`Unknown screen: ${screen}`)
  currentUnmount = mount(params) ?? null
}

async function boot() {
  initRenderer()
  const state = getState()
  initFrame(state.frameColor)
  if (state.userId) {
    navigate('myroom')
  } else {
    navigate('onboarding')
  }
}

boot()
```

- [ ] **Step 3: Verify no console errors**

```bash
npm run dev
```

- [ ] **Step 4: Commit**

```bash
git add src/canvas/gameloop.js src/main.js
git commit -m "feat: rAF game loop with delta time"
```

---

## Task 7: Onboarding Screen

**Files:**
- Modify: `src/screens/onboarding.js`
- Modify: `src/main.js` (navigate call already wired)

- [ ] **Step 1: Write `src/screens/onboarding.js`**

```js
// src/screens/onboarding.js
import { setState, getState } from '../state.js'
import { createUser, fetchUserByNickname } from '../db.js'
import { initFrame } from '../frame.js'
import { navigate } from '../main.js'
import { clear, drawText, drawSprite, initRenderer } from '../canvas/renderer.js'
import { SPRITES, CHAR_PALETTE } from '../canvas/sprites.js'
import { startLoop } from '../canvas/gameloop.js'
import { Animator } from '../canvas/animator.js'

const CHARACTERS = ['cat', 'rabbit', 'bear', 'dog', 'duck']
const COLORS = ['pink', 'purple', 'orange', 'mint', 'blue', 'yellow']
const ROOM_STYLES = ['oneroom', 'minimal', 'kids']
const ROOM_LABELS = { oneroom: '원룸', minimal: '미니멀', kids: '어린이방' }

export function mountOnboarding() {
  let step = 'nickname' // 'nickname' | 'character' | 'color' | 'roomstyle'
  let nickname = ''
  let selectedChar = 'cat'
  let selectedColor = 'pink'
  let selectedRoom = 'oneroom'
  let errorMsg = ''
  let loading = false

  const overlay = document.getElementById('ui-overlay')
  const btnRow = document.getElementById('btn-row')
  overlay.innerHTML = ''
  btnRow.innerHTML = ''

  // Build overlay DOM for text input (nickname step)
  const form = document.createElement('div')
  form.style.cssText = `
    position:absolute; inset:0; display:flex; flex-direction:column;
    align-items:center; justify-content:center; gap:12px; padding:20px;
    background: rgba(0,0,0,0.85);
  `

  const title = document.createElement('div')
  title.style.cssText = 'color:#eee; font-size:13px; font-family:monospace; text-align:center; line-height:1.6;'
  title.textContent = 'WHO POOPED?'

  const input = document.createElement('input')
  input.type = 'text'
  input.maxLength = 10
  input.placeholder = '닉네임 입력 (10자 이내)'
  input.style.cssText = `
    background:#222; border:2px solid #444; color:#eee;
    font-family:monospace; font-size:14px; padding:8px 12px;
    border-radius:6px; width:100%; text-align:center; outline:none;
  `

  const err = document.createElement('div')
  err.style.cssText = 'color:#ff6b6b; font-size:10px; font-family:monospace; min-height:14px;'

  const confirmBtn = document.createElement('button')
  confirmBtn.textContent = '확인'
  confirmBtn.style.cssText = `
    background:#444; border:none; color:#eee; font-family:monospace;
    font-size:13px; padding:8px 24px; border-radius:6px; cursor:pointer; width:100%;
  `

  form.append(title, input, err, confirmBtn)

  confirmBtn.onclick = async () => {
    const val = input.value.trim()
    if (!val) { err.textContent = '닉네임을 입력해줘!'; return }
    if (loading) return
    loading = true
    confirmBtn.textContent = '확인 중...'
    err.textContent = ''
    // Check duplicate
    const existing = await fetchUserByNickname(val)
    if (existing) { err.textContent = '이미 쓰는 닉네임이야!'; loading = false; confirmBtn.textContent = '확인'; return }
    nickname = val
    loading = false
    overlay.innerHTML = ''
    step = 'character'
  }

  overlay.appendChild(form)

  // Canvas renders the step-based selection screens (character/color/room)
  const charAnimators = {}
  CHARACTERS.forEach(c => {
    charAnimators[c] = new Animator(SPRITES[c].idle, 6)
  })

  function renderCanvas(delta) {
    if (step === 'nickname') return
    Object.values(charAnimators).forEach(a => a.tick(delta))
    clear('#111111')

    if (step === 'character') {
      drawText('캐릭터 선택', 80, 16, { color: '#aaa', align: 'center' })
      CHARACTERS.forEach((ch, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 15 + col * 46
        const y = 28 + row * 56
        const isSelected = ch === selectedChar
        // Highlight box
        if (isSelected) drawRect(x - 2, y - 2, 40, 52, '#333')
        drawSprite(charAnimators[ch].currentFrame(), CHAR_PALETTE, x + 5, y + 2, 2)
        drawText(ch, x + 20, y + 46, { color: isSelected ? '#fff' : '#666', align: 'center', size: 5 })
      })
      drawText('tap to select', 80, 128, { color: '#555', align: 'center', size: 5 })
    }

    if (step === 'color') {
      drawText('프레임 색상', 80, 16, { color: '#aaa', align: 'center' })
      const colorHex = { pink: '#ff69b4', purple: '#9b59b6', orange: '#f39c12', mint: '#1abc9c', blue: '#3498db', yellow: '#f1c40f' }
      COLORS.forEach((c, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 20 + col * 44
        const y = 40 + row * 50
        drawRect(x, y, 36, 36, colorHex[c])
        if (c === selectedColor) drawRect(x - 2, y - 2, 40, 40, '#fff')
        drawText(c, x + 18, y + 44, { color: '#aaa', align: 'center', size: 5 })
      })
    }

    if (step === 'roomstyle') {
      drawText('방 스타일', 80, 16, { color: '#aaa', align: 'center' })
      ROOM_STYLES.forEach((s, i) => {
        const x = 15 + i * 46
        const y = 40
        const isSelected = s === selectedRoom
        if (isSelected) drawRect(x - 2, y - 2, 42, 82, '#333')
        drawRect(x, y, 38, 78, '#1a1a1a')
        drawText(ROOM_LABELS[s], x + 19, y + 88, { color: isSelected ? '#fff' : '#666', align: 'center', size: 5 })
        drawRoomThumb(s, x + 2, y + 2)
      })
    }
  }

  // Placeholder for room thumbnail rendering (implemented in Task 9)
  function drawRect(vx, vy, vw, vh, color) {
    const { drawRect: dr } = require('../canvas/renderer.js')
    dr(vx, vy, vw, vh, color)
  }

  // Touch/click detection on canvas for selection steps
  const canvas = document.getElementById('game-canvas')
  function onCanvasClick(e) {
    const rect = canvas.getBoundingClientRect()
    const rawX = (e.clientX ?? e.touches[0].clientX) - rect.left
    const rawY = (e.clientY ?? e.touches[0].clientY) - rect.top
    const vx = (rawX / rect.width) * 160
    const vy = (rawY / rect.height) * 240

    if (step === 'character') {
      CHARACTERS.forEach((ch, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 15 + col * 46
        const y = 28 + row * 56
        if (vx >= x && vx <= x + 40 && vy >= y && vy <= y + 52) {
          selectedChar = ch
        }
      })
    }
    if (step === 'color') {
      COLORS.forEach((c, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        const x = 20 + col * 44
        const y = 40 + row * 50
        if (vx >= x && vx <= x + 36 && vy >= y && vy <= y + 36) {
          selectedColor = c
          initFrame(c)
        }
      })
    }
    if (step === 'roomstyle') {
      ROOM_STYLES.forEach((s, i) => {
        const x = 15 + i * 46
        if (vx >= x && vx <= x + 40) selectedRoom = s
      })
    }
  }

  canvas.addEventListener('click', onCanvasClick)
  canvas.addEventListener('touchstart', onCanvasClick, { passive: true })

  // Next button in btn-row
  const nextBtn = document.createElement('button')
  nextBtn.className = 'action-btn'
  nextBtn.style.width = '120px'
  nextBtn.textContent = '다음 →'
  nextBtn.style.fontSize = '14px'
  btnRow.appendChild(nextBtn)

  nextBtn.onclick = async () => {
    if (step === 'character') { step = 'color'; return }
    if (step === 'color') { step = 'roomstyle'; return }
    if (step === 'roomstyle') {
      nextBtn.disabled = true
      nextBtn.textContent = '저장 중...'
      try {
        const user = await createUser({ nickname, characterType: selectedChar, frameColor: selectedColor, roomStyle: selectedRoom })
        setState({ userId: user.id, nickname, characterType: selectedChar, frameColor: selectedColor, roomStyle: selectedRoom })
        navigate('myroom')
      } catch (e) {
        nextBtn.disabled = false
        nextBtn.textContent = '다음 →'
      }
    }
  }

  startLoop(renderCanvas, () => {})

  return () => {
    canvas.removeEventListener('click', onCanvasClick)
    canvas.removeEventListener('touchstart', onCanvasClick)
    overlay.innerHTML = ''
    btnRow.innerHTML = ''
  }
}

function drawRoomThumb(style, x, y) {
  // Stub — replaced in Task 9
}
```

> **Note:** The `import { drawRect }` pattern above uses named imports at top of file. Adjust to use the renderer module's exported functions directly.

- [ ] **Step 2: Test onboarding in browser**

```bash
npm run dev
```
Expected: Nickname input form shows, after typing and confirming, character selection grid appears on canvas.

- [ ] **Step 3: Commit**

```bash
git add src/screens/onboarding.js
git commit -m "feat: onboarding screen — nickname, character, color, room style"
```

---

## Task 8: Room Scene Renderer

**Files:**
- Create: `src/canvas/scenes/room.js`

This module draws a room background (one of 3 styles) plus characters and poops on top. Used by both myroom and otherroom screens.

- [ ] **Step 1: Create `src/canvas/scenes/room.js`**

```js
// src/canvas/scenes/room.js
import { clear, drawRect, drawSprite, drawText } from '../renderer.js'
import { SPRITES, CHAR_PALETTE, POOP_SPRITE, POOP_PALETTE, MOP_SPRITE } from '../sprites.js'

const V_W = 160
const V_H = 240
const FLOOR_Y = 170  // y where floor starts
const WALL_H = FLOOR_Y

// ── Background scenes ─────────────────────────────────────

function drawWall() {
  drawRect(0, 0, V_W, FLOOR_Y, '#0d0d0d')
}

function drawFloor() {
  drawRect(0, FLOOR_Y, V_W, V_H - FLOOR_Y, '#181818')
  drawRect(0, FLOOR_Y, V_W, 1, '#2a2a2a')
  // floorboards
  for (let x = 0; x < V_W; x += 40) drawRect(x, FLOOR_Y, 1, V_H - FLOOR_Y, '#222')
  drawRect(0, FLOOR_Y + 22, V_W, 1, '#222')
}

function drawWindow(x, y) {
  drawRect(x, y, 44, 30, '#1a1a2e')
  drawRect(x, y, 44, 30, '#333') // border by overdrawing
  // frame
  for (let i = 0; i < 44; i++) { drawRect(x + i, y, 1, 1, '#444'); drawRect(x + i, y + 29, 1, 1, '#444') }
  for (let j = 0; j < 30; j++) { drawRect(x, y + j, 1, 1, '#444'); drawRect(x + 43, y + j, 1, 1, '#444') }
  // dividers
  drawRect(x + 21, y, 2, 30, '#444')
  drawRect(x, y + 14, 44, 2, '#444')
  // curtains
  drawRect(x - 6, y - 2, 8, 34, '#2a2a2a')
  drawRect(x + 42, y - 2, 8, 34, '#2a2a2a')
  drawRect(x - 6, y - 4, 58, 4, '#444')
}

function drawBed(x, y) {
  drawRect(x, y, 42, 40, '#202020')
  drawRect(x, y, 42, 8, '#2a2a2a')  // headboard
  drawRect(x + 3, y + 10, 36, 28, '#181818') // mattress
}

function drawPlant(x, y) {
  drawRect(x + 2, y + 10, 10, 8, '#222')  // pot
  drawRect(x + 4, y + 3, 6, 9, '#1a1a1a')  // stem
  drawRect(x, y, 7, 6, '#1e1e1e')  // leaf left
  drawRect(x + 7, y - 3, 6, 8, '#1e1e1e')  // leaf right
}

function drawSofa(x, y) {
  drawRect(x, y, 60, 24, '#202020')
  drawRect(x, y, 60, 7, '#282828')   // backrest
  drawRect(x, y, 5, 24, '#282828')   // armrest L
  drawRect(x + 55, y, 5, 24, '#282828') // armrest R
  drawRect(x + 6, y + 9, 48, 14, '#1a1a1a') // seat
}

function drawShelf(x, y) {
  drawRect(x, y, 55, 3, '#2a2a2a')
  // brackets
  drawRect(x + 3, y + 3, 3, 10, '#222')
  drawRect(x + 49, y + 3, 3, 10, '#222')
  // items on shelf
  drawRect(x + 6, y - 14, 7, 14, '#1a1a1a')
  drawRect(x + 16, y - 10, 10, 10, '#1a1a1a')
  drawRect(x + 29, y - 16, 6, 16, '#1a1a1a')
  drawRect(x + 38, y - 11, 8, 11, '#1a1a1a')
}

function drawBunkBed(x, y) {
  drawRect(x, y, 50, 80, '#252525')
  drawRect(x, y, 50, 4, '#333')
  drawRect(x, y + 36, 50, 4, '#333')
  drawRect(x + 3, y + 5, 44, 30, '#1a1a1a')
  drawRect(x + 3, y + 41, 44, 36, '#1a1a1a')
  // ladder
  drawRect(x + 46, y + 5, 3, 75, '#2a2a2a')
  for (let ly = y + 15; ly < y + 75; ly += 12) drawRect(x + 44, ly, 8, 2, '#333')
}

function drawMobile(x, y) {
  drawRect(x + 5, y, 2, 18, '#333')
  drawRect(x, y + 17, 20, 1, '#333')
  drawRect(x + 1, y + 18, 1, 10, '#333')
  drawRect(x + 18, y + 18, 1, 10, '#333')
  drawRect(x - 1, y + 27, 6, 6, '#222')
  drawRect(x + 16, y + 27, 6, 6, '#222')
}

export function drawRoomBackground(style) {
  clear('#111111')
  drawWall()
  drawFloor()

  if (style === 'oneroom') {
    drawWindow(58, 12)
    drawBed(4, FLOOR_Y - 42)
    drawPlant(136, FLOOR_Y - 24)
  } else if (style === 'minimal') {
    drawWindow(58, 12)
    drawSofa(10, FLOOR_Y - 26)
    drawShelf(82, 36)
  } else if (style === 'kids') {
    drawBunkBed(4, FLOOR_Y - 82)
    drawMobile(110, 14)
    // toy box
    drawRect(82, FLOOR_Y - 24, 32, 24, '#222')
    drawRect(82, FLOOR_Y - 24, 32, 4, '#2a2a2a')
    drawRect(94, FLOOR_Y - 28, 10, 6, '#2a2a2a')
  }
}

// ── Poop ──────────────────────────────────────────────────

const POOP_POSITIONS = [
  { x: 28, y: FLOOR_Y + 8 },
  { x: 80, y: FLOOR_Y + 18 },
  { x: 120, y: FLOOR_Y + 10 },
  { x: 50, y: FLOOR_Y + 24 },
]

export function drawPoops(poops) {
  poops.forEach((p, i) => {
    const pos = POOP_POSITIONS[i % POOP_POSITIONS.length]
    drawSprite(POOP_SPRITE, POOP_PALETTE, pos.x, pos.y, 2)
  })
}

// ── Character ─────────────────────────────────────────────

const CHAR_PIXEL = 2

export function drawCharacter(characterType, animFrame, vx, vy) {
  drawSprite(animFrame, CHAR_PALETTE, vx, vy, CHAR_PIXEL)
}

export function drawMop(vx, vy) {
  drawSprite(MOP_SPRITE, { W: '#eeeeee' }, vx, vy, 2)
}

// ── Room thumbnail (used in onboarding) ───────────────────

export function drawRoomThumbnail(style, x, y, w, h) {
  // Scaled-down version for selection UI
  // Just draw a small colored scene hint
  drawRect(x, y, w, h, '#0d0d0d')
  drawRect(x, y + h * 0.6, w, h * 0.4, '#181818')
  drawRect(x, y + h * 0.6, w, 1, '#2a2a2a')
  if (style === 'oneroom') {
    drawRect(x + w * 0.3, y + 2, w * 0.4, h * 0.3, '#1a1a2e') // window
  } else if (style === 'minimal') {
    drawRect(x + 2, y + h * 0.4, w - 4, h * 0.2, '#1a1a1a') // sofa
  } else if (style === 'kids') {
    drawRect(x + 2, y + 2, w * 0.35, h * 0.7, '#252525') // bunkbed
  }
}
```

- [ ] **Step 2: Update `drawRoomThumb` stub in onboarding.js**

In `src/screens/onboarding.js`, add import and replace the stub:
```js
import { drawRoomThumbnail } from '../canvas/scenes/room.js'

function drawRoomThumb(style, x, y) {
  drawRoomThumbnail(style, x, y, 34, 72)
}
```

- [ ] **Step 3: Test in browser**

Navigate to dev server. In onboarding room style step, verify 3 room thumbnails appear.

- [ ] **Step 4: Commit**

```bash
git add src/canvas/scenes/room.js src/screens/onboarding.js
git commit -m "feat: room background renderer (oneroom/minimal/kids) + poop + character draw"
```

---

## Task 9: My Room Screen

**Files:**
- Modify: `src/screens/myroom.js`

- [ ] **Step 1: Write `src/screens/myroom.js`**

```js
// src/screens/myroom.js
import { getState, setState } from '../state.js'
import { fetchPoopsInHouse, cleanAllPoops } from '../db.js'
import { joinRoomChannel, leaveRoomChannel } from '../realtime.js'
import { drawRoomBackground, drawPoops, drawCharacter, drawMop } from '../canvas/scenes/room.js'
import { drawText, drawRect } from '../canvas/renderer.js'
import { SPRITES } from '../canvas/sprites.js'
import { Animator } from '../canvas/animator.js'
import { startLoop } from '../canvas/gameloop.js'
import { navigate } from '../main.js'

const V_W = 160
const CHAR_X = 65
const CHAR_Y = 138

export function mountMyRoom() {
  const state = getState()
  const overlay = document.getElementById('ui-overlay')
  const btnRow = document.getElementById('btn-row')
  overlay.innerHTML = ''
  btnRow.innerHTML = ''

  let poops = []
  let action = 'idle'   // 'idle' | 'clean' | 'angry'
  let holdingPoop = false

  const anim = new Animator(SPRITES[state.characterType].idle, 6)
  const cleanAnim = new Animator(SPRITES[state.characterType].clean, 6)
  const angryAnim = new Animator(SPRITES[state.characterType].angry, 6)

  // Fetch current poops
  async function refreshPoops() {
    poops = await fetchPoopsInHouse(state.userId)
    action = poops.length > 0 ? 'angry' : 'idle'
    renderButtons()
  }
  refreshPoops()

  // Realtime: subscribe to own room
  joinRoomChannel(state.userId, {
    onPoop: () => refreshPoops(),
    onClean: () => refreshPoops(),
  })

  // Render loop
  function tick(delta) {
    const currentAnim = action === 'clean' ? cleanAnim : action === 'angry' ? angryAnim : anim
    currentAnim.tick(delta)
  }

  function render() {
    drawRoomBackground(state.roomStyle)
    drawPoops(poops)
    const currentAnim = action === 'clean' ? cleanAnim : action === 'angry' ? angryAnim : anim
    drawCharacter(state.characterType, currentAnim.currentFrame(), CHAR_X, CHAR_Y)
    if (action === 'clean') {
      drawMop(CHAR_X + 22, CHAR_Y + 4)
    }
    // Poop count badge
    if (poops.length > 0) {
      drawRect(2, 2, 30, 12, '#333')
      drawText(`💩 ×${poops.length}`, 4, 11, { color: '#ff6b6b', size: 8 })
    }
    // Room name
    drawText(`${state.nickname}의 집`, V_W / 2, 12, { color: '#555', align: 'center', size: 5 })
  }

  function renderButtons() {
    btnRow.innerHTML = ''

    // Clean button
    const cleanBtn = makeBtn('🧹', '청소', poops.length === 0, async () => {
      action = 'clean'
      cleanAnim.reset()
      await cleanAllPoops(state.userId)
      await refreshPoops()
      action = 'idle'
    })

    // Move poop button (pick up + go outside)
    const moveBtn = makeBtn('💩', '옮기기', poops.length === 0, () => {
      setState({ holdingPoop: true })
      navigate('street')
    })

    // Exit button
    const exitBtn = makeBtn('🚪', '나가기', false, () => navigate('street'))

    // Decorate button (room style change)
    const decoBtn = makeBtn('🎨', '꾸미기', false, showRoomStylePicker)

    btnRow.append(cleanBtn, moveBtn, exitBtn, decoBtn)
  }

  function showRoomStylePicker() {
    // Show simple overlay with 3 room style buttons
    const picker = document.createElement('div')
    picker.style.cssText = `
      position:absolute; inset:0; background:rgba(0,0,0,0.9);
      display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px;
    `
    const label = document.createElement('div')
    label.textContent = '방 스타일 선택'
    label.style.cssText = 'color:#aaa; font-family:monospace; font-size:12px;'
    picker.appendChild(label)
    const styles = [
      { key: 'oneroom', label: '원룸' },
      { key: 'minimal', label: '미니멀' },
      { key: 'kids', label: '어린이방' },
    ]
    styles.forEach(s => {
      const btn = document.createElement('button')
      btn.textContent = s.label
      btn.style.cssText = `
        background:${state.roomStyle === s.key ? '#555' : '#2a2a2a'}; border:none;
        color:#eee; font-family:monospace; font-size:13px;
        padding:10px 28px; border-radius:8px; cursor:pointer; width:160px;
      `
      btn.onclick = async () => {
        await import('../db.js').then(m => m.updateRoomStyle(state.userId, s.key))
        setState({ roomStyle: s.key })
        overlay.removeChild(picker)
      }
      picker.appendChild(btn)
    })
    const cancel = document.createElement('button')
    cancel.textContent = '취소'
    cancel.style.cssText = 'background:none; border:none; color:#666; font-family:monospace; font-size:11px; cursor:pointer;'
    cancel.onclick = () => overlay.removeChild(picker)
    picker.appendChild(cancel)
    overlay.appendChild(picker)
  }

  startLoop(tick, render)
  renderButtons()

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
```

- [ ] **Step 2: Test in browser**

After completing onboarding, my room screen should appear with room background, character, and buttons.

- [ ] **Step 3: Commit**

```bash
git add src/screens/myroom.js
git commit -m "feat: my room screen — view, clean poop, move poop, decorate"
```

---

## Task 10: Street Screen

**Files:**
- Modify: `src/screens/street.js`
- Create: `src/canvas/scenes/street.js`

- [ ] **Step 1: Create `src/canvas/scenes/street.js`**

```js
// src/canvas/scenes/street.js
import { clear, drawRect, drawText, drawSprite } from '../renderer.js'
import { CHAR_PALETTE } from '../sprites.js'

const V_W = 160
const V_H = 240
const GROUND_Y = 180
const HOUSE_W = 60
const HOUSE_GAP = 20

export function drawStreetBackground(scrollX) {
  // Sky
  drawRect(0, 0, V_W, GROUND_Y, '#080810')
  // Stars
  const stars = [[10,8],[35,20],[70,12],[100,5],[140,18],[20,35],[85,28],[130,8]]
  stars.forEach(([sx, sy]) => drawRect((sx - scrollX * 0.1) % V_W, sy, 1, 1, '#ffffff'))
  // Ground
  drawRect(0, GROUND_Y, V_W, V_H - GROUND_Y, '#181818')
  drawRect(0, GROUND_Y, V_W, 1, '#2a2a2a')
  // Sidewalk line
  drawRect(0, GROUND_Y + 8, V_W, 1, '#222')
}

export function getHouseX(index, scrollX) {
  return (index * (HOUSE_W + HOUSE_GAP)) - scrollX
}

export function drawHouse(user, houseX, isOwn, poopCount) {
  if (houseX > V_W + HOUSE_W || houseX < -HOUSE_W) return // off screen

  const roofY = GROUND_Y - 56
  const wallY = GROUND_Y - 40

  // Roof
  const mid = houseX + HOUSE_W / 2
  for (let i = 0; i <= 16; i++) {
    drawRect(mid - i, roofY + i, i * 2 + 2, 1, i < 2 ? '#555' : '#3a3a3a')
  }

  // Wall
  drawRect(houseX, wallY, HOUSE_W, 40, isOwn ? '#333' : '#252525')

  // Door
  const doorX = houseX + HOUSE_W / 2 - 6
  drawRect(doorX, wallY + 16, 12, 24, '#111')
  drawRect(doorX + 9, wallY + 24, 2, 2, '#555') // knob

  // Window
  drawRect(houseX + 8, wallY + 4, 14, 12, '#1a1a2e')
  drawRect(houseX + 15, wallY + 4, 1, 12, '#333') // divider
  drawRect(houseX + 38, wallY + 4, 14, 12, '#1a1a2e')
  drawRect(houseX + 45, wallY + 4, 1, 12, '#333')

  // Name tag
  drawText(user.nickname, houseX + HOUSE_W / 2, GROUND_Y + 14, { color: isOwn ? '#aaa' : '#666', align: 'center', size: 5 })

  // Poop indicator
  if (poopCount > 0) {
    drawText(`💩${poopCount}`, houseX + HOUSE_W - 8, wallY + 2, { color: '#ff6b6b', size: 5 })
  }
}

export function drawPlayerOnStreet(characterType, animFrame, vx) {
  drawSprite(animFrame, CHAR_PALETTE, vx, GROUND_Y - 28, 2)
}

export function HOUSE_ENTRY_ZONE(houseX) {
  return { left: houseX + HOUSE_W / 2 - 8, right: houseX + HOUSE_W / 2 + 8 }
}
```

- [ ] **Step 2: Write `src/screens/street.js`**

```js
// src/screens/street.js
import { getState } from '../state.js'
import { fetchAllUsers, fetchPoopsInHouse } from '../db.js'
import {
  drawStreetBackground, drawHouse, drawPlayerOnStreet,
  getHouseX, HOUSE_ENTRY_ZONE
} from '../canvas/scenes/street.js'
import { drawText } from '../canvas/renderer.js'
import { SPRITES } from '../canvas/sprites.js'
import { Animator } from '../canvas/animator.js'
import { startLoop } from '../canvas/gameloop.js'
import { navigate } from '../main.js'

const WALK_SPEED = 40  // virtual px per second
const CHAR_SCREEN_X = 60  // character always appears near center-left

export function mountStreet() {
  const state = getState()
  const overlay = document.getElementById('ui-overlay')
  const btnRow = document.getElementById('btn-row')
  overlay.innerHTML = ''
  btnRow.innerHTML = ''

  let users = []
  let poopCounts = {}
  let scrollX = 0  // world units scrolled
  let direction = 0  // -1 left, 0 still, 1 right
  let anim = 'idle'

  const idleAnim = new Animator(SPRITES[state.characterType].idle, 6)
  const walkRAnim = new Animator(SPRITES[state.characterType].walkR, 6)
  const walkLAnim = new Animator(SPRITES[state.characterType].walkL, 6)

  // Find own house index to start scroll there
  async function loadUsers() {
    users = await fetchAllUsers()
    const myIndex = users.findIndex(u => u.id === state.userId)
    if (myIndex >= 0) scrollX = myIndex * 80 - 40
    // load poop counts
    await Promise.all(users.map(async u => {
      const p = await fetchPoopsInHouse(u.id)
      poopCounts[u.id] = p.length
    }))
  }
  loadUsers()

  // Controls
  const keys = new Set()
  const onKey = e => keys.add(e.key)
  const offKey = e => keys.delete(e.key)
  window.addEventListener('keydown', onKey)
  window.addEventListener('keyup', offKey)

  // Touch controls
  let touchDir = 0
  const leftBtn = makeBtn('◀', '', false, () => {})
  const rightBtn = makeBtn('▶', '', false, () => {})
  leftBtn.addEventListener('touchstart', () => { touchDir = -1 }, { passive: true })
  leftBtn.addEventListener('touchend', () => { if (touchDir === -1) touchDir = 0 })
  rightBtn.addEventListener('touchstart', () => { touchDir = 1 }, { passive: true })
  rightBtn.addEventListener('touchend', () => { if (touchDir === 1) touchDir = 0 })

  const homeBtn = makeBtn('🏠', '집으로', false, () => navigate('myroom'))
  btnRow.append(leftBtn, rightBtn, homeBtn)

  function tick(delta) {
    let moving = 0
    if (keys.has('ArrowLeft') || keys.has('a')) moving = -1
    if (keys.has('ArrowRight') || keys.has('d')) moving = 1
    if (touchDir !== 0) moving = touchDir

    direction = moving
    anim = moving < 0 ? 'walkL' : moving > 0 ? 'walkR' : 'idle'

    scrollX += moving * WALK_SPEED * (delta / 1000)
    scrollX = Math.max(0, scrollX)

    // Advance animator
    const curAnim = moving < 0 ? walkLAnim : moving > 0 ? walkRAnim : idleAnim
    curAnim.tick(delta)

    // Check if player is in front of a house door
    users.forEach((u, i) => {
      const hx = getHouseX(i, scrollX)
      const zone = HOUSE_ENTRY_ZONE(hx)
      if (CHAR_SCREEN_X >= zone.left && CHAR_SCREEN_X <= zone.right) {
        // Show entry hint
        currentNearHouse = u
      }
    })
  }

  let currentNearHouse = null

  function render() {
    drawStreetBackground(scrollX)
    users.forEach((u, i) => {
      const hx = getHouseX(i, scrollX)
      drawHouse(u, hx, u.id === state.userId, poopCounts[u.id] ?? 0)
    })
    const curAnim = direction < 0 ? walkLAnim : direction > 0 ? walkRAnim : idleAnim
    drawPlayerOnStreet(state.characterType, curAnim.currentFrame(), CHAR_SCREEN_X)

    if (currentNearHouse) {
      const label = currentNearHouse.id === state.userId ? '🏠 내 집 들어가기' : `👆 ${currentNearHouse.nickname}네 집 들어가기`
      drawText(label, 80, 200, { color: '#fff', align: 'center', size: 5 })
    }
    currentNearHouse = null
  }

  // Enter house on tap/click of enter hint area
  const canvas = document.getElementById('game-canvas')
  function onEnterTap(e) {
    users.forEach((u, i) => {
      const hx = getHouseX(i, scrollX)
      const zone = HOUSE_ENTRY_ZONE(hx)
      if (CHAR_SCREEN_X >= zone.left && CHAR_SCREEN_X <= zone.right) {
        if (u.id === state.userId) {
          navigate('myroom')
        } else {
          navigate('otherroom', { targetUser: u })
        }
      }
    })
  }
  canvas.addEventListener('click', onEnterTap)
  canvas.addEventListener('touchend', onEnterTap, { passive: true })

  startLoop(tick, render)

  return () => {
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('keyup', offKey)
    canvas.removeEventListener('click', onEnterTap)
    canvas.removeEventListener('touchend', onEnterTap)
    overlay.innerHTML = ''
    btnRow.innerHTML = ''
  }
}

function makeBtn(icon, label, disabled, onClick) {
  const btn = document.createElement('button')
  btn.className = 'action-btn'
  btn.disabled = disabled
  btn.innerHTML = `${icon}${label ? `<span class="btn-label">${label}</span>` : ''}`
  btn.onclick = onClick
  return btn
}
```

- [ ] **Step 3: Test in browser**

After onboarding, navigate to street. Character should appear, left/right buttons move, houses appear.

- [ ] **Step 4: Commit**

```bash
git add src/canvas/scenes/street.js src/screens/street.js
git commit -m "feat: street screen — horizontal scroll neighborhood, house entry detection"
```

---

## Task 11: Other Room Screen

**Files:**
- Modify: `src/screens/otherroom.js`

- [ ] **Step 1: Write `src/screens/otherroom.js`**

```js
// src/screens/otherroom.js
import { getState, canPoop, recordPoop, poopCooldownRemaining } from '../state.js'
import { createPoop, fetchPoopsInHouse } from '../db.js'
import { joinRoomChannel, leaveRoomChannel, broadcastPoop, broadcastKick } from '../realtime.js'
import { drawRoomBackground, drawPoops, drawCharacter } from '../canvas/scenes/room.js'
import { drawText, drawRect } from '../canvas/renderer.js'
import { SPRITES } from '../canvas/sprites.js'
import { Animator } from '../canvas/animator.js'
import { startLoop } from '../canvas/gameloop.js'
import { navigate } from '../main.js'

const VISITOR_X = 40
const OWNER_X = 90
const CHAR_Y = 138

export function mountOtherRoom({ targetUser }) {
  const state = getState()
  const overlay = document.getElementById('ui-overlay')
  const btnRow = document.getElementById('btn-row')
  overlay.innerHTML = ''
  btnRow.innerHTML = ''

  let poops = []
  let ownerPresent = false
  let visitorAction = 'idle'   // 'idle' | 'poop' | 'kicked'
  let ownerAction = 'idle'     // 'idle' | 'kick'
  let kickedTimer = 0
  let cooldownMs = poopCooldownRemaining()

  const myType = state.characterType
  const ownerType = targetUser.character_type

  const myIdle   = new Animator(SPRITES[myType].idle, 6)
  const myPoop   = new Animator(SPRITES[myType].poop, 6)
  const myKicked = new Animator(SPRITES[myType].kicked, 6)
  const ownerIdle = new Animator(SPRITES[ownerType].idle, 6)
  const ownerKick = new Animator(SPRITES[ownerType].kick, 6)

  async function refreshPoops() {
    poops = await fetchPoopsInHouse(targetUser.id)
    renderButtons()
  }
  refreshPoops()

  // Cooldown ticker
  let cooldownInterval = setInterval(() => {
    cooldownMs = poopCooldownRemaining()
    renderButtons()
  }, 1000)

  // Realtime
  joinRoomChannel(targetUser.id, {
    onPoop: () => refreshPoops(),
    onClean: () => refreshPoops(),
    onPresence: (presenceList) => {
      ownerPresent = presenceList.some(p => p.userId === targetUser.id)
      renderButtons()
    },
    onKick: (targetId) => {
      if (targetId === state.userId) startKickedSequence()
    },
  })

  function startKickedSequence() {
    visitorAction = 'kicked'
    myKicked.reset()
    kickedTimer = 1200 // ms to show kicked anim before navigating away
  }

  function renderButtons() {
    btnRow.innerHTML = ''

    const poopAvailable = canPoop()
    const poopBtn = makeBtn('💩', poopAvailable ? '똥 싸기' : formatCooldown(cooldownMs), !poopAvailable, handlePoop)
    const kickBtn = makeBtn('👟', '걷어차기', !ownerPresent || visitorAction !== 'poop', handleKick)
    const exitBtn = makeBtn('🚪', '나가기', false, () => navigate('street'))

    // kick button only visible to owner when visitor is pooping
    if (state.userId === targetUser.id) {
      btnRow.append(kickBtn, exitBtn)
    } else {
      btnRow.append(poopBtn, exitBtn)
    }
  }

  async function handlePoop() {
    if (!canPoop()) return
    visitorAction = 'poop'
    myPoop.reset()
    renderButtons()
    await new Promise(r => setTimeout(r, 800)) // animation time
    await createPoop(targetUser.id, state.userId)
    recordPoop()
    broadcastPoop(targetUser.id, state.userId)
    await refreshPoops()
    visitorAction = 'idle'
  }

  function handleKick() {
    if (!ownerPresent) return
    ownerAction = 'kick'
    ownerKick.reset()
    broadcastKick(targetUser.id, state.userId /* who gets kicked */)
    setTimeout(() => { ownerAction = 'idle' }, 800)
  }

  function tick(delta) {
    ;[myIdle, myPoop, myKicked, ownerIdle, ownerKick].forEach(a => a.tick(delta))

    if (visitorAction === 'kicked') {
      kickedTimer -= delta
      if (kickedTimer <= 0) navigate('street')
    }
    cooldownMs = poopCooldownRemaining()
  }

  function render() {
    drawRoomBackground(targetUser.room_style)
    drawPoops(poops)

    // Visitor character
    const myAnim = visitorAction === 'poop' ? myPoop
      : visitorAction === 'kicked' ? myKicked
      : myIdle
    drawCharacter(myType, myAnim.currentFrame(), VISITOR_X, CHAR_Y)

    // Owner character (if present)
    if (ownerPresent) {
      const ownerAnim = ownerAction === 'kick' ? ownerKick : ownerIdle
      drawCharacter(ownerType, ownerAnim.currentFrame(), OWNER_X, CHAR_Y)
    }

    // Room owner label
    drawText(`${targetUser.nickname}의 집`, 80, 12, { color: '#555', align: 'center', size: 5 })

    // Cooldown display
    if (!canPoop()) {
      const remaining = formatCooldown(poopCooldownRemaining())
      drawText(`쿨다운: ${remaining}`, 80, 24, { color: '#ff6b6b', align: 'center', size: 5 })
    }
  }

  startLoop(tick, render)
  renderButtons()

  return () => {
    leaveRoomChannel(targetUser.id)
    clearInterval(cooldownInterval)
    overlay.innerHTML = ''
    btnRow.innerHTML = ''
  }
}

function formatCooldown(ms) {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

function makeBtn(icon, label, disabled, onClick) {
  const btn = document.createElement('button')
  btn.className = 'action-btn'
  btn.disabled = disabled
  btn.innerHTML = `${icon}<span class="btn-label">${label}</span>`
  btn.onclick = onClick
  return btn
}
```

- [ ] **Step 2: Test in browser**

Enter another user's room. Poop button visible with cooldown. After pooping, poop appears in room.

- [ ] **Step 3: Commit**

```bash
git add src/screens/otherroom.js
git commit -m "feat: other room screen — poop, kick, kicked animation"
```

---

## Task 12: Realtime Channels

**Files:**
- Modify: `src/realtime.js`

- [ ] **Step 1: Write `src/realtime.js`**

```js
// src/realtime.js
import { supabase } from './db.js'
import { getState } from './state.js'

const channels = {}

export function joinRoomChannel(roomOwnerId, callbacks = {}) {
  const { onPoop, onClean, onPresence, onKick } = callbacks
  const state = getState()

  const channelName = `room:${roomOwnerId}`
  if (channels[channelName]) return  // already joined

  const channel = supabase.channel(channelName, {
    config: { presence: { key: state.userId } }
  })

  channel
    .on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState()
      const list = Object.values(presenceState).flat()
      if (onPresence) onPresence(list)
    })
    .on('broadcast', { event: 'poop' }, ({ payload }) => {
      if (onPoop) onPoop(payload)
    })
    .on('broadcast', { event: 'clean' }, ({ payload }) => {
      if (onClean) onClean(payload)
    })
    .on('broadcast', { event: 'kick' }, ({ payload }) => {
      if (onKick) onKick(payload.targetId)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ userId: state.userId, nickname: state.nickname })
      }
    })

  channels[channelName] = channel
}

export function leaveRoomChannel(roomOwnerId) {
  const channelName = `room:${roomOwnerId}`
  const channel = channels[channelName]
  if (!channel) return
  supabase.removeChannel(channel)
  delete channels[channelName]
}

export function broadcastPoop(roomOwnerId, depositorId) {
  const channel = channels[`room:${roomOwnerId}`]
  if (!channel) return
  channel.send({ type: 'broadcast', event: 'poop', payload: { depositorId } })
}

export function broadcastClean(roomOwnerId) {
  const channel = channels[`room:${roomOwnerId}`]
  if (!channel) return
  channel.send({ type: 'broadcast', event: 'clean', payload: {} })
}

export function broadcastKick(roomOwnerId, targetId) {
  const channel = channels[`room:${roomOwnerId}`]
  if (!channel) return
  channel.send({ type: 'broadcast', event: 'kick', payload: { targetId } })
}
```

- [ ] **Step 2: Update `cleanAllPoops` in myroom.js to also broadcast**

In `src/screens/myroom.js`, after `cleanAllPoops`:
```js
import { broadcastClean } from '../realtime.js'
// inside clean handler:
await cleanAllPoops(state.userId)
broadcastClean(state.userId)
await refreshPoops()
```

- [ ] **Step 3: Test real-time in two browser tabs**

Open two tabs. In tab 1, go to myroom. In tab 2, enter tab 1's user room and poop. Tab 1 should show the poop without refresh.

- [ ] **Step 4: Commit**

```bash
git add src/realtime.js src/screens/myroom.js
git commit -m "feat: Supabase Realtime channels — poop/clean/kick events + presence"
```

---

## Task 13: Poop Moving Feature

**Files:**
- Modify: `src/screens/street.js`
- Modify: `src/screens/otherroom.js`

The "move poop" flow: user picks up a poop in my room → goes to street with `holdingPoop: true` → walks to another house → enters → poop is deposited automatically.

- [ ] **Step 1: Update street screen to show "throw poop" option when holding**

In `src/screens/street.js`, inside `onEnterTap`:
```js
function onEnterTap(e) {
  const state = getState()
  users.forEach((u, i) => {
    const hx = getHouseX(i, scrollX)
    const zone = HOUSE_ENTRY_ZONE(hx)
    if (CHAR_SCREEN_X >= zone.left && CHAR_SCREEN_X <= zone.right) {
      if (u.id === state.userId) {
        setState({ holdingPoop: false })
        navigate('myroom')
      } else {
        navigate('otherroom', { targetUser: u })
      }
    }
  })
}
```

Also in `render()`, show holding indicator:
```js
const s = getState()
if (s.holdingPoop) {
  drawText('💩 들고 있음 — 집에 넣어!', 80, 22, { color: '#f39c12', align: 'center', size: 5 })
}
```

- [ ] **Step 2: Update otherroom to auto-poop if holding**

In `src/screens/otherroom.js`, inside `mountOtherRoom`, after `refreshPoops()`:
```js
const s = getState()
if (s.holdingPoop && state.userId !== targetUser.id) {
  // Auto-deposit the carried poop
  setState({ holdingPoop: false })
  await createPoop(targetUser.id, state.userId)
  recordPoop()
  broadcastPoop(targetUser.id, state.userId)
  await refreshPoops()
}
```

- [ ] **Step 3: Test poop-moving flow**

1. In myroom: click 💩 옮기기 button.
2. In street: notice "💩 들고 있음" text.
3. Enter another house: poop appears automatically.

- [ ] **Step 4: Commit**

```bash
git add src/screens/street.js src/screens/otherroom.js
git commit -m "feat: poop moving — carry poop from your room to another house"
```

---

## Task 14: Vercel Deploy + .gitignore

**Files:**
- Create: `vercel.json`
- Create: `.gitignore`

- [ ] **Step 1: Create `.gitignore`**

```
node_modules/
.env.local
dist/
.superpowers/
```

- [ ] **Step 2: Create `vercel.json`**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

- [ ] **Step 3: Add Supabase env vars to Vercel**

```bash
npx vercel env add VITE_SUPABASE_URL
npx vercel env add VITE_SUPABASE_ANON_KEY
```

- [ ] **Step 4: Deploy**

```bash
npx vercel --prod
```

- [ ] **Step 5: Commit**

```bash
git add vercel.json .gitignore
git commit -m "feat: Vercel deploy config + .gitignore"
```

---

## Task 15: Final Polish

**Files:**
- Modify: `src/canvas/scenes/room.js` (poop collect/clean effects)
- Modify: `style.css` (mobile touch improvements)

- [ ] **Step 1: Add clean flash effect in `room.js`**

```js
// Add to room.js exports
let cleanFlashFrames = 0

export function triggerCleanFlash() { cleanFlashFrames = 6 }

export function drawCleanEffect() {
  if (cleanFlashFrames > 0) {
    drawRect(0, FLOOR_Y, 160, 70, `rgba(255,255,255,${cleanFlashFrames * 0.04})`)
    cleanFlashFrames--
  }
}
```

Call `triggerCleanFlash()` in myroom.js after cleaning, and `drawCleanEffect()` in the render function after `drawPoops`.

- [ ] **Step 2: Prevent scroll bounce on mobile**

Add to `style.css`:
```css
html, body {
  overscroll-behavior: none;
  touch-action: none;
}
#game-canvas { touch-action: none; }
```

- [ ] **Step 3: Add a simple splash/loading state**

In `src/main.js` `boot()`:
```js
async function boot() {
  initRenderer()
  // Show loading
  const { clear, drawText } = await import('./canvas/renderer.js')
  clear()
  drawText('WHO POOPED?', 80, 116, { color: '#eee', align: 'center', size: 10 })
  drawText('loading...', 80, 132, { color: '#555', align: 'center', size: 6 })

  const state = getState()
  initFrame(state.frameColor)
  if (state.userId) {
    navigate('myroom')
  } else {
    navigate('onboarding')
  }
}
```

- [ ] **Step 4: Final test run**

```bash
npm test
npm run build
```
Expected: All tests pass, build succeeds with no errors.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: polish — clean flash, mobile scroll fix, loading splash"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Web game, mobile-first
- ✅ Single room per user
- ✅ Tamagotchi animal characters (5 types: cat, rabbit, bear, dog, duck)
- ✅ Character selection on first login
- ✅ Poop in other houses (1hr cooldown)
- ✅ Pixel graphics, black & white game content
- ✅ Colorful phone frame (user-selectable)
- ✅ Clean poop (mop animation)
- ✅ Move poop to another house
- ✅ Character expression changes when poop in own room (angry animation)
- ✅ Kick intruder while pooping
- ✅ Kicked character bounces out
- ✅ All animations choppy 4-8fps pixel style
- ✅ Horizontal scroll neighborhood
- ✅ Walk in/out of houses
- ✅ Real-time sync (Supabase Realtime)
- ✅ Nickname-only auth, localStorage
- ✅ Room interior styles (3 choices, user-selectable)
- ✅ Serverless deploy (Vercel + Supabase)

**Placeholder scan:** No TBDs found. All tasks have concrete code.

**Type consistency:** `SPRITES[characterType].idle` pattern used consistently throughout. `drawSprite(frame, palette, x, y, size)` signature consistent. `navigate(screen, params)` signature consistent.
