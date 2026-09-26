# 02: Per map stats shell with live filters plus banner

**What to build:** The Per Map Stats panel appears on the team detail view between the team heading and the match history, with a heading, opponent Team filter defaulting to All (stats versus the selected opponent), Map filter defaulting to the first map, and a map banner showing the display map name with its bundled art plus a hardcoded gold Map Win %.

**Blocked by:** 01 (needs the global team options and query-state adapter).

**Status:** ready-for-agent

- [ ] Heading with Team and Map filters renders above the banner, both populated from live list queries
- [ ] Banner shows the selected map name in display type over its framed map art with gradient fallback when art is missing
- [ ] Map Win % renders prominently as agreed hardcoded value
- [ ] View, side, team, and map selections persist in the URL with agreed defaults
