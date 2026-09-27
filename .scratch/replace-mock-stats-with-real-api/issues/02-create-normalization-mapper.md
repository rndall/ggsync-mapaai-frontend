# 02: Create normalization mapper

**What to build:** A normalization function that transforms the raw `MatchResults` API response into the existing `MatchAnalysis` frontend type, handling all type mismatches between the lossy OpenAPI types and the actual runtime data shape.

**Blocked by:** 01 — Define match-results types

**Status:** ready-for-agent

- [ ] Create mapper function that accepts `MatchResults` and returns `MatchAnalysis`
- [ ] Cast `playback.rounds` from `unknown[]` to typed `MatchResultsRound[]`
- [ ] Cast `utility` to `MatchResultsUtility[]`
- [ ] Cast `player_heatmaps` to `MatchResultsHeatmap`
- [ ] Cast `participants` to `MatchResultsParticipant[]`
- [ ] Cast `perspective.side` to `"attacker" | "defender"`
- [ ] Map `final_score` to `MatchAnalysis.finalScore`
- [ ] Map `playback` fields to `MatchAnalysis` playback fields
- [ ] Handle null data (return null from mapper)
