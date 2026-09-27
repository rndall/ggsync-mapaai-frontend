# 05: Utility mix + row-driven heat

**What to build:** Coaches viewing Utility see a mix table derived from event trajectories with exactly one row selected (first row auto-selected), and the minimap heat shows only the selected utility's points.

**Blocked by:** 01-analysis-contract-query, 03-player-heatmap (reuses the heatmap module).

**Status:** implemented in `f36e39d`

- [x] Utility rows show throw counts and share of overall utils derived from event trajectories under the same lens-plus-side filter; bomb-carried markers are excluded.
- [x] Exactly one row is active at a time with the first row pre-selected on load.
- [x] Selecting a row swaps the minimap heat to that utility type only; Type1/Type2 toggle remains Player-tab only.
- [x] Utility selection is local state and does not add URL keys; existing view/side/heat/team/map deep links keep working.

## Comments

- Implemented in `f36e39d`: `src/features/matches/analysis-utility.ts` (`selectUtilityMix`, lens/side-matched ok-round grouping by normalized name with bomb markers excluded, share sorted by raw count desc; `selectUtilityHeatPoints`, selected utility's window-filtered points with matched/failed/low-confidence), `showHeatToggle`/`heatLabel` on `match-heatmap.tsx` (toggle hidden in Utility mode), controlled rows plus single-select and Throws/Share columns in `utility-stats.tsx` with an empty state for unplayed lens-plus-side, `utility`/`selectedUtility`/`onUtilitySelect` slots on `PerMapStats` (undefined keeps the team-page mock), wired into `MatchTeamView` with local `useState` selection auto-seeded to the first row. Verified via tsc (2 pre-existing unrelated errors), eslint/prettier, `pnpm build`, and runtime assertions against the sample payload (blue/attacking Smoke 2/50% first row, red/defending Frag 2/67%, Smoke 2 pts vs Frag 1 pt confirming the row-driven swap, unplayed sides empty); no test runner in repo.
