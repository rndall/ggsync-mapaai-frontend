# 05: Delete mock files

**What to build:** Remove the mock data files now that real API data is wired up, eliminating dead code and confusion about which data source is authoritative.

**Blocked by:** 04 — Update match-team-view and match-score-header components

**Status:** ready-for-agent

- [ ] Delete `src/features/matches/analysis-mock.ts`
- [ ] Delete `src/features/teams/components/per-map-stats/per-map-stats-mock.ts`
- [ ] Verify no remaining imports of the deleted files
- [ ] Verify the app builds successfully
- [ ] Verify the match detail page still renders correctly
