Status: ready-for-agent

## Problem Statement

Coaches viewing a team can read mocked positioning numbers per map but see only a blank box where the map read should be. The match view already renders live player-density heat over the real minimap, yet the team view never shows it, and the map picker does not drive any heat. Separately, the Player tab carries two heat calculations behind a toggle whose names were never decided, adding choice without meaning.

## Solution

Show live per-map heat on the team detail Per Map Stats panel, driven by the map selected in the dropdown, and collapse Player heat to a single player-density calculation with no toggle in both the team view and the per-match view. The opponent picker goes away for now. All left-column numbers stay mocked until a real stats endpoint exists; only the right minimap becomes live. The client-side aggregation ships behind a narrow query seam so a future per-map heat endpoint can replace it without component changes.

## User Stories

1. As a coach, I want the Per Map Stats panel on the team page to show a live heatmap beside the stats, so that the map read sits next to the numbers.
2. As a coach, I want the heatmap to follow the map selected in the Map dropdown, so that switching maps switches the map read.
3. As a coach, I want the heatmap base to be the real minimap image for the selected map, so that density lands on the tactical layout.
4. As a coach, I want the map banner to keep showing the selected map name over its bundled banner art, so that banner context and minimap context stay visually distinct.
5. As a coach, I want Player heat to be a single player-position density with no Type1/Type2 toggle, so that there is one obvious map read.
6. As a coach viewing a match, I want the same single player-density heat with no toggle, so that team and match reads agree.
7. As a coach toggling Attacking versus Defending, I want team heat to follow the selected side, so that both sides of the ball have distinct maps.
8. As a coach switching between Player and Utility tabs, I want heat to follow the tab, so that positioning and utility reads stay paired.
9. As a coach viewing Utility, I want heat to show only the selected utility row's points with no heat toggle, so that each utility reads in isolation.
10. As a coach selecting a utility row, I want the minimap layer to swap to that utility, so that picking a row changes the map.
11. As a coach viewing heat for my team, I want only my team's points aggregated across matches even though side colors vary per match, so that the map never mixes in opponent density.
12. As a coach viewing a map with no tracked matches, I want an explicit empty message rather than a blank box, so that emptiness reads as fact.
13. As a coach viewing a lens-plus-side combination the team never played on the selected map, I want an explicit unplayed message, so that gaps read as fact rather than breakage.
14. As a coach viewing matches with failed analysis rounds, I want those rounds excluded from heat with a small note on the minimap card, so that failures are visible without blocking the rest.
15. As a coach viewing low-confidence detection, I want a badge rather than hidden heat, so that I can discount the read myself.
16. As a coach, I want no opponent Team filter on the panel for now, so that the only slice I pick is the map.
17. As a coach, I want the Map filter to default to the first available map, so that the page always opens on a valid heat read.
18. As a returning viewer, I want view, side, and map reflected in the URL, so that I can deep-link a specific read with player, attacking, and first-map defaults.
19. As a viewer with an old link containing opponent or heat keys, I want the page to still load ignoring those keys, so that old deep links do not break hostilely.
20. As a viewer on mobile, I want the stats-plus-minimap grid to keep stacking, so that heat never overflows at narrow widths.
21. As a developer integrating the future per-map heat endpoint, I want one query seam whose shape stays stable, so that going live is a backend swap with no route or component change.
22. As a coach viewing rotation, setups, and utility mix on the team page, I want those numbers to stay exactly as today, so that only the minimap changes in this slice.

## Implementation Decisions

- Team Per Map Stats panel becomes the heat host on the team page: map dropdown drives banner plus heat base plus heat points together. A future backend per-map heat endpoint replaces only the query seam behind the panel.
- Heat source is client-side aggregation for now: list the detail team's matches for the selected map across all opponents, fetch per-match analysis for each, map the detail team to its per-match side color, and merge density points. Only rounds with ok status and points inside each round's start-to-cutoff window contribute. Prototype shape that encodes the decision:
  `TeamMapHeat { points { nx, ny }[], matchedRounds, failedRounds, lowConfidence }` where `nx` equals x over crop width and `ny` equals y over crop height, each clamped to 0-1.
