# 03: Player heatmap Type1/Type2

**What to build:** Coaches viewing Player heat see a density heatmap over the Map API minimap base, with Type1 showing player positions and Type2 showing event positions, filtered to the active team lens and the selected Attacking/Defending side.

**Blocked by:** 01-analysis-contract-query.

**Status:** ready-for-agent

- [ ] Heatmap renders the minimap base image with a canvas density overlay in the same square box as the old placeholder (no layout shift).
- [ ] Positions map by normalized coordinates (x over crop width, y over crop height) with stretch-to-fill alignment.
- [ ] Only ok-status rounds and points inside each round's start-to-cutoff window contribute; failed rounds are excluded with a compact status note on the card.
- [ ] Type1 shows player icon types only; Type2 shows bomb and grenade event types only.
- [ ] Lens plus side combination the active team never played shows an explicit empty-state message; low-confidence detection shows a badge without blocking.
