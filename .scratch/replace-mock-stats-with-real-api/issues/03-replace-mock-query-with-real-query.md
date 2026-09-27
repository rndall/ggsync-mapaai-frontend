# 03: Replace mock query with real query and hook

**What to build:** Replace the mock-based analysis query with a real query that fetches from `GET /matches/{match}/results`, normalizes the response via the mapper, and exposes it through a `useMatchResultsQuery` hook.

**Blocked by:** 02 — Create normalization mapper

**Status:** ready-for-agent

- [ ] Update `analysis-queries.ts` to use `$api.queryOptions('get', '/matches/{match}/results', ...)` with `params: { team_id, icons: 'both' }`
- [ ] Add `select` function that normalizes the response via the mapper
- [ ] Handle null data (return null from select)
- [ ] Create `useMatchResultsQuery` hook that wraps the query with `useQuery`
- [ ] Return null when data is null (loading state)
- [ ] Return normalized `MatchAnalysis` when data is available
- [ ] Remove old `useMatchAnalysisQuery` hook
