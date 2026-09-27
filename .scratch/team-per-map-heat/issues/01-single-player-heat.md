# 01: Single player-density heat, no toggle

**What to build:** Player heat becomes one obvious map read everywhere: the team panel and the per-match view show player-position density only, with the Type1/Type2 switch and its URL key gone. Old links carrying the retired key still load.

**Blocked by:** None (can start immediately).

**Status:** done

- [x] No heat calculation toggle renders on the team panel Player tab nor on the match view Player tab
- [x] Player heat shows player-position density only; event density no longer renders as a separate toggleable layer
- [x] Utility tab behavior unchanged: selected row's points only, no toggle
- [x] Side and view controls keep filtering as before; links with a stale heat key load ignoring it

## Comments

- Implemented in `eacf73b`: removed Type1/Type2 toggle UI and `heat` URL key in team and match views; `selectPlayerHeatPoints` is player-position density only; stale `?heat=` keys ignored.
