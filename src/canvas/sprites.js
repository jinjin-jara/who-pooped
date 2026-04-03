// src/canvas/sprites.js

// ── Per-animal color palettes ────────────────────────────
// W = primary body, G = secondary/markings, D = accent detail, B = darkest (eyes/outline)

export const CAT_PALETTE = {
  W: '#F5CFA0', // warm cream
  G: '#D49560', // orange tabby stripe
  D: '#FF9090', // pink nose/inner ear
  B: '#2A1A10', // dark brown-black eyes
}

export const RABBIT_PALETTE = {
  W: '#F0E6EA', // soft white-pink
  G: '#E0B8C8', // pink accent
  D: '#D090A8', // deeper pink (inner ear)
  B: '#882233', // wine-red eyes
}

export const BEAR_PALETTE = {
  W: '#A08060', // warm brown
  G: '#806848', // darker brown
  D: '#C0A880', // light tan (muzzle)
  B: '#1A1210', // near-black eyes
}

export const DOG_PALETTE = {
  W: '#E8C870', // golden
  G: '#C8A048', // darker gold
  D: '#F0D890', // light cream (belly/muzzle)
  B: '#201810', // dark eyes
}

export const DUCK_PALETTE = {
  W: '#FFE060', // bright yellow
  G: '#FF8C00', // orange beak/feet
  D: '#FFF0A0', // light yellow (belly)
  B: '#2A2010', // dark eyes
}

export const PENGUIN_PALETTE = {
  W: '#2A2A3A', // dark blue-black body
  G: '#E8E0E0', // white belly
  D: '#F0A030', // orange beak/feet
  B: '#111118', // dark eyes
}

// Unified palette for backwards-compat (used by shared animations)
export const CHAR_PALETTE = CAT_PALETTE

// Helper to get palette by character type
export function getCharPalette(characterType) {
  switch (characterType) {
    case 'cat':     return CAT_PALETTE
    case 'rabbit':  return RABBIT_PALETTE
    case 'bear':    return BEAR_PALETTE
    case 'dog':     return DOG_PALETTE
    case 'duck':    return DUCK_PALETTE
    case 'penguin': return PENGUIN_PALETTE
    default:        return CAT_PALETTE
  }
}

export const POOP_PALETTE = {
  P: '#5C3317',
  L: '#8B4513',
  H: '#7A4A2A', // highlight
}

export const MOP_PALETTE = {
  W: '#eeeeee',
  G: '#aaaaaa',
  B: '#666666',
}

// ── CAT ── cream/orange tabby with pointed ears ──────────
const catIdle0 = [
  'DWW..WWWD.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
  '.GWWWWWWG.',
  '..WWWWWW..',
  '.WWWWWWWW.',
  '.WGWWWWGW.',
  '..WWWWWW..',
  '..WW..WW..',
  '..WW..WW..',
  '..GG..GG..',
]

const catIdle1 = [
  'DWW..WWWD.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
  '.GWWWWWWG.',
  '..WWWWWW..',
  '.WWWWWWWW.',
  '.WGWWWWGW.',
  '..WWWWWW..',
  '.WW....WW.',
  '.WW....WW.',
  '.GG....GG.',
]

const catAngry0 = [
  'DWW..WWWD.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.GBBWWBBG.',
  '.WWWDDWWW.',
  '.WWGWWGWW.',
  '..WWWWWW..',
  '.WWWWWWWW.',
  '.WGWWWWGW.',
  '..WWWWWW..',
  '..WW..WW..',
  '..WW..WW..',
  '..GG..GG..',
]

const catWalkR0 = [
  'DWW..WWWD.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
  '.GWWWWWWG.',
  '..WWWWWW..',
  '.WWWWWWWW.',
  '.WGWWWWGW.',
  '..WWWWWW..',
  '..WWWWWWGG',
  '..WWWW....',
  '..GGGG....',
]

const catWalkR1 = [
  'DWW..WWWD.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
  '.GWWWWWWG.',
  '..WWWWWW..',
  '.WWWWWWWW.',
  '.WGWWWWGW.',
  '..WWWWWW..',
  'GGWWWWWW..',
  '....WWWW..',
  '....GGGG..',
]

const catPoop0 = [
  'DWW..WWWD.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '.WWWWWWWWW',
  'WWWWWWWWWW',
  '.WW....WW.',
  '.WW....WW.',
  '..........',
  '..........',
]

const catPoop1 = [
  'DWW..WWWD.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
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
  'DWW..WWWD.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
  '.GWWWWWWG.',
  '.WWWWWWWWW',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW..WW..',
  '..WW..WW..',
  '..GG..GG..',
]

const catClean1 = [
  'DWW..WWWD.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
  '.GWWWWWWG.',
  'WWWWWWWWW.',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW..WW..',
  '..WW..WW..',
  '..GG..GG..',
]

const catKick0 = [
  'DWW..WWWD.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
  '.GWWWWWWG.',
  '..WWWWWW..',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW..WWGG',
  '..WW......',
  '..GG......',
]

const catKick1 = [
  'DWW..WWWD.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
  '.GWWWWWWG.',
  '..WWWWWW..',
  '.WWWWWWWWW',
  '..WWWWWW..',
  '..WWWWWW..',
  '..WW...GGG',
  '..WW......',
  '..GG......',
]

