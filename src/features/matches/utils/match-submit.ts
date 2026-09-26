export type MatchFormValues = {
  matchName: string
  matchDate: string
  map: string
  redTeamId: string
  blueTeamId: string
  videoFile: File | null
}

export type ParsedMatchParams = {
  matchName: string
  playedAt: string
  mapId: number
  uploaderId: number
  teamColor: 'red' | 'blue'
  opponentTeamId: number
  videoFile: File
}

// Pure parse of the raw string form values into API-ready params. Returns a
// message instead of throwing so the caller can show it without try/catch
// gymnastics mixing validation errors with server errors.
export function parseMatchParams(
  values: MatchFormValues,
  teamId?: string,
): { ok: true; params: ParsedMatchParams } | { ok: false; message: string } {
  const mapId = Number(values.map)
  const redId = Number(values.redTeamId)
  const blueId = Number(values.blueTeamId)
  if (!Number.isFinite(mapId) || !Number.isFinite(redId) || !Number.isFinite(blueId)) {
    return { ok: false, message: 'Please select a valid map and both teams.' }
  }

  // POST /teams/{team}/matches-direct is always scoped to an uploading team.
  // Locked: the drawer team; free: the red side uploads.
  const isRedUploader = teamId ? values.redTeamId === teamId : true
  const uploaderId = teamId ? Number(teamId) : redId
  if (!Number.isFinite(uploaderId)) {
    return { ok: false, message: 'Please select a valid uploading team.' }
  }

  if (!(values.videoFile instanceof File)) {
    return { ok: false, message: 'Match video is required.' }
  }

  return {
    ok: true,
    params: {
      matchName: values.matchName.trim(),
      playedAt: values.matchDate,
      mapId,
      uploaderId,
      teamColor: isRedUploader ? 'red' : 'blue',
      opponentTeamId: isRedUploader ? blueId : redId,
      videoFile: values.videoFile,
    },
  }
}
