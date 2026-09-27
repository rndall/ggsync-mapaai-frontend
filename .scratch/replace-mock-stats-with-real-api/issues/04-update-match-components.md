# 04: Update match-team-view and match-score-header components

**What to build:** Wire the match detail page to use the new `useMatchResultsQuery` hook, display real match analysis data, and remove the `MOCK_SCORES` fallback from the score header.

**Blocked by:** 03 — Replace mock query with real query and hook

**Status:** ready-for-agent

- [ ] Update `match-team-view.tsx` to use `useMatchResultsQuery` instead of `useMatchAnalysisQuery`
- [ ] Pass `final_score` from the query to `match-score-header`
- [ ] Remove `MOCK_SCORES` constant from `match-score-header.tsx`
- [ ] Make `finalScore` a required prop on `match-score-header`
- [ ] Remove `MAP_WIN_PCT` constant from `per-map-stats.tsx`
- [ ] Verify heatmaps render real trajectory data
- [ ] Verify utility stats show real usage data
- [ ] Verify playback shows real round data
