# 04: Team live Utility heat plus acceptance

**What to build:** The Utility tab on the team panel gets the same live treatment row by row: picking a utility row swaps the map layer to that utility on the selected map, completing the end-to-end heat slice for both tabs.

**Blocked by:** 03 (needs the live per-map aggregation and base wiring).

**Status:** ready-for-agent

- [ ] Utility heat shows only the selected utility row's points on the selected map with no toggle; picking a row swaps the layer
- [ ] Empty utility slice renders the explicit empty state with team and side labels; failure note and confidence badge behave as on the Player tab
- [ ] Every view, side, map, and utility-selection combination updates the heat region with no overflow at narrow widths
- [ ] Full regression: single player heat with no toggle on team and match pages, map-only filters, view/side/map deep links work, stale opponent and heat keys ignored
