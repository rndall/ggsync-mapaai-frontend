Status: ready-for-agent

## Problem Statement

Coaches viewing a team have no at-a-glance read on how that team plays each map: how often the map is won, how players distribute across sites, how stubborn or rotaty they are after wins versus losses, and how their utility mix breaks down. That context lives in raw matches today, so pre-game preparation is slow and anecdotal.

## Solution

Add a Per Map Stats panel to the team detail view with a map banner and win rate, Player versus Utility tabs, Attacking versus Defending split, and a minimap placeholder. Filters for opponent team and map are live against existing list endpoints; all other numbers are typed hardcoded mocks so the layout can be reviewed and the real stats API can drop in later without reflow.

## User Stories

1. As a coach, I want to see the Per Map Stats heading with Team and Map filters, so that I know which slice of performance I am looking at.
2. As a coach, I want to pick an opponent team from the Team filter (default All, meaning stats versus the selected opponent), so that I can scope reads to a matchup.
3. As a coach, I want to pick a map from the Map filter, so that the banner, win rate, and stats follow the selected map.
4. As a coach, I want to see the selected map name in large display type over its map banner art, so that the context is unmistakable.
5. As a coach, I want to see Map Win % prominently (hardcoded 100% for now), so that I get the headline outcome first.
6. As a viewer, I want the map banner to reuse the bundled map art with its existing watermark-aware framing, so that Tunisia and siblings look correct without extra asset work.
7. As a coach, I want to switch between Player and Utility tabs, so that I can move between positioning reads and utility reads.
8. As a coach, I want to toggle Attacking versus Defending, so that both sides of the ball have distinct reads.
9. As a coach viewing Player + Attacking, I want Rotation Odds with Behavior After a Win (stay vs switch split bar), so that I can see how sticky the team is when ahead.
10. As a coach viewing Player + Attacking, I want Rotation Odds with Behavior After a Loss (stay vs switch split bar), so that I can see how reactive the team is when behind.
11. As a coach, I want each rotation bar to show both percentages numerically plus a green (same site) / red (switch) split, so that the lean is glanceable.
12. As a coach, I want the top site setups ranked (e.g. 3A 2B at 18%, 5B at 15%, 2A 3B at 13%, 5A at 12%, 4A 1B at 10%), so that I know the common distributions and their frequency.
13. As a coach, I want each setup's site counts shown as small outlined badges with the frequency right-aligned, so that rows scan quickly.
14. As a coach viewing Utility, I want an event table with name, throw count, and share of overall utils (Smoke 5 at 50%, Frag 3 at 30%, Concussion 2 at 20%), so that I know the utility mix.
15. As a coach, I want the selected utility row highlighted, so that I know what is active when heatmaps land.
16. As a coach, I want placeholder icons for each utility type until final art exists, so that rows are still distinguishable.
17. As a coach, I want a minimap panel beside the stats with a Type1 versus Type2 toggle, so that future heatmap calculations have a home.
18. As a coach, I want the minimap panel to stay blank but layout-stable (same height as the stats column), so that the coming heatmap does not shift the page.
19. As a returning viewer, I want view, side, heat, team, and map reflected in the URL, so that I can deep-link a specific read (player/attacking/type1/all/first-map by default).
20. As a viewer on mobile, I want the two-column panel to stack, so that nothing overflows at narrow widths.
21. As a developer uploading a match elsewhere in the app, I want the team selection options to keep working after the endpoint becomes global, so that nothing regresses.

## Implementation Decisions

- New route-local Per Map Stats module rendered on the team detail route between the team heading and the match history. Sub-pieces: header filters, banner header, view tabs, side toggle, left stats column (rotation card + setup list, or utility table), right minimap placeholder with heat toggle.
- Team options query becomes a global no-arg query against the team selection options endpoint returning the full team list. The single scoped caller in the upload-match flow is updated to the new signature; its previous team-scoped versus full-list branch collapses because the global endpoint already returns what both branches needed.
- Map filter reuses the existing maps list query; when no map is chosen it falls back to the first available map. Team filter reuses the migrated global team options query with an explicit All entry meaning stats versus the selected opponent.
- URL state uses the installed query-state library with a router adapter wired once. Keys and defaults agreed in grilling: view player or utility defaulting to player, side attacking or defending defaulting to attacking, heat type1 or type2 defaulting to type1, team all-or-id defaulting to all, map id defaulting to the first map. All five toggles swap the hardcoded datasets locally with no fetching beyond the two list queries.
- Banner art reuses the existing map-background helper (normalized name lookup plus per-map position, scale, and origin framing that keeps watermarks out of frame), with a gradient-only fallback when a map has no bundled asset. Map name renders uppercase in display type; win rate renders in gold and stays hardcoded until the stats endpoint exists.
- Mock contract agreed in grilling, kept in-file and clearly marked for replacement: per map with win percentage plus per-side rotation-after-win, rotation-after-loss, site setups, and utility mix. Prototype shape that encodes the decision:
  `PerMapStats { mapName, winPct, attacking: SideStats, defending: SideStats }` where `SideStats { rotationAfterWin { stay, switch }, rotationAfterLoss { stay, switch }, setups { a, b, pct }[], utility { name, count, pct }[] }`.
- Visual specifics agreed: dark card surface with border, display font for headings and body font elsewhere, corrected loss split 24 stay / 76 switch (the mockup's 24/70 does not sum to 100), red-outline setup badges, green/red split bars with numeric labels on both ends, utility table with event and percent columns and active-row highlight, lucide placeholder icons for smoke/frag/concussion, empty dark square-aspect minimap box preserving column height with no site markers yet.
- Heat toggle labels stay literally Type1 and Type2 because the two calculation names are undecided; flipping the toggle only flips URL state for now.

## Testing Decisions

- Proposed seam (confirm it matches expectations): a single seam at the Per Map Stats module boundary. Inputs are the five URL states plus the two list-query results; outputs are the rendered banner, tabs, side content, and placeholder. No new seams inside sub-pieces; query-option builders for team options and maps are covered implicitly through the module.
- What makes a good test here: assert externally visible behavior only (selected filter labels, active tab/side/heat, rendered percentages and setup rows, empty minimap region present), never internal state variable names, CSS class strings, or mock constant identity.
- Modules under test: the Per Map Stats module composition and the migrated global team-options query shape. The map-background helper is already exercised through match cards and needs no new coverage for this layout.
- Prior art: none. The repo has no test runner and no unit or component tests, so the acceptance path for this spec is manual verification against a running dev server: load a team page, confirm both list filters populate, flip every view/side/heat combination, confirm banner framing on Tunisia plus one other map, confirm responsive stacking, and confirm the upload-match team pickers still list teams.

## Out of Scope

- Any real per-map stats endpoint, win-rate computation, rotation computation, setup aggregation, or utility aggregation.
- Minimap or heatmap rendering, site markers, zone geometry, or final Type1/Type2 naming.
- Final utility iconography beyond placeholder icons.
- Additional banner assets beyond the bundled map backgrounds.
- Sorting, pagination, or search inside the setup and utility lists.
- Persisting anything beyond the five agreed URL keys.

## Further Notes

- Domain terms resolved during grilling: Setup (e.g. 3A 2B) means player distribution across sites plus its frequency; Rotation Odds means same-site stay versus switch tendency on the next round, split by after-win and after-loss; Team All means stats versus the selected opponent; Utility percentage means share of overall utils used.
- The loss-bar numbers in the mockup sum to 94%; the layout hardcodes the corrected 24/76 unless real data says otherwise.
- No context glossary or architecture decision records exist in the repo yet; the terms above are candidates to record when that documentation is started.
