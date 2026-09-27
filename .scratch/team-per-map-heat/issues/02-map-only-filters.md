# 02: Map-only filters, opponent removed

**What to build:** The team panel drops the opponent slice so the map picker is the only filter. The page always opens on a valid map read and old opponent-scoped links degrade gracefully.

**Blocked by:** 01 (same panel; keeps the toggle removal from conflicting).

**Status:** ready-for-agent

- [ ] No opponent Team filter renders on the team panel; Map picker renders populated from the live maps list
- [ ] Map defaults to the first available map and the banner name follows the selected map
- [ ] Remaining URL contract is view, side, and map with player, attacking, and first-map defaults
- [ ] Links with a stale opponent key load ignoring it, never an error or blank filter
