# 03: Team live Player heat per map

**What to build:** The team panel's blank minimap box becomes a live per-map heat read: switching the map dropdown switches the minimap base and the density to that map, scoped to the detail team and the selected side, with honest empty and status states. Numbers beside the map stay exactly as today.

**Blocked by:** 01, 02 (needs the single-heat definition and the map-only panel).

**Status:** done

- [x] Heatmap base is the selected map's minimap image; missing image falls back to the dark box with heat only, and the banner keeps its separate bundled art
- [x] Points aggregate the detail team's matches on the selected map across all opponents, following the detail team by per-match side color; non-participant matches contribute nothing
- [x] Only ok rounds and points inside each round's start-to-cutoff window contribute; Attacking versus Defending filters the rounds
- [x] Zero matches on the map and unplayed lens-plus-side each render their explicit empty message rather than a blank box
- [x] Failed rounds collapse to a compact note with summed counts; any low-confidence contribution renders a badge without blocking
- [x] Rotation, setups, utility mix, and win rate stay on today's mocked values; heat arrival causes no layout shift and stacks on narrow screens

Prototype shape from the spec that encodes the aggregation decision:

`TeamMapHeat { points { nx, ny }[], matchedRounds, failedRounds, lowConfidence }` where `nx` is x over crop width and `ny` is y over crop height, each clamped to 0-1.

## Comments

- Implemented in `b55828f`: `analysis-team-heat.ts` (`selectTeamMapHeat`, per-match lens-color merge over the shared player-heat selector), `use-team-map-heat.ts` (query seam: team-matches list for the map plus one analysis query per ready match), `team-map-heat.tsx` (base-plus-density host reusing `MatchHeatmap`, explicit zero-matches/error/pending states), `teamId` slot on `PerMapStats` wired from the team route; Utility tab keeps the placeholder for 04. Verified via tsc (2 pre-existing unrelated errors), eslint/prettier, `pnpm build`, tsx runtime assertions against the sample payload (blue/attacking 11 pts over 6 rounds, red/defending 7 pts, non-participant and non-ready contribute nothing, failed rounds summed, low-confidence flagged), and a two-axis code review (Standards: no hard findings; Spec: analysis-fetch failures fail the read instead of rendering partial heat as complete, single-page 100-match cap noted for a future pagination pass); no test runner in repo.
