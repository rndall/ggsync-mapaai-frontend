# 03: Player stats plus heat-type minimap box

**What to build:** The Player view shows Rotation Odds with Behavior After a Win and Behavior After a Loss as stay-versus-switch split bars, plus ranked site setups with site-count badges and right-aligned frequencies, swapping per Attacking versus Defending from the typed mock. Beside it a layout-stable blank minimap box is reserved with the Type1 versus Type2 heat calculation toggle, which flips URL state while the panel stays blank.

**Blocked by:** 02 (needs the shell, filters, and banner).

**Status:** done

- [x] Rotation bars show numeric stay and switch values with green same-site and red switch split (win 64/36, loss corrected 24/76)
- [x] Setup rows rank distributions with frequencies (3A 2B 18% down through 4A 1B 10%) and swap with the side toggle
- [x] Blank minimap box reserves full column height with the Type1/Type2 toggle flipping heat URL state and no site markers yet
