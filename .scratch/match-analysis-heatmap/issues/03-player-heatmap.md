# 03: Player heatmap Type1/Type2

**What to build:** Coaches viewing Player heat see a density heatmap over the Map API minimap base, with Type1 showing player positions and Type2 showing event positions, filtered to the active team lens and the selected Attacking/Defending side.

**Blocked by:** 01-analysis-contract-query.

**Status:** implemented in `5f04ada`, `b67e765`, `8ac379a`, `6111529`, `c6d64d8`

- [x] Heatmap renders the minimap base image with a canvas density overlay in the same square box as the old placeholder (no layout shift).
- [x] Positions map by normalized coordinates (x over crop width, y over crop height), translated from the analysis crop size into the aspect-preserved base image rect.
- [x] Only ok-status rounds and points inside each round's start-to-cutoff window contribute; failed rounds are excluded with a compact status note on the card.
- [x] Type1 shows player icon types only; Type2 shows bomb and grenade event types only.
- [x] Lens plus side combination the active team never played shows an explicit empty-state message; low-confidence detection shows a badge without blocking.

## Comments

- Implemented in `5f04ada`: `src/features/matches/analysis-heat.ts` (lens/side/window/type-filtered derivation), `match-heatmap.tsx` (base layer plus canvas density overlay with blue-green-yellow-red ramp), `participantSideColor`, `minimap` override slot on `PerMapStats`, wired into `MatchTeamView` for the Player tab only. Verified via tsc/eslint/prettier, `pnpm build`, and runtime assertions against the sample payload; no test runner in repo.
- Follow-ups per review: `b67e765` swaps the bundled-art stand-in for the Maps API `match.map.image_url` as the base; `8ac379a` adds a padded gutter with image plus canvas sharing the inner coordinate space; `6111529` preserves the base aspect (`object-contain`) with crop points translated into the displayed rect via `containPoint`, superseding the spec's stretch-to-fill mapping (spec updated); `c6d64d8` moves the Type1/Type2 toggle into normal flow above the box so it never overlaps the map.