- Team lens rule: the detail team is followed by color per match, never a fixed color. A match where the detail team is not a participant contributes nothing.
- Single Player heat definition everywhere: player-position density only (track types ending in player). The event-density calculation stops rendering as a separate toggle in both team and match reads. Utility heat stays row-driven on the selected utility name under the same round, window, lens, and side filter.
- Heat toggle UI and its URL key go away in both team and match views. The remaining URL contract is view, side, and map with player, attacking, and first-map defaults. Stale opponent or heat keys in the address are ignored, never errors.
- Opponent scoping is removed from the panel in this slice: the filter UI goes away, the team list is not fetched for the panel, and aggregation always covers all opponents on the selected map. It returns only as a future slice.
- Minimap base is the selected map's minimap image, independent of the banner's bundled art. Null or missing image renders the existing dark box with heat only. Banner framing, gradient fallback, display name, and hardcoded win rate are unchanged.
- Left column stays on the typed hardcoded mock contract (win percentage plus per-side rotation-after-win, rotation-after-loss, site setups, and utility mix) with no fetching beyond the maps list. Side and view toggles keep swapping mock slices locally as today.
- Status surfacing reuses the match heat treatment: summed failed-round counts render as a compact note, any contributing low-confidence split renders a badge, zero matched rounds or zero points render the explicit empty copy with team and side labels.
- Visual continuity: same dark card surface, same square-aspect heat box and column height so heat arrival causes no reflow, same canvas density treatment with the reference blue-green-yellow-red ramp, same scrollable setup list and utility table behavior.

## Testing Decisions

- Proposed seam (confirm it matches expectations): a single seam at the team Per Map Stats host boundary. Inputs are the team identifier, the view/side/map selections plus utility selection, and the team-matches list with per-match analysis results; outputs are the rendered banner, tabs, side content, and heatmap region including loading, empty, failure-note, and badge states. The match-view toggle removal and the aggregation helpers are covered implicitly through this seam plus the existing team-scoped match view seam. No new seams inside sub-pieces.
- What makes a good test here: assert externally visible behavior only (selected map label, banner name, heat region present with correct minimap base, empty copy for unplayed map or lens-plus-side, heat change across map/side/tab/utility selection, no heat toggle rendered, no opponent filter rendered, failure note and badge when applicable, responsive stacking), never internal state variable names, CSS class strings, canvas pixel values, or mock constant identity.
- Modules under test: the team Per Map Stats composition with its new heat seam, the shared heatmap presentation in both hosts, and the toggle-removal behavior on the match view.
- Prior art: none. The repo has no test runner and no unit or component tests, so the acceptance path is manual verification against a running dev server: load a team page, confirm heat follows each map in the dropdown, flip view/side/utility, confirm single heat with no toggle on team and match pages, confirm empty states on a map with no matches, confirm stacking at narrow widths, and confirm old links with opponent or heat keys still load.

## Out of Scope

- Any real per-map stats endpoint work for rotation, setups, utility mix, or win rate; the left column stays mocked.
- Any backend per-map heat endpoint work; the frontend aggregates client-side until it exists.
- Reintroducing opponent scoping, search, sorting, or pagination on the team panel.
- Reintroducing a second heat calculation or finalizing undecided calculation names beyond player density.
- Zone entries, held-site markers, winner progression, score timelines, or round pickers.
- Target-score captions or win-condition displays.
- Final utility iconography beyond placeholder icons.
- Site geometry, zone polygons, or tactical annotation layers on the minimap.
- Persisting utility selection or any new URL keys.

## Further Notes

- Domain terms resolved during grilling, candidates to record when a context glossary is started: TeamMapHeat (aggregated per-map heat payload), Normalized point (x over crop width, y over crop height), Minimap base (Maps API image for a map, distinct from bundled banner art), Player heat (player-position density, the surviving calculation), Team lens (detail team followed by per-match side color), Setup (player distribution across sites plus frequency), Utility percentage (share of overall utils used).
- The Type1/Type2 toggle labels are retired with the toggle; do not reuse those names for the future endpoint without fresh grilling.
- Opponent scoping removal is a product deferral, not a technical limitation: the team-matches listing already supports an optional opponent filter, so re-adding it later is a filter plus aggregation change behind the same seam.
