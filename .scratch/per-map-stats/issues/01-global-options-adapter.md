# 01: Global team options plus query-state adapter

**What to build:** Team selection options come from the global team options endpoint with no team identifier, so the Per Map Stats Team filter and the existing upload-match team pickers share one working source. The URL query-state library is wired to the router once so later tickets can persist view state in the address bar.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Team options query returns the full team list without requiring an identifier
- [ ] Upload-match team pickers still list teams with no errors
- [ ] Query-state adapter is wired so URL keys can be read and written from the team page