const catKicked0 = [
  '....WWWWWW',
  '...WWWWWWW',
  '..WWWWWWWW',
  '.WWWWWWWWW',
  'WBBWWBBWWW',
  'WWWDDWWWWW',
  'GWWWWWWGWW',
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
  'WWWDDWWWWW',
  'GWWWWWWGWW',
  '..WWWWWWWW',
  '....WWWWWW',
  '......WWWW',
  '........WW',
  '..........',
  '..........',
  '..........',
]

// ── RABBIT ── white-pink with tall ears ──────────────────
const rabbitIdle0 = [
  '.WW....WW.',
  '.WD....DW.',
  '.WW....WW.',
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
  '..WWWWWW..',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.GGWWWWGG.',
  '..WW..WW..',
  '..WW..WW..',
  '..GG..GG..',
]

const rabbitIdle1 = [
  '.WW....WW.',
  '.WD....DW.',
  '.WW....WW.',
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
  '..WWWWWW..',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.GGWWWWGG.',
  '.WW....WW.',
  '.WW....WW.',
  '.GG....GG.',
]

// ── BEAR ── warm brown with round ears, stocky ──────────
const bearIdle0 = [
  'GW.WW.WG..',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  'WWBBWWBBWW',
  'WWWWDDWWWW',
  'WWWWWWWWWW',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WDDDDDDW.',
  '..WWWWWW..',
  '.WW....WW.',
  '.WW....WW.',
  '.GG....GG.',
]

const bearIdle1 = [
  'GW.WW.WG..',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  'WWBBWWBBWW',
  'WWWWDDWWWW',
  'WWWWWWWWWW',
  '.WWWWWWWW.',
  '.WWWWWWWW.',
  '.WDDDDDDW.',
  '..WWWWWW..',
  '..WW..WW..',
  '..WW..WW..',
  '..GG..GG..',
]

// ── DOG ── golden with floppy ears ──────────────────────
const dogIdle0 = [
  '..WWWWWW..',
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'GG.WWWW.GG',
  '.WBBWWBBW.',
  '.WWWWWWWW.',
  '.WWDDDWWW.',
  '..WWWWWW..',
  '.WWWWWWWW.',
  '.WDWWWWDW.',
  '..WWWWWW..',
  '..WW..WW..',
  '..WW..WW..',
  '..GG..GG..',
]

const dogIdle1 = [
  '..WWWWWW..',
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'GG.WWWW.GG',
  '.WBBWWBBW.',
  '.WWWWWWWW.',
  '.WWDDDWWW.',
  '..WWWWWW..',
  '.WWWWWWWW.',
  '.WDWWWWDW.',
  '..WWWWWW..',
  '.WW....WW.',
  '.WW....WW.',
  '.GG....GG.',
]

// ── DUCK ── yellow with orange beak ─────────────────────
const duckIdle0 = [
  '..WWWWWW..',
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWGGGGWW.',
  '.WWGGGGWW.',
  '..WWWWWW..',
  '.DWWWWWWD.',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '..WW..WW..',
  '..GG..GG..',
  '..GG..GG..',
]

const duckIdle1 = [
  '..WWWWWW..',
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWGGGGWW.',
  '.WWGGGGWW.',
  '..WWWWWW..',
  '.DWWWWWWD.',
  '.WWWWWWWW.',
  '..WWWWWW..',
  '.WW....WW.',
  '.GG....GG.',
  '.GG....GG.',
]

// ── PENGUIN ── dark body with white belly ────────────────
const penguinIdle0 = [
  '..WWWWWW..',
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
  '.WWGGGGWW.',
  '.WWGGGGWW.',
  '.WWGGGGWW.',
  '..WGGGGW..',
  '..WWWWWW..',
  '..WW..WW..',
  '..DD..DD..',
  '..DD..DD..',
]

const penguinIdle1 = [
  '..WWWWWW..',
  '.WWWWWWWW.',
  'WWWWWWWWWW',
  'WWWWWWWWWW',
  '.WBBWWBBW.',
  '.WWWDDWWW.',
  '.WWGGGGWW.',
  '.WWGGGGWW.',
  '.WWGGGGWW.',
  '..WGGGGW..',
  '..WWWWWW..',
  '.WW....WW.',
  '.DD....DD.',
  '.DD....DD.',
]

// ── POOP ─────────────────────────────────────────────────
// 8×9 sprite — swirly poop with face
export const POOP_SPRITE = [
  '...LL...',
  '..LPPL..',
  '.LHPPPL.',
  '.PPPPPP.',
  'PHPPPHPP',
  'PPPPPPPP',
  'PP.BB.PP',
  'PPPHHHPP',
  '.PPPPPP.',
]

// ── MOP ──────────────────────────────────────────────────
// 8×12 sprite with handle detail
export const MOP_SPRITE = [
  '....B...',
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
    idle:   [bearIdle0, bearIdle1],
    angry:  [bearIdle0],
    walkR:  [bearIdle0, bearIdle1],
    walkL:  [bearIdle1, bearIdle0],
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
  penguin: {
    idle:   [penguinIdle0, penguinIdle1],
    angry:  [penguinIdle0],
    walkR:  [penguinIdle0, penguinIdle1],
    walkL:  [penguinIdle1, penguinIdle0],
    poop:   [catPoop0, catPoop1],
    clean:  [catClean0, catClean1],
    kick:   [catKick0, catKick1],
    kicked: [catKicked0, catKicked1],
  },
}
