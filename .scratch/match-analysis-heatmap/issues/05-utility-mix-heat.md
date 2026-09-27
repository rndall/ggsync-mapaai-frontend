# 05: Utility mix + row-driven heat

**What to build:** Coaches viewing Utility see a mix table derived from event trajectories with exactly one row selected (first row auto-selected), and the minimap heat shows only the selected utility's points.

**Blocked by:** 01-analysis-contract-query, 03-player-heatmap (reuses the heatmap module).

**Status:** ready-for-agent

- [ ] Utility rows show throw counts and share of overall utils derived from event trajectories under the same lens-plus-side filter; bomb-carried markers are excluded.
- [ ] Exactly one row is active at a time with the first row pre-selected on load.
- [ ] Selecting a row swaps the minimap heat to that utility type only; Type1/Type2 toggle remains Player-tab only.
- [ ] Utility selection is local state and does not add URL keys; existing view/side/heat/team/map deep links keep working.
