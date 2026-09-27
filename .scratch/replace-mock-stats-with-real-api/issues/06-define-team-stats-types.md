# 06: Define team stats types

**What to build:** Type contract for the future team stats endpoint, mirroring the `match.results` response shape but aggregated across all matches for a team. This gives the backend team a clear contract to implement against.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Define `TeamStats` type with aggregated fields (wins, losses, win_rate, per_map breakdown)
- [ ] Define `TeamStatsMap` type for per-map stats (map name, win_pct, attacking/defending side stats)
- [ ] Export types from a new file
- [ ] Add a comment noting these types are provisional and should be revisited when the backend endpoint shape is finalized
