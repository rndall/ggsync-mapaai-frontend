# 01: Analysis contract + mock-backed query

**What to build:** The team-scoped match view can read a typed per-match analysis (map slug, processing crop size, final score, rounds with side assignment, zone splits with confidence, and timed trajectories) from a single query that serves the agreed sample payload as a mock until the backend analysis endpoint exists.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Match view resolves analysis for a numeric match id and stays disabled for non-numeric ids.
- [ ] Analysis shape covers map slug, crop width/height, final score per side, and rounds with status, side, zone splits, and trajectories (prototype shape: `MatchAnalysis { mapSlug, mapCrop, finalScore, rounds[] }` with `Round { status, side, teamSplit, trajectories[] }`).
- [ ] Sample payload loads as the mock fallback with no network dependency.
- [ ] Query shape accepts the future `GET /matches/{match}/analysis` swap with no consumer change.
