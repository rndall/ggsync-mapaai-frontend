# 04: Team live Utility heat plus acceptance

**What to build:** The Utility tab on the team panel gets the same live treatment row by row: picking a utility row swaps the map layer to that utility on the selected map, completing the end-to-end heat slice for both tabs.

**Blocked by:** 03 (needs the live per-map aggregation and base wiring).

**Status:** done

- [x] Utility heat shows only the selected utility row's points on the selected map with no toggle; picking a row swaps the layer
- [x] Empty utility slice renders the explicit empty state with team and side labels; failure note and confidence badge behave as on the Player tab
- [x] Every view, side, map, and utility-selection combination updates the heat region with no overflow at narrow widths
- [x] Full regression: single player heat with no toggle on team and match pages, map-only filters, view/side/map deep links work, stale opponent and heat keys ignored

## Comments

- Implemented in `00b311a`: `selectTeamUtilityHeat` in `analysis-team-heat.ts` (per-match lens-color merge over the shared utility-heat selector), optional `utilityName` seam on `use-team-map-heat.ts` (undefined keeps player density), row-name `heatLabel` on `team-map-heat.tsx` reusing `MatchHeatmap` empty/failure/badge states, local (never URL) utility selection plus row-driven heat in `per-map-stats.tsx`; Utility tab placeholder gone on the team page, left-column mocks untouched. Verified via tsc (2 pre-existing unrelated errors), eslint/prettier, `pnpm build`, tsx runtime assertions against the sample payload (blue/attacking Smoke 2 pts vs Frag 1 pt confirming the row-driven swap, Concussion 1 pt, red/defending Frag 2 pts, unplayed lens-plus-side empty, null selection counts rounds with no points, non-participant and non-ready contribute nothing, two-match merge doubles points/rounds/failed, missing analysis contributes nothing), and a two-axis code review (Standards: no hard findings, 4 smell judgements kept as-is mirroring existing parallel-selector style; Spec: no scope creep, zero-matches copy keeps the shared Player-tab team-plus-map wording, dual active-utility fallbacks compute from identical inputs); no test runner in repo.
