# 02: Map-only filters, opponent removed

**What to build:** The team panel drops the opponent slice so the map picker is the only filter. The page always opens on a valid map read and old opponent-scoped links degrade gracefully.

**Blocked by:** 01 (same panel; keeps the toggle removal from conflicting).

**Status:** done

- [x] No opponent Team filter renders on the team panel; Map picker renders populated from the live maps list
- [x] Map defaults to the first available map and the banner name follows the selected map
- [x] Remaining URL contract is view, side, and map with player, attacking, and first-map defaults
- [x] Links with a stale opponent key load ignoring it, never an error or blank filter

## Comments

- Implemented in `a9a0969`: removed opponent Team filter UI and `team` URL key (map-only `PerMapStatsFilters`, maps-list-only fetch in `per-map-stats.tsx`); stale `?team=` keys ignored. Verified via tsc (2 pre-existing unrelated errors), eslint, `pnpm build`; no test runner in repo.
