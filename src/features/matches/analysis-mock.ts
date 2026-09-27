import type { MatchAnalysis } from './analysis-types'

// MOCK (replace the query fetcher with `GET /matches/{match}/analysis` when
// the backend endpoint exists): the agreed sample payload served with no
// network dependency. Consumers never import this directly; they read it
// through `matchAnalysisQueries.detail(id)`.
//
// Coverage notes for downstream slices:
// - Map slug `tunisia` matches a bundled background; the crop is ~1.6%
//   taller than wide (1280x1300), encoding the observed processing-frame
//   versus minimap-base delta that normalized mapping absorbs by stretching.
// - Final score { blue: 4, red: 2 } matches the legacy hardcoded header so the
//   swap reads as continuity.
// - Every ok round plays blue attacking / red defending, so the unplayed
//   lens-plus-side pairs (blue defending, red attacking) hit the explicit
//   empty state.
// - Zone patterns include pure-site (5B) and Mid-bearing splits; round 4
//   carries low confidence to exercise the badge without blocking.
// - Event trajectories rotate through Smoke / Frag / Concussion plus bomb
//   markers; `bomb_carried` is present so the utility mix can exclude it.
// - Round 2's stray point sits past its cutoff so window filtering is
//   observable; round 6 fails so exclusion plus the status note are visible.
export const SAMPLE_MATCH_ANALYSIS: MatchAnalysis = {
  matchId: 1,
  mapSlug: 'tunisia',
  mapCrop: { width: 1280, height: 1300 },
  finalScore: { blue: 4, red: 2 },
  targetScore: 5,
  rounds: [
    {
      roundNumber: 1,
      status: 'ok',
      side: { blue: 'attacking', red: 'defending' },
      scoreAfter: { blue: 1, red: 0 },
      teamSplit: {
        blue: {
          zoneCounts: { A: 3, B: 2, Mid: 0 },
          totalDetected: 5,
          confidence: 0.92,
        },
        red: {
          zoneCounts: { A: 2, B: 3, Mid: 0 },
          totalDetected: 5,
          confidence: 0.88,
        },
      },
      heldSite: 'A',
      zoneEntries: [
        { zone: 'A', teamColor: 'blue' },
        { zone: 'A', teamColor: 'blue' },
        { zone: 'B', teamColor: 'blue' },
        { zone: 'B', teamColor: 'red' },
      ],
      startMs: 0,
      cutoffMs: 100_000,
      trajectories: [
        {
          iconType: 'blue_player',
          teamColor: 'blue',
          points: [
            { tMs: 5_000, x: 320, y: 300 },
            { tMs: 20_000, x: 420, y: 520 },
            { tMs: 60_000, x: 640, y: 780 },
          ],
        },
        {
          iconType: 'red_player',
          teamColor: 'red',
          points: [
            { tMs: 8_000, x: 900, y: 400 },
            { tMs: 40_000, x: 860, y: 700 },
          ],
        },
        {
          iconType: 'smoke_grenade',
          teamColor: 'blue',
          points: [{ tMs: 45_000, x: 640, y: 650 }],
        },
      ],
    },
    {
      roundNumber: 2,
      status: 'ok',
      side: { blue: 'attacking', red: 'defending' },
      scoreAfter: { blue: 1, red: 1 },
      teamSplit: {
        blue: {
          zoneCounts: { A: 0, B: 5, Mid: 0 },
          totalDetected: 5,
          confidence: 0.9,
        },
        red: {
          zoneCounts: { A: 1, B: 4, Mid: 0 },
          totalDetected: 5,
          confidence: 0.85,
        },
      },
      heldSite: 'B',
      zoneEntries: [
        { zone: 'B', teamColor: 'blue' },
        { zone: 'B', teamColor: 'blue' },
        { zone: 'B', teamColor: 'red' },
      ],
      startMs: 120_000,
      cutoffMs: 220_000,
      trajectories: [
        {
          iconType: 'blue_player',
          teamColor: 'blue',
          points: [
            { tMs: 130_000, x: 950, y: 900 },
            { tMs: 180_000, x: 1_000, y: 1_000 },
            // Stray point past the cutoff: window filtering drops it.
            { tMs: 260_000, x: 200, y: 200 },
          ],
        },
        {
          iconType: 'red_player',
          teamColor: 'red',
          points: [{ tMs: 150_000, x: 880, y: 950 }],
        },
        {
          iconType: 'frag_grenade',
          teamColor: 'red',
          points: [{ tMs: 170_000, x: 920, y: 980 }],
        },
      ],
    },
    {
      roundNumber: 3,
      status: 'ok',
      side: { blue: 'attacking', red: 'defending' },
      scoreAfter: { blue: 2, red: 1 },
      teamSplit: {
        blue: {
          zoneCounts: { A: 2, B: 2, Mid: 1 },
          totalDetected: 5,
          confidence: 0.78,
        },
        red: {
          zoneCounts: { A: 2, B: 2, Mid: 1 },
          totalDetected: 5,
          confidence: 0.81,
        },
      },
      heldSite: null,
      zoneEntries: [
        { zone: 'A', teamColor: 'blue' },
        { zone: 'Mid', teamColor: 'blue' },
        { zone: 'B', teamColor: 'red' },
      ],
      startMs: 240_000,
      cutoffMs: 340_000,
      trajectories: [
        {
          iconType: 'blue_player',
          teamColor: 'blue',
          points: [
            { tMs: 250_000, x: 640, y: 650 },
            { tMs: 300_000, x: 600, y: 700 },
          ],
        },
        {
          iconType: 'red_player',
          teamColor: 'red',
          points: [{ tMs: 260_000, x: 700, y: 600 }],
        },
        {
          iconType: 'concussion_grenade',
          teamColor: 'blue',
          points: [{ tMs: 290_000, x: 640, y: 660 }],
        },
        {
          iconType: 'smoke_grenade',
          teamColor: 'blue',
          points: [{ tMs: 310_000, x: 500, y: 800 }],
        },
      ],
    },
    {
      roundNumber: 4,
      status: 'ok',
      side: { blue: 'attacking', red: 'defending' },
      scoreAfter: { blue: 3, red: 1 },
      teamSplit: {
        blue: {
          zoneCounts: { A: 3, B: 1, Mid: 1 },
          totalDetected: 5,
          confidence: 0.47,
        },
        red: {
          zoneCounts: { A: 1, B: 3, Mid: 1 },
          totalDetected: 5,
          confidence: 0.55,
        },
      },
      heldSite: 'A',
      zoneEntries: [
        { zone: 'Mid', teamColor: 'blue' },
        { zone: 'A', teamColor: 'red' },
      ],
      startMs: 360_000,
      cutoffMs: 460_000,
      trajectories: [
        {
          iconType: 'blue_player',
          teamColor: 'blue',
          points: [{ tMs: 380_000, x: 400, y: 400 }],
        },
        {
          iconType: 'red_player',
          teamColor: 'red',
          points: [{ tMs: 390_000, x: 800, y: 500 }],
        },
        {
          iconType: 'bomb_plant',
          teamColor: 'blue',
          points: [{ tMs: 420_000, x: 420, y: 420 }],
        },
        {
          iconType: 'frag_grenade',
          teamColor: 'red',
          points: [{ tMs: 430_000, x: 780, y: 520 }],
        },
      ],
    },
    {
      roundNumber: 5,
      status: 'ok',
      side: { blue: 'attacking', red: 'defending' },
      scoreAfter: { blue: 3, red: 2 },
      teamSplit: {
        blue: {
          zoneCounts: { A: 4, B: 1, Mid: 0 },
          totalDetected: 5,
          confidence: 0.89,
        },
        red: {
          zoneCounts: { A: 0, B: 4, Mid: 1 },
          totalDetected: 5,
          confidence: 0.91,
        },
      },
      heldSite: 'B',
      zoneEntries: [
        { zone: 'B', teamColor: 'red' },
        { zone: 'Mid', teamColor: 'red' },
      ],
      startMs: 480_000,
      cutoffMs: 580_000,
      trajectories: [
        {
          iconType: 'blue_player',
          teamColor: 'blue',
          points: [{ tMs: 500_000, x: 300, y: 350 }],
        },
        {
          iconType: 'red_player',
          teamColor: 'red',
          points: [{ tMs: 510_000, x: 950, y: 850 }],
        },
        {
          iconType: 'smoke_grenade',
          teamColor: 'red',
          points: [{ tMs: 530_000, x: 900, y: 900 }],
        },
        {
          // Carried marker: rendered never in the utility mix downstream.
          iconType: 'bomb_carried',
          teamColor: 'blue',
          points: [{ tMs: 540_000, x: 320, y: 360 }],
        },
      ],
    },
    {
      roundNumber: 6,
      status: 'failed',
      side: { blue: 'attacking', red: 'defending' },
      scoreAfter: { blue: 3, red: 2 },
      teamSplit: {
        blue: {
          zoneCounts: { A: 0, B: 0, Mid: 0 },
          totalDetected: 0,
          confidence: 0,
        },
        red: {
          zoneCounts: { A: 0, B: 0, Mid: 0 },
          totalDetected: 0,
          confidence: 0,
        },
      },
      heldSite: null,
      zoneEntries: [],
      startMs: 600_000,
      cutoffMs: 700_000,
      trajectories: [],
    },
    {
      roundNumber: 7,
      status: 'ok',
      side: { blue: 'attacking', red: 'defending' },
      scoreAfter: { blue: 4, red: 2 },
      teamSplit: {
        blue: {
          zoneCounts: { A: 2, B: 3, Mid: 0 },
          totalDetected: 5,
          confidence: 0.93,
        },
        red: {
          zoneCounts: { A: 3, B: 2, Mid: 0 },
          totalDetected: 5,
          confidence: 0.87,
        },
      },
      heldSite: 'B',
      zoneEntries: [
        { zone: 'A', teamColor: 'blue' },
        { zone: 'B', teamColor: 'blue' },
      ],
      startMs: 720_000,
      cutoffMs: 820_000,
      trajectories: [
        {
          iconType: 'blue_player',
          teamColor: 'blue',
          points: [
            { tMs: 730_000, x: 500, y: 500 },
            { tMs: 780_000, x: 700, y: 800 },
          ],
        },
        {
          iconType: 'red_player',
          teamColor: 'red',
          points: [{ tMs: 740_000, x: 850, y: 750 }],
        },
        {
          iconType: 'frag_grenade',
          teamColor: 'blue',
          points: [{ tMs: 790_000, x: 720, y: 820 }],
        },
      ],
    },
  ],
}
