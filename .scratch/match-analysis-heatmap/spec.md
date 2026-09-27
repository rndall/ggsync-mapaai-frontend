Status: ready-for-agent

## Problem Statement

Coaches opening a match have a scoreline that is hardcoded, a minimap panel that is an empty placeholder, and Player/Utility numbers that are typed hardcoded mocks. The analysis backend produces per-match results (scores, per-round zone distributions, timed position trajectories) plus a map minimap base image, but the frontend renders none of it, so the match view cannot be used for real positional reads.

## Solution

Wire the per-match analysis payload into the canonical team-scoped match view. The match score header shows the real final score, the minimap panel renders a client-computed heatmap over the Map API minimap base, Top Setups aggregates per-round zone distributions including Mid in a scrollable list, and the Utility tab derives its mix from event trajectories with single-select row-driven heat. Until the analysis endpoint exists, the same hook shape serves the agreed sample payload as a typed local mock so the backend can drop in without reflow.

## User Stories

1. As a coach viewing a ready match, I want the score header to show the real final score for both teams, so that I stop seeing mock numbers.
2. As a coach viewing a not-yet-ready match, I want the existing analyzing treatment to remain, so that I never read a score with no analysis behind it.
3. As a coach viewing a match, I want the heatmap base to be the Map API minimap image for that match's map, so that positions land on the real tactical layout.
4. As a coach viewing Player heat, I want Type1 to show player-position density, so that I can read where players spend time.
5. As a coach viewing Player heat, I want Type2 to show event density, so that I can read where bombs and grenades happen.
6. As a coach switching the team lens, I want heat to follow the active team only, so that the map read stays consistent with the numbers read.
7. As a coach toggling Attacking versus Defending, I want heat to follow the selected side for the active team, so that both sides of the ball have distinct maps.
8. As a coach viewing a lens-plus-side combination the active team never played (e.g. lens on the team that defended all tracked rounds while side is Attacking), I want an explicit empty-state message, so that emptiness reads as fact rather than breakage.
9. As a coach viewing Utility, I want the utility table rows derived from event trajectories (throw counts plus share of overall utils), so that the mix reflects the match.
10. As a coach viewing Utility, I want exactly one utility row selected with the first row auto-selected, so that there is always an active heat source.
11. As a coach selecting a utility row, I want the minimap heat to show only that utility's points, so that each utility reads in isolation.
12. As a coach viewing Top Setups, I want every observed site distribution shown with Mid included (e.g. 3A 2B, 5B, distributions containing Mid), so that nothing is hidden by a top-5 cut.
13. As a coach viewing many setups, I want the setup list scrollable at a stable panel height, so that long lists do not push the page around.
14. As a coach viewing a round that failed analysis, I want it excluded from heat, setups, and utility counts with a small status note on the minimap card, so that failures are visible without blocking the rest.
15. As a coach viewing a team with low-confidence detection, I want a confidence badge rather than hidden numbers, so that I can discount the read myself.
16. As a returning viewer, I want the existing view, side, heat, team, and map URL keys to keep working exactly as before, so that deep links do not break.
17. As a viewer on mobile, I want the stats-plus-minimap grid to keep stacking, so that heat never overflows at narrow widths.
18. As a developer integrating the future analysis endpoint, I want the fetch hook to keep a single shape with a mock fallback today, so that going live is a backend swap with no route or component change.

## Implementation Decisions

- Canonical team-scoped match view remains the integration host; the bare match address remains a redirector only. The team-detail Per Map Stats panel stays on mocks and keeps its placeholder except where a single match context exists. No cross-match trajectory aggregation in this slice.
- New frontend-owned analysis contract mirroring the agreed sample payload: per-match identity, map slug, processing crop size, final score, target score, and a rounds list where each round carries status, side assignment, score-after, team zone distributions with confidence, held-site info, zone entries, and trajectories of timed x/y points with icon type and team color. Prototype shape that encodes the decision:
  `MatchAnalysis { mapSlug, mapCrop { width, height }, finalScore { red, blue }, rounds[] }` where `Round { status, side { red, blue }, teamSplit { red, blue: ZoneSplit }, trajectories[] }`, `ZoneSplit { zoneCounts { A, B, Mid }, totalDetected, confidence }`, `Trajectory { iconType, teamColor, points { tMs, x, y }[] }`.
