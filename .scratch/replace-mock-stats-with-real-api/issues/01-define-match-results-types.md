# 01: Define match-results types

**What to build:** Type-safe contract for the `match.results` response shape, covering the full payload structure including participants with scores, playback rounds with trajectories, utility usage records, and heatmap data.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Define `MatchResults` type with all top-level fields (id, name, played_at, status, map, final_score, participants, winner_team_id, perspective, player_heatmaps, utility, playback)
- [x] Define `MatchResultsParticipant` with score and is_winner fields
- [x] Define `MatchResultsPlayback` with typed rounds array
- [x] Define `MatchResultsRound` with side, winner, score_after, trajectories, timing fields
- [x]Define `MatchResultsTrajectory` with track_id, icon_type, team_color, attached_to_track_id, points
- [x]Define `MatchResultsUtility` with icon_type, landing_points, throw_count, rounds_with_use, rounds_total, usage_pct, avg_per_round
- [x]Define `MatchResultsHeatmap` with dwell and traffic as Record<string, number[][]>
- [x]Export all types from a new file
