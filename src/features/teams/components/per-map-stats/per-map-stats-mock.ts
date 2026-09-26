// MOCK (replace with the real per-map stats endpoint): typed hardcoded
// numbers so the layout can be reviewed before the stats API exists.
export type RotationSplit = {
  stay: number
  switch: number
}

export type SiteSetup = {
  a: number
  b: number
  pct: number
}

export type UtilityMixRow = {
  name: string
  count: number
  pct: number
}

export type PerMapSideStats = {
  rotationAfterWin: RotationSplit
  rotationAfterLoss: RotationSplit
  setups: SiteSetup[]
  utility: UtilityMixRow[]
}

export type PerMapStats = {
  mapName: string
  winPct: number
  attacking: PerMapSideStats
  defending: PerMapSideStats
}

export const PER_MAP_STATS_MOCK: PerMapStats = {
  mapName: 'Tunisia',
  winPct: 100,
  attacking: {
    rotationAfterWin: { stay: 64, switch: 36 },
    // The mockup's loss split sums to 94; hardcoded corrected to sum to 100.
    rotationAfterLoss: { stay: 24, switch: 76 },
    setups: [
      { a: 3, b: 2, pct: 18 },
      { a: 0, b: 5, pct: 15 },
      { a: 2, b: 3, pct: 13 },
      { a: 5, b: 0, pct: 12 },
      { a: 4, b: 1, pct: 10 },
    ],
    utility: [
      { name: 'Smoke', count: 5, pct: 50 },
      { name: 'Frag', count: 3, pct: 30 },
      { name: 'Concussion', count: 2, pct: 20 },
    ],
  },
  defending: {
    rotationAfterWin: { stay: 71, switch: 29 },
    rotationAfterLoss: { stay: 31, switch: 69 },
    setups: [
      { a: 2, b: 3, pct: 21 },
      { a: 3, b: 2, pct: 17 },
      { a: 1, b: 4, pct: 14 },
      { a: 4, b: 1, pct: 11 },
      { a: 0, b: 5, pct: 9 },
    ],
    utility: [
      { name: 'Smoke', count: 4, pct: 40 },
      { name: 'Frag', count: 4, pct: 40 },
      { name: 'Concussion', count: 2, pct: 20 },
    ],
  },
}