- New analysis query module alongside the existing match detail query: same match identifier in, analysis payload out, disabled on non-numeric ids, mock fallback serving the sample payload until the backend `GET /matches/{match}/analysis` endpoint exists. No generated API types change until the backend OpenAPI lands.
- Score header consumes the analysis final score when the match is ready and analysis is ok, preserving the established blue-first side order; while pending or failed it keeps the current fallback treatment.
- Minimap heatmap is a new presentational module replacing the blank placeholder box: base image layer plus canvas overlay using 2D radial-gradient splats with additive blending in the reference blue-to-green-to-yellow-to-red ramp, same square box and column height so arrival causes no reflow.
- Coordinate mapping is normalized: horizontal equals x divided by crop width, vertical equals y divided by crop height, mapped to percentages of the rendered box with the base image set to fill. The observed Tunisia delta (processing frame versus minimap base differing by ~1.6% in height, identical width) is absorbed by this stretch with no visible distortion; a dev-only warning fires if a future map exceeds ~5% aspect delta.
- Heat input rules, agreed in grilling: only rounds with ok status; only points whose timestamp falls within that round's start-to-cutoff window; Player Type1 equals icon types ending in player, Player Type2 equals bomb and grenade event types; Utility heat equals the selected utility row's event type only; bomb-carried markers are excluded from the utility mix; all heat is filtered to the active team lens and to rounds where that team's side matches the selected Attacking/Defending toggle.
- Utility mix derivation: group event trajectories by normalized utility name (frag grenade maps to Frag, smoke variants to Smoke, concussion to Concussion), count throws per group, share equals group count over total event throws under the same lens-plus-side filter. Selection is local single-select component state auto-seeded to the first row, not a new URL key, preserving the existing five-key URL contract.
- Top Setups aggregation: one occurrence per ok round per active team where that team's round side matches the selected side; group identical site-count patterns including Mid; frequency equals group count over total matching rounds; sorted descending; all rows rendered with small outlined site badges (including a Mid badge) and right-aligned frequency in a scrollable container at stable height.
- Status surfacing: failed rounds and low-confidence splits never block rendering; they collapse to a compact note plus badge on the minimap card.
- Visual continuity: dark card surface, existing tab and side-toggle controls unchanged, Type1/Type2 toggle remains Player-tab only, placeholder lucide utility icons unchanged, empty dark square-aspect box preserved as the heat container.

## Testing Decisions

- Proposed seam (confirm it matches expectations): a single seam at the team-scoped match view module boundary, extended with the analysis query. Inputs are the two route identifiers plus the match detail and analysis query results; outputs are the rendered lens control, score, heatmap canvas region, setup rows, utility rows, and loading/error/empty/status-note states. No new seams inside sub-pieces; the analysis query-option builder, score mapping, coordinate normalization, and aggregation helpers are covered implicitly through the module.
- What makes a good test here: assert externally visible behavior only (rendered final score, active tab/side/heat selections, heat region present with correct base image, empty-state copy for unplayed lens-plus-side, derived setup rows including Mid with scroll container, derived utility rows with single auto-selected active row and row-driven heat change, failure/confidence note present), never internal state variable names, CSS class strings, canvas pixel values, or mock constant identity.
- Modules under test: the team-scoped match view composition including its redirector behavior unchanged, plus the analysis query shape and the heatmap/setup/utility derivations through the view.
- Prior art: none. The repo has no test runner and no unit or component tests, so the acceptance path for this spec is manual verification against a running dev server with the sample payload: load a match team address, confirm real score, flip every view/side/heat combination, flip the team lens, select each utility row, confirm Tunisia overlay alignment plus one other map when available, confirm scroll on long setup lists, confirm responsive stacking, and confirm team pages still show placeholders.

## Out of Scope

- Any backend analysis endpoint work; the frontend ships against the mock until it exists.
- Cross-match or per-map aggregation of trajectories on team pages.
- Zone entries, held-site markers, winner progression, score-after timelines, or round pickers.
- Target-score captions or win-condition displays.
- Final utility iconography beyond placeholder icons.
- Sorting, pagination, or search inside setup and utility lists beyond scroll.
- Persisting utility selection or any new keys beyond the five agreed URL keys.
- Site geometry, zone polygons, or tactical annotation layers on the minimap.

## Further Notes

- Domain terms resolved during grilling, candidates to record when a context glossary is started: MatchAnalysis (per-match result payload), Trajectory (one track id's timed point list), Normalized point (x over crop width, y over crop height), Minimap base (Map API image for a map slug, distinct from bundled banner art), Type1 heat (player density), Type2 heat (event density), Setup (player distribution across sites plus frequency, now including Mid), Team All (stats versus the selected opponent), Utility percentage (share of overall utils used).
- No context glossary or architecture decision records exist in the repo yet; the separate-analysis-endpoint, client-canvas-heat, stretch-mapping, lens-filtered, and setups-from-zone-counts rules above are candidates to record when that documentation is started.
- Reference heat treatment is blue-to-green-to-yellow-to-red additive glow over a dark tactical minimap with no site markers yet.
