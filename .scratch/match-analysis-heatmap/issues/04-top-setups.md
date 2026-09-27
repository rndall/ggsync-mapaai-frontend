# 04: Top Setups from zone distributions

**What to build:** Coaches viewing Player stats see every observed site distribution including Mid as a scrollable setup list with frequencies derived from per-round zone splits.

**Blocked by:** 01-analysis-contract-query.

**Status:** implemented in `ab1dd42`

- [x] Each setup row shows site-count badges including Mid with its frequency right-aligned.
- [x] Frequencies aggregate identical site-count patterns over side-matched ok rounds for the active team.
- [x] All observed patterns render (no top-5 cut) inside a scrollable container at stable panel height.
- [x] Switching lens or side re-aggregates the list; failed rounds stay excluded.

## Comments

- Implemented in `ab1dd42`: `src/features/matches/analysis-setups.ts` (`selectTopSetups`, lens/side-matched ok-round grouping incl. Mid, share sorted by raw count desc), Mid badge plus right-aligned share in `player-stats.tsx` with a fixed-height (`h-60`) scrollable list and an empty state for unplayed lens-plus-side, `setups` override slot on `PerMapStats` (undefined keeps the team-page mock; defined array renders the live read), wired into `MatchTeamView` alongside heat. Failed-round exclusion shares the heat card's status note. Verified via tsc (2 pre-existing unrelated errors), eslint/prettier, `pnpm build`, and runtime assertions against the sample payload (blue/attacking 6 rows, red/defending re-aggregates, unplayed sides empty, duplicates aggregate); no test runner in repo.
- Review fixes: sort by raw count rather than rounded share, pattern-identity row keys, fixed-height container for the stable-height requirement.
