# Replace Mock Stats with Real API Data

**Status:** ready-for-agent

## Problem Statement

The frontend currently uses hard-coded mock data for match analysis (heatmaps, utility stats, playback trajectories, round data) and team/per-map stats (win percentage, rotation odds, setups, utility mix). This means:

- The UI does not reflect real match data from the API
- The mock data must be manually maintained and updated
- The mock data shape may diverge from the real API response over time
- Developers cannot test the UI with real data without bypassing the mocks

The backend `GET /matches/{match}/results` endpoint is live and returns fully structured match analysis data (final score, participants with scores, player heatmaps, utility usage, and playback trajectories). The team stats endpoint is in development.

## Solution

Replace all mock stats data with real API calls:

1. **Match analysis**: Fetch from `GET /matches/{match}/results` and normalize the response into the existing frontend `MatchAnalysis` type via a `select` function in the query options.
2. **Team stats**: Define the expected type contract (mirroring the `match.results` response shape, aggregated) so the codebase is ready for when the backend endpoint lands. Do not implement the query yet.
3. **Delete mock files**: Remove `analysis-mock.ts` and `per-map-stats-mock.ts` entirely once real data is wired up.

## User Stories

1. As a user viewing a match detail page, I want to see the real final score, so that I know who won the match.
2. As a user viewing a match detail page, I want to see real player heatmap data (dwell and traffic), so that I can analyze where players spent time on the map.
3. As a user viewing a match detail page, I want to see real utility usage stats (throw count, landing points, usage percentage), so that I can analyze the team's utility patterns.
4. As a user viewing a match detail page, I want to see real playback trajectories for each round, so that I can watch how the round unfolded.
5. As a user viewing a match detail page, I want to see real round-by-round scores, so that I can track how the match progressed.
6. As a user viewing a match detail page, I want to see which team won each round, so that I can analyze round outcomes.
7. As a user viewing a match detail page, I want to see the perspective (attacker/defender) for my team, so that I can understand the analysis context.
8. As a user viewing a match detail page, I want to see real participant data (team names, logos, scores, winner status), so that I can identify the teams.
9. As a user viewing a match detail page, I want the data to load automatically, so that I don't have to manually refresh.
10. As a user viewing a match detail page, I want to see a loading state while results are being fetched, so that I know the data is coming.
11. As a user viewing a match detail page, I want to see a "not ready yet" message if the match is still processing, so that I know to check back later.
12. As a user viewing a match detail page, I want to see an error message if the results cannot be fetched, so that I know something went wrong.
13. As a user viewing a match detail page, I want the score header to show real scores instead of mock data, so that the score is accurate.
14. As a user viewing a match detail page, I want the heatmap to render real trajectory data, so that the visualization is meaningful.
15. As a user viewing a match detail page, I want the utility stats to show real usage data, so that the analysis is accurate.
16. As a user viewing a match detail page, I want to switch between player and utility tabs and see the appropriate data for each, so that I can analyze different aspects of the match.
17. As a user viewing a match list, I want to see real match data (names, dates, statuses), so that the list is accurate.
18. As a user viewing a team detail page, I want to see real per-map stats (once the backend endpoint is ready), so that I can analyze team performance per map.
19. As a user viewing a team detail page, I want to see real team-level aggregate stats (once the backend endpoint is ready), so that I can analyze overall team performance.
20. As a developer, I want the mock data files deleted, so that there is no confusion about which data source is authoritative.
21. As a developer, I want the normalization layer to be type-safe, so that the frontend always receives correctly typed data.
22. As a developer, I want the team stats types defined in advance, so that the backend team has a clear contract to implement against.
23. As a developer, I want the `api.d.ts` file to remain untouched, so that it can be regenerated from the OpenAPI spec without conflicts.
24. As a developer, I want the query to use `icons: "both"` so that all data is fetched in a single request and cached.
25. As a developer, I want the `include_opponent` parameter to be disregarded, as it is being removed from the API.

## Implementation Decisions

### New Types

Define a new file `match-results-types.ts` with types that mirror the actual runtime shape of the `match.results` response:

