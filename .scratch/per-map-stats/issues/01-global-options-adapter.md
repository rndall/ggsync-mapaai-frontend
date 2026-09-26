# 01: Global team options plus query-state adapter

**What to build:** Team selection options come from the global team options endpoint with no team identifier, so the Per Map Stats Team filter and the existing upload-match team pickers share one working source. The URL query-state library is wired to the router once so later tickets can persist view state in the address bar.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] Team options query returns the full team list without requiring an identifier
- [x] Upload-match team pickers still list teams with no errors
- [x] Query-state adapter is wired so URL keys can be read and written from the team page

## Comments

Verified implemented 2026-09-26:
- `src/features/teams/queries.ts:17` — `options: () => $api.queryOptions('get', '/teams/options')`, no-arg global query; contract in `src/types/api.d.ts:250-266,979-1002` takes no path/query params.
- `src/features/matches/components/upload-match-form.tsx:95` uses `teamQueries.options()` with no identifier; `teamId` prop only pre-fills/looks up (`:98-100`); pickers wired via `TeamColorField`/`TeamCombobox` with `?? []` fallback.
- `src/routes/__root.tsx:7,19-24` — `NuqsAdapter` wraps `<Outlet />`; `nuqs@^2.10.1` in `package.json:31`; `use-per-map-stats-params.ts:18-48` exposes view/side/heat/team/map via `useQueryState`, consumed in `per-map-stats.tsx:24-35,84-86,102-115` on route `_authed/teams/$teamId.tsx:44`.
