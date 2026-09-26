# 04: Utility table plus plain heatmap placeholder

**What to build:** The Utility view shows the event table with throw counts and share of overall utils, with the active row highlighted and placeholder icons per utility type. Beside it a layout-stable blank heatmap box renders with no type toggle, stacking below the table on narrow screens.

**Blocked by:** 02 (needs the shell, filters, and banner; independent of 03 and may run in parallel).

**Status:** done

- [x] Event table lists Smoke with 5 throws at 50%, Frag with 3 at 30% highlighted, and Concussion with 2 at 20%
- [x] Blank heatmap box holds column height with no Type1/Type2 toggle and no site markers
- [x] Panel stacks to a single column on mobile with no overflow

## Comments

Verified implemented 2026-09-26:
- `UtilityStats` (`utility-stats.tsx:15-48`) renders Event/Throws/Share table from `sideStats.utility`; attacking mock is Smoke 5/50, Frag 3/30, Concussion 2/20 (`per-map-stats-mock.ts:48-52`); Frag (index 1) highlighted via `aria-current` + `bg-muted/60` (`utility-stats.tsx:13,50-57`); lucide placeholders CloudFog/Bomb/Zap per type (`:75-87`).
- Utility view reuses the blank `aspect-square` box with `showHeatToggle={view === 'player'}` (`per-map-stats.tsx:129-133`), so no Type1/Type2 toggle in Utility and no site markers (`minimap-placeholder.tsx:32-39`).
- Grid `grid-cols-1 lg:grid-cols-2` (`per-map-stats.tsx:123`) stacks on mobile; table section uses `min-w-0` + `truncate` (`utility-stats.tsx:19,63`) with no overflow.