- `MatchResults` — the full response wrapper with `id`, `name`, `played_at`, `status`, `map`, `final_score`, `participants`, `winner_team_id`, `perspective`, `player_heatmaps`, `utility`, `playback`
- `MatchResultsParticipant` — participant with `team_id`, `team_name`, `logo_url`, `color`, `is_uploaded_from`, `score`, `is_winner`
- `MatchResultsPlayback` — playback data with `map_slug`, `map_crop`, `fps`, `rounds`
- `MatchResultsRound` — a round with `side`, `winner`, `score_after`, `round_number`, `trajectories`, `round_start_ms`, `tracking_cutoff_ms`
- `MatchResultsTrajectory` — a trajectory with `track_id`, `icon_type`, `team_color`, `attached_to_track_id`, `points`
- `MatchResultsUtility` — utility usage with `icon_type`, `landing_points`, `throw_count`, `rounds_with_use`, `rounds_total`, `usage_pct`, `avg_per_round`
- `MatchResultsHeatmap` — heatmap data with `dwell` and `traffic`, each mapping player names to 2D number arrays

### Normalization Layer

Create `analysis-mapper.ts` with a function that transforms `MatchResults` into the existing `MatchAnalysis` frontend type:

- Cast `playback.rounds` from `unknown[]` to `MatchResultsRound[]`
- Cast `utility` to `MatchResultsUtility[]`
- Cast `player_heatmaps` to `MatchResultsHeatmap`
- Cast `participants` to `MatchResultsParticipant[]`
- Cast `perspective.side` to `"attacker" | "defender"`
- Map `final_score` to `MatchAnalysis.finalScore`
- Map `playback` fields to `MatchAnalysis` playback fields

### Query

Replace the mock query in `analysis-queries.ts` with a real query:

- Use `$api.queryOptions('get', '/matches/{match}/results', { params: { team_id, icons: 'both' } })`
- Use `select` to normalize the response via the mapper
- Handle `null` data (return `null` from select, let the hook handle loading state)
- Do not poll on 409 — show a "not ready yet" message

### Hook

Replace `useMatchAnalysisQuery` with `useMatchResultsQuery`:

- Wrap the query with `useQuery`
- Return `null` when data is null (loading state)
- Return the normalized `MatchAnalysis` when data is available

### Component Updates

- `match-team-view.tsx`: Use `useMatchResultsQuery` instead of `useMatchAnalysisQuery`
- `match-score-header.tsx`: Remove `MOCK_SCORES` fallback; accept `finalScore` as a required prop from the parent
- `per-map-stats.tsx`: Remove `MAP_WIN_PCT` constant; prepare for future team stats query

### Mock Deletion

- Delete `src/features/matches/analysis-mock.ts`
- Delete `src/features/teams/components/per-map-stats/per-map-stats-mock.ts`

### Team Stats Preparation

Define `TeamStats` and `TeamStatsMap` types (mirroring the `match.results` response shape, aggregated) in a new file. Do not implement the query until the backend endpoint is ready.

### API Types

Leave `api.d.ts` untouched. All type mismatches are handled in the normalization layer.

## Testing Decisions

### What makes a good test

- Test the normalization layer (mapper) in isolation — given a raw API response, it should produce the correct `MatchAnalysis` shape
- Test the query hook's loading and error states
- Test that `null` data from the API results in a loading state, not an error
- Test that 409 responses show the "not ready yet" message

### Modules to test

- `analysis-mapper.ts` — the normalization function
- `analysis-queries.ts` — the query options and select function
- `use-match-results-query.ts` — the hook

### Prior art

- The existing `use-match-analysis-query.ts` hook provides a pattern for testing query hooks
- The existing `match-queries.ts` and `team-queries.ts` files show the pattern for testing query options

## Out of Scope

- **Team stats implementation**: The backend endpoint is not ready. Only the type contract is defined.
- **Polling for match results**: No automatic polling on 409. The user navigates back later.
- **Updating `api.d.ts`**: The generated types are not modified. All type handling is in the normalization layer.
- **`include_opponent` parameter**: Disregarded, as it is being removed from the API.
- **Match list scores**: The match list does not show scores. Only the detail page shows scores.
- **Per-map stats UI**: The per-map stats component is not updated with real data until the team stats endpoint is ready.

## Further Notes

- The `match.results` endpoint returns `data: { ... } | null`. Null data means the match is still processing.
- The `perspective.side` field is typed as `string | "attacker"` in the OpenAPI types but is always `"attacker"` or `"defender"` at runtime.
- The `player_heatmaps` field is typed as `{ dwell: string; traffic: string }` in the OpenAPI types but is actually `{ dwell: Record<string, number[][]>, traffic: Record<string, number[][]> }` at runtime.
- The `playback.rounds` field is typed as `unknown[]` in the OpenAPI types but is actually a structured array of round objects at runtime.
- The `utility` field has `landing_points` coordinates typed as `string` in the OpenAPI types but they are actually `number` at runtime.
- The backend team is actively working on the team stats endpoint. The type contract should be revisited when the endpoint shape is finalized.
