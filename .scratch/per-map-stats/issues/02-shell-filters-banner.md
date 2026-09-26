# 02: Per map stats shell with live filters plus banner

**What to build:** The Per Map Stats panel appears on the team detail view between the team heading and the match history, with a heading, opponent Team filter defaulting to All (stats versus the selected opponent), Map filter defaulting to the first map, and a map banner showing the display map name with its bundled art plus a hardcoded gold Map Win %.

**Blocked by:** 01 (needs the global team options and query-state adapter).

**Status:** done

- [x] Heading with Team and Map filters renders above the banner, both populated from live list queries
- [x] Banner shows the selected map name in display type over its framed map art with gradient fallback when art is missing
- [x] Map Win % renders prominently as agreed hardcoded value
- [x] View, side, team, and map selections persist in the URL with agreed defaults

## Comments

Verified implemented 2026-09-26:
- Panel order `TeamHeading` → `PerMapStats` → `MatchHistory` in `src/routes/_authed/teams/$teamId.tsx:40-46`; heading + `PerMapStatsFilters` above banner in `per-map-stats.tsx:73-96`.
- Live queries `teamQueries.options()` + `mapQueries.list()` (`per-map-stats.tsx:37-41`); team defaults to `all` (`use-per-map-stats-params.ts:13,31-34`, `per-map-stats-filters.tsx:44-57` with explicit All entry); map defaults to first available (`per-map-stats.tsx:42-50`, `use-per-map-stats-params.ts:35`).
- Banner `per-map-banner.tsx:11-57` — `font-heading uppercase` display name, framed art via `mapBackground()` (`matches/utils.ts:64-99`), gradient base always rendered as fallback (`:27-30`), image layer only when asset exists.
- `MAP_WIN_PCT = 100` hardcoded (`per-map-stats.tsx:19-21,92-95`); prominent `text-4xl/sm:text-5xl` with gold `text-primary` label (`per-map-banner.tsx:58-61`).
- URL persistence for view/side/heat/team/map with defaults player/attacking/type1/all/''→first-map (`use-per-map-stats-params.ts:18-35`), wired to Tabs + filters (`per-map-stats.tsx:24-35,84,86,102-115`). Superset of ticket (adds `heat` per spec §19-20).
