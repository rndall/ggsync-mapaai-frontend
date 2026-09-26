Status: ready-for-agent

## Problem Statement

Coaches have two ways into a match — the global matches list and a team's match history — but there is no agreed match detail page that shows statistics from one team's perspective. Without a canonical team-scoped match URL, entry from the global list has no deterministic team to show, entry from a team list loses its team context, and refresh or an internal link paste loses the selected perspective.

## Solution

Establish a single canonical team-scoped match view keyed by match plus team, with context-aware auto-pick, redirect-based validation, and instant team-lens switching. Landing on a bare match resolves to a valid team (incoming team context when present, otherwise the first participant in blue-first order) and redirects to the canonical team-scoped address. Switching teams flips the same widgets to the other perspective via history-replace tab navigation, so the browser Back button always leaves the match instead of ping-ponging between perspectives. There is deliberately no breadcrumb on the match view: Back is the browser's. The view fetches the match once and derives the perspective client-side so a future backend perspective parameter can drop in without a route change.

## User Stories

1. As a coach viewing the global matches list, I want clicking a match card to land on a team perspective of that match, so that I never hit a dead-end picker.
2. As a coach viewing a team's match history, I want clicking the view action to land on that team's perspective of the match, so that my team context is preserved.
3. As a coach opening a bare match address with no team, I want to be redirected to a valid team perspective automatically, so that every match address resolves.
4. As a coach arriving from a team context, I want the redirect to prefer that team when it participated in the match, so that my origin is respected.
5. As a coach arriving from the global list with no team context, I want the redirect to pick the first participant in the established side order, so that the default is deterministic.
6. As a coach refreshing the page, I want the same team perspective to reopen, so that reload never loses context.
7. As a coach pasting a match link to a teammate who is also authenticated, I want the same team perspective to open for them, so that internal review links work behind auth.
8. As a coach viewing a match, I want an explicit control showing the two participating teams with the active one indicated, so that I know whose perspective I am reading.
9. As a coach switching teams, I want the same widgets to re-render flipped to the other team's point of view, so that comparison is a lens change not a new page.
10. As a coach switching teams, I want the switch to replace rather than push history, so that Back leaves the match instead of ping-ponging between perspectives.
11. As a coach opening a team-scoped address whose team did not participate in the match, I want a redirect to the auto-picked valid team, so that stale or typed addresses self-heal instead of 404ing hostilely.
12. As a coach navigating Back from a match (browser back), I want to return to where I came from (global list or team detail), so that both entries feel native.
13. As a coach viewing a match, I want no breadcrumb competing with the browser Back button, so that there is exactly one way back and it never disagrees with navigation state.
14. As a coach viewing a not-yet-ready match row, I want no view action offered (matching the existing analyzing treatment), so that I cannot open a perspective with no analysis behind it.
15. As a coach viewing a match, I want loading, error, and empty-participant states to be legible, so that slow or broken fetches are distinguishable from valid perspectives.
16. As a developer integrating the future stats endpoint, I want the perspective to be derivable client-side from a single match fetch today, so that a backend perspective parameter later requires no route change.

## Implementation Decisions

- Canonical address is match plus team with both segments required; the bare match address exists only as a redirector and never renders content. Rejected alternatives from grilling: optional query-string team (signals optional, weaker for an always-required lens) and team-scoped nesting of matches under teams (fits only the team-first entry and would duplicate the page for the global entry).
- Auto-pick priority agreed in grilling: incoming team context when present and a valid participant, otherwise the first participant in the established blue-first side order. There is no favorite-team concept in the app, so no favorite branch exists.
- Invalid-team handling: any team-scoped address whose team is not among the match participants redirects to the auto-picked valid team for that match.
- Team switching is a same-match lens change: a two-option tab-style control bound to the team segment, navigating with history replacement. Back from either perspective exits the match; it never cycles between the two teams.
- Back navigation is the browser's only: there is no breadcrumb on the match view. Team switching uses history replacement, so Back from either perspective exits the match to the entry point instead of cycling between the two teams. Navigation origin travels in lightweight location state used solely for bare/invalid-address auto-pick, never rendered.
- Data contract is decoupled from the unfinished stats API: fetch the match detail once per match, derive the team perspective client-side for instant switching. A future backend perspective filter can be added as a query concern without changing the route shape.
- Perspective semantics are a point-of-view flip over exactly two participants: same widget set, numbers and labels re-oriented to the active team. No combined neutral view and no side-by-side compare view in this scope.
- Participant ordering reuses the established domain rule: blue side first, red side second, unrecognized side values in between with array-order fallback. Match identity, names, timestamps, map, status, and participant team identifiers come from the existing match resource shape.
- Proposed seam (confirm it matches expectations): a single seam at the team-scoped match view module boundary. Inputs are the two route identifiers plus the match detail query result and the lightweight navigation origin for auto-pick; outputs are the rendered team lens control and perspective content including loading/error/redirect states. No new seams inside sub-pieces; list-to-detail link builders and detail query-option builders are covered implicitly through the module.

## Testing Decisions

- What makes a good test here: assert externally visible behavior only (landed team perspective after each entry path, redirect targets for bare and invalid addresses, active team indication, flipped perspective labels after switching, browser Back exiting the match, loading/error messaging), never internal state variable names, CSS class strings, or route-file identity.
- Modules under test: the team-scoped match view composition including its redirector, plus the two entry link builders (global list card and team history row) and the match detail query shape.
- Prior art: none. The repo has no test runner and no unit or component tests, so the acceptance path for this spec is manual verification against a running dev server: enter from the global list, enter from a team history, load a bare match address, load an invalid-team address, refresh, paste the address in a second authenticated session, flip teams and confirm replace-navigation, confirm browser Back exits to the entry point, and confirm non-ready history rows still offer no view action.

## Out of Scope

- Any real per-team match statistics endpoint, win/loss computation, or aggregation logic beyond flipping the fetched match to the active perspective.
- A neutral combined view showing both teams at once, or a side-by-side compare layout.
- Favorite teams, recent-team memory beyond the immediate navigation origin, or personalization of the default pick.
- Public link sharing or search-engine indexing of team perspectives beyond authenticated internal deep-linking.
- Sorting, pagination, or search inside the perspective content.
- Persisting anything beyond the two route identifiers and the lightweight navigation origin used for auto-pick.
- Breadcrumbs on the match view.

## Further Notes

- Domain terms used as in the codebase: Match (with map, status, played/created timestamps), Team, Participant (team identifier plus team name plus side color with blue-left/red-right ordering), Match History (team-scoped row list with analyzing versus ready treatment), Matches List (global card grid).
- Auth walls the whole area: shareability in this spec means authenticated internal deep-linking and refresh persistence, not public URLs.
- Route identifiers arrive as strings and are coerced for numeric queries; validity always means membership in the fetched match participant set, never mere numeric well-formedness.
- No context glossary or architecture decision records exist in the repo yet; the canonical-address, auto-pick, and replace-navigation rules above are candidates to record when that documentation is started.
