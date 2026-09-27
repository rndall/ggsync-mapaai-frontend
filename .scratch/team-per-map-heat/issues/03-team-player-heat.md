# 03: Team live Player heat per map

**What to build:** The team panel's blank minimap box becomes a live per-map heat read: switching the map dropdown switches the minimap base and the density to that map, scoped to the detail team and the selected side, with honest empty and status states. Numbers beside the map stay exactly as today.

**Blocked by:** 01, 02 (needs the single-heat definition and the map-only panel).

**Status:** ready-for-agent

- [ ] Heatmap base is the selected map's minimap image; missing image falls back to the dark box with heat only, and the banner keeps its separate bundled art
- [ ] Points aggregate the detail team's matches on the selected map across all opponents, following the detail team by per-match side color; non-participant matches contribute nothing
- [ ] Only ok rounds and points inside each round's start-to-cutoff window contribute; Attacking versus Defending filters the rounds
- [ ] Zero matches on the map and unplayed lens-plus-side each render their explicit empty message rather than a blank box
- [ ] Failed rounds collapse to a compact note with summed counts; any low-confidence contribution renders a badge without blocking
- [ ] Rotation, setups, utility mix, and win rate stay on today's mocked values; heat arrival causes no layout shift and stacks on narrow screens

Prototype shape from the spec that encodes the aggregation decision:

`TeamMapHeat { points { nx, ny }[], matchedRounds, failedRounds, lowConfidence }` where `nx` is x over crop width and `ny` is y over crop height, each clamped to 0-1.
