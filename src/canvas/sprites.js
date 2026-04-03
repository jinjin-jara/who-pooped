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

export const MOP_PALETTE = {
  W: '#eeeeee',
  G: '#888888',
}

// ── CAT ──────────────────────────────────────────────────
const catIdle0 = [
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
  '.WW....WW.',
  '.WW....WW.',
  '.WW....WW.',
]

const catAngry0 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'W.WWWWWW.W',
  'WWWWWWWWWW',
  '.DBBWWBBD.',
  '.WWWGGWWW.',
  '.WWGWWGWW.',
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
  '..WWWWWWWW',
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
  'WWWWWWWW..',
  '....WWWW..',
  '....WWWW..',
]

const catPoop0 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'W.WWWWWW.W',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWGGWWW.',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '.WWWWWWWWW',
  'WWWWWWWWWW',
  '.WW....WW.',
  '.WW....WW.',
  '..........',
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
  '..........',
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
  '.WWWWWWWWW',
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
  'WWWWWWWWW.',
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
  '..WW..WWWW',
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
  '.WWWWWWWWW',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW...WWW',
  '..WW......',
  '..WW......',
]

const catKicked0 = [
  '....WWWWWW',
  '...WWWWWWW',
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

// ── RABBIT ───────────────────────────────────────────────
const rabbitIdle0 = [
  '.WW....WW.',
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

// ── BEAR ─────────────────────────────────────────────────
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

// ── DOG ──────────────────────────────────────────────────
const dogIdle0 = [
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  'W.WWWWWW.W',
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

// ── DUCK ─────────────────────────────────────────────────
const duckIdle0 = [
  '..WWWWWW..',
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWGGGGWW.',
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
// 6×7 sprite
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
// 8×12 sprite
export const MOP_SPRITE = [
  '....W...',
  '....W...',
  '....W...',
  '....W...',
  '....W...',
  '....W...',
  '....W...',
  '....W...',
  '...GGG..',
  '..GGGGG.',
  '.GGGGGGG',
  'GGGGGGGG',
]

// ── SPRITE REGISTRY ──────────────────────────────────────
// Each animal reuses cat's action frames for poop/clean/kick/kicked
// (body posture is the same, head differs)
export const SPRITES = {
  cat: {
    idle:   [catIdle0, catIdle1],
    angry:  [catAngry0],
    walkR:  [catWalkR0, catWalkR1],
    walkL:  [catWalkR1, catWalkR0],
    poop:   [catPoop0, catPoop1],
    clean:  [catClean0, catClean1],
    kick:   [catKick0, catKick1],
    kicked: [catKicked0, catKicked1],
  },
  rabbit: {
    idle:   [rabbitIdle0, rabbitIdle1],
    angry:  [rabbitIdle0],
    walkR:  [rabbitIdle0, rabbitIdle1],
    walkL:  [rabbitIdle1, rabbitIdle0],
    poop:   [catPoop0, catPoop1],
    clean:  [catClean0, catClean1],
    kick:   [catKick0, catKick1],
    kicked: [catKicked0, catKicked1],
  },
  bear: {
    idle:   [bearIdle0, bearIdle0],
    angry:  [bearIdle0],
    walkR:  [bearIdle0, bearIdle0],
    walkL:  [bearIdle0, bearIdle0],
    poop:   [catPoop0, catPoop1],
    clean:  [catClean0, catClean1],
    kick:   [catKick0, catKick1],
    kicked: [catKicked0, catKicked1],
  },
  dog: {
    idle:   [dogIdle0, dogIdle1],
    angry:  [dogIdle0],
    walkR:  [dogIdle0, dogIdle1],
    walkL:  [dogIdle1, dogIdle0],
    poop:   [catPoop0, catPoop1],
    clean:  [catClean0, catClean1],
    kick:   [catKick0, catKick1],
    kicked: [catKicked0, catKicked1],
  },
  duck: {
    idle:   [duckIdle0, duckIdle1],
    angry:  [duckIdle0],
    walkR:  [duckIdle0, duckIdle1],
    walkL:  [duckIdle1, duckIdle0],
    poop:   [catPoop0, catPoop1],
    clean:  [catClean0, catClean1],
    kick:   [catKick0, catKick1],
    kicked: [catKicked0, catKicked1],
  },
}
