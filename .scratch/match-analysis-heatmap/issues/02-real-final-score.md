# 02: Real final score in header

**What to build:** Coaches viewing a ready match see the real final score for both teams in the score header instead of mock numbers.

**Blocked by:** 01-analysis-contract-query.

**Status:** implemented in `cc99c83`

- [x] Ready match with ok analysis shows the analysis final score with each number attached to the correct team in blue-first order.
- [x] Pending, processing, or failed analysis keeps the existing fallback treatment (no blank or zeroed scoreline).
- [x] Switching the team lens keeps each score attached to its team.
