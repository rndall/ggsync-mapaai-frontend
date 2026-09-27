# 02: Create normalization mapper

**What to build:** A normalization function that transforms the raw `MatchResults` API response into the existing `MatchAnalysis` frontend type, handling all type mismatches between the lossy OpenAPI types and the actual runtime data shape.

**Blocked by:** 01 — Define match-results types

**Status:** ready-for-agent

- [x] Create mapper function that accepts `MatchResults` and returns `MatchAnalysis`
- [x] Cast `playback.rounds` from `unknown[]` to typed `MatchResultsRound[]`
- [x] Map `final_score` to `MatchAnalysis.finalScore`
- [x] Map `playback` fields to `MatchAnalysis` playback fields
- [x] Handle null data (return null from mapper)

## Not in this ticket

The four casts below are **not** done here, and cannot be: `MatchAnalysis`
(`analysis-types.ts`) carries only `matchId`, `mapSlug`, `mapCrop`,
`finalScore`, `targetScore` and `rounds`, so `normalizeMatchResults` has no
field to surface `utility`, `player_heatmaps`, `participants` or
`perspective` into.

Nothing needs them yet either — `selectUtilityMix` and `selectPlayerHeatPoints`
both derive from `MatchAnalysis.rounds[].trajectories`, and `match-score-header`
reads `participants` from the match-detail query instead.

The precise shapes already exist in `match-results-types.ts` (ticket 01), so the
cast from the lossy generated OpenAPI response to `MatchResults` happens once at
the query boundary — that is ticket 03's `select`, not this mapper.

- [ ] Cast `utility` to `MatchResultsUtility[]` — see ticket 03
- [ ] Cast `player_heatmaps` to `MatchResultsHeatmap` — see ticket 03
- [ ] Cast `participants` to `MatchResultsParticipant[]` — see ticket 03
- [ ] Cast `perspective.side` to `"attacker" | "defender"` — see ticket 03

## Follow-ups

- **No test.** The spec's Testing Decisions call for testing the mapper in
  isolation, but this ticket lists none and the repo has no test runner. Add one
  when a runner is introduced.
- **Stubbed analysis fields.** `targetScore` is hardcoded to `5`, and
  `teamSplit` / `heldSite` / `zoneEntries` are zeroed/empty because the endpoint
  reports no zone data. Revisit if the backend adds it.
- **`perspective.side` translation** is only exercised for per-round
  `side.blue` / `side.red` (via `mapSide`); the top-level `perspective` field is
  unconsumed.
