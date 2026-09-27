# 01: Define match-results types

**What to build:** Type-safe contract for the `match.results` response shape, covering the full payload structure including participants with scores, playback rounds with trajectories, utility usage records, and heatmap data.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Define `MatchResults` type with all top-level fields (id, name, played_at, status, map, final_score, participants, winner_team_id, perspective, player_heatmaps, utility, playback)
- [ ] Define `MatchResultsParticipant` with score and is_winner fields
- [ ] Define `MatchResultsPlayback` with typed rounds array
- [ ] Define `MatchResultsRound` with side, winner, score_after, trajectories, timing fields
- [ ]Define `MatchResultsTrajectory` with track_id, icon_type, team_color, attached_to_track_id, points
- [ ]Define `MatchResultsUtility` with icon_type, landing_points, throw_count, rounds_with_use, rounds_total, usage_pct, avg_per_round
- [ ]Define `MatchResultsHeatmap` with dwell and traffic as Record<string, number[][]>
- [ ]Export all types from a new file
