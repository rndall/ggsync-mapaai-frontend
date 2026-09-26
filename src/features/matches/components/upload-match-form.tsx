import { useForm } from '@tanstack/react-form'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { useState } from 'react'
import z from 'zod'

import { DatePicker } from '@/components/date-picker'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { toast } from '@/components/ui/toast'
import { useCreateMatchText } from '@/features/matches/hooks/use-create-match-text'
import {
  describeChunkFailure,
  parseMatchParams,
  planVideoUpload,
} from '@/features/matches/utils/match-submit'
import { uploadVideoInChunks } from '@/features/matches/utils/video-upload'
import { teamQueries } from '@/features/teams/queries'
import {
  getErrorMessage,
  getFieldErrors,
  toFieldErrors,
} from '@/utils/server-errors'
import { isMp4File } from '@/utils/video'

import MapSearch from './map-search'
import TeamColorField from './team-color-field'
import type { TeamOption } from './team-combobox'
import VideoDropzone from './video-dropzone'

// Stored as "yyyy-MM-dd" and parsed as a local date so the selected day never
// shifts across timezones.
function parseDateValue(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) {
    return undefined
  }
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  )
  return Number.isNaN(date.getTime()) ? undefined : date
}

const formSchema = z
  .object({
    matchName: z.string().min(1, 'Match name is required'),
    matchDate: z.string().min(1, 'Match date is required'),
    map: z.string().min(1, 'Map is required'),
    redTeamId: z.string().min(1, 'Red team is required'),
    blueTeamId: z.string().min(1, 'Blue team is required'),
    videoFile: z
      .instanceof(File, { message: 'Match video is required' })
      .refine((file) => isMp4File(file), {
        message: 'Only MP4 files are supported',
      })
      .nullable()
      .refine((file): file is File => file instanceof File, {
        message: 'Match video is required',
      }),
  })
  .refine(
    (data) =>
      !data.redTeamId || !data.blueTeamId || data.redTeamId !== data.blueTeamId,
    {
      message: 'Teams must be different',
      path: ['blueTeamId'],
    },
  )

type UploadMatchFormProps = {
  teamId?: string
  onSuccess?: () => void
}

export default function UploadMatchForm({
  teamId,
  onSuccess,
}: UploadMatchFormProps) {
  const { mutateAsync: createMatchText, isPending: isSendingInfo } =
    useCreateMatchText()
  const [serverErrors, setServerErrors] = useState<Record<string, string[]>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const isSubmitting = isSendingInfo || isUploadingVideo

  // Team selection options for the color pickers. The scoped endpoint
  // requires a team context; without one fall back to the teams list.
  const optionsQuery = useQuery({
    ...teamQueries.options(teamId ?? ''),
    enabled: teamId !== undefined && teamId !== '',
  })
  const teamsListQuery = useQuery({
    ...teamQueries.list({ per_page: 100 }),
    enabled: teamId === undefined || teamId === '',
  })

  const teams: TeamOption[] = teamId
    ? (optionsQuery.data?.data ?? [])
    : (teamsListQuery.data?.data.teams.map((team) => ({
        id: team.id,
        name: team.name,
      })) ?? [])
  const teamName = teamId
    ? teams.find((team) => String(team.id) === teamId)?.name
    : undefined

  const clearServerError = (key: string) => {
    setServerErrors((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const form = useForm({
    defaultValues: {
      matchName: '',
      matchDate: '',
      map: '',
      redTeamId: teamId ?? '',
      blueTeamId: '',
      videoFile: null as File | null,
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setServerErrors({})
      setFormError(null)

      const parsed = parseMatchParams(value, teamId)
      if (!parsed.ok) {
        setFormError(parsed.message)
        return
      }
      const { params } = parsed

      try {
        const plan = await planVideoUpload(params.videoFile)

        const textResponse = await createMatchText({
          params: { path: { team: params.uploaderId } },
          body: {
            name: params.matchName,
            played_at: params.playedAt,
            team_color: params.teamColor,
            map_id: params.mapId,
            opponent_team_id: params.opponentTeamId,
            total_chunks: plan.totalChunks,
            total_bytes: plan.totalBytes,
            content_hash: plan.contentHash,
          },
        })
        const matchId = textResponse.data.match_id

        // Text data is in: close the drawer now so only the progress toast
        // represents the video chunk uploads.
        onSuccess?.()

        setIsUploadingVideo(true)
        // Chunk progress is a single loading toast driven by toast.promise;
        // per-chunk counts are tracked locally for the failure message.
        let uploadedChunks = 0
        try {
          await toast.promise(
            uploadVideoInChunks(matchId, params.videoFile, {
              onProgress: (progress) => {
                uploadedChunks = progress.done
              },
            }),
            {
              loading: {
                title: 'Uploading video…',
                timeout: 0,
              },
              success: {
                type: 'success',
                title: 'Match uploaded',
                description: 'Processing started.',
                timeout: 5000,
              },
              error: (chunkError: unknown) => ({
                type: 'error',
                title: 'Video upload failed',
                description: describeChunkFailure(
                  uploadedChunks,
                  plan.totalChunks,
                  matchId,
                  chunkError,
                ),
                timeout: 5000,
              }),
            },
          )
        } catch (chunkError) {
          // Chunk failures carry the raw server payload; surface field
          // errors for the reopened form, the toast already shows the summary.
          const fieldErrors = getFieldErrors(chunkError)
          setServerErrors(fieldErrors)
          setFormError(
            describeChunkFailure(
              uploadedChunks,
              plan.totalChunks,
              matchId,
              chunkError,
            ),
          )
          return
        }

        form.reset()
        setServerErrors({})
        setFormError(null)
      } catch (error) {
        const fieldErrors = getFieldErrors(error)
        setServerErrors(fieldErrors)
        if (Object.keys(fieldErrors).length === 0) {
          setFormError(
            getErrorMessage(
              error,
              'Could not upload the match. Please try again.',
            ),
          )
        }
      } finally {
        setIsUploadingVideo(false)
      }
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      noValidate
    >
      <FieldGroup>
        <form.Field
          name="matchName"
          children={(field) => {
            const fieldServerErrors = toFieldErrors(serverErrors, 'name')
            const isInvalid =
              (field.state.meta.isTouched && !field.state.meta.isValid) ||
              fieldServerErrors.length > 0
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-sm text-muted" htmlFor={field.name}>
                  Match Name
                </FieldLabel>
                <Input
                  size="xl"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value)
                    clearServerError('name')
                  }}
                  aria-invalid={isInvalid}
                  autoComplete="off"
                />
                {isInvalid && (
                  <FieldError
                    errors={[...field.state.meta.errors, ...fieldServerErrors]}
                  />
                )}
              </Field>
            )
          }}
        />
        <form.Field
          name="matchDate"
          children={(field) => {
            const fieldServerErrors = toFieldErrors(serverErrors, 'played_at')
            const isInvalid =
              (field.state.meta.isTouched && !field.state.meta.isValid) ||
              fieldServerErrors.length > 0
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-sm text-muted" htmlFor={field.name}>
                  Match Date
                </FieldLabel>
                <ButtonGroup className="w-full">
                  <DatePicker
                    size="xl"
                    id={field.name}
                    aria-invalid={isInvalid}
                    className="flex-1"
                    value={parseDateValue(field.state.value)}
                    onChange={(date) => {
                      field.handleChange(date ? format(date, 'yyyy-MM-dd') : '')
                      clearServerError('played_at')
                    }}
                    onBlur={field.handleBlur}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="xl"
                    onClick={() => {
                      field.handleChange(format(new Date(), 'yyyy-MM-dd'))
                      field.handleBlur()
                      clearServerError('played_at')
                    }}
                  >
                    Today
                  </Button>
                </ButtonGroup>
                {isInvalid && (
                  <FieldError
                    errors={[...field.state.meta.errors, ...fieldServerErrors]}
                  />
                )}
              </Field>
            )
          }}
        />
        <form.Field
          name="map"
          children={(field) => {
            const fieldServerErrors = toFieldErrors(serverErrors, 'map_id')
            const isInvalid =
              (field.state.meta.isTouched && !field.state.meta.isValid) ||
              fieldServerErrors.length > 0
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-sm text-muted" htmlFor={field.name}>
                  Select Map
                </FieldLabel>
                <MapSearch
                  id={field.name}
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value)
                    clearServerError('map_id')
                  }}
                  onOpenChange={(open) => {
                    if (!open) {
                      field.handleBlur()
                    }
                  }}
                  size="xl"
                  aria-invalid={isInvalid}
                />
                {isInvalid && (
                  <FieldError
                    errors={[...field.state.meta.errors, ...fieldServerErrors]}
                  />
                )}
              </Field>
            )
          }}
        />
        <form.Field
          name="redTeamId"
          children={(redField) => (
            <form.Field
              name="blueTeamId"
              children={(blueField) => {
                const redServerErrors = toFieldErrors(
                  serverErrors,
                  'opponent_team_id',
                )
                const isRedInvalid =
                  (redField.state.meta.isTouched &&
                    !redField.state.meta.isValid) ||
                  redServerErrors.length > 0
                const isBlueInvalid =
                  (blueField.state.meta.isTouched &&
                    !blueField.state.meta.isValid) ||
                  redServerErrors.length > 0
                return (
                  <Field data-invalid={isRedInvalid || isBlueInvalid}>
                    <FieldLabel className="text-sm text-muted">
                      Assign Team Color
                    </FieldLabel>
                    <TeamColorField
                      teamId={teamId}
                      teams={teams}
                      teamName={teamName}
                      redTeamId={redField.state.value}
                      blueTeamId={blueField.state.value}
                      onRedTeamChange={(value) => {
                        redField.handleChange(value)
                        clearServerError('opponent_team_id')
                      }}
                      onBlueTeamChange={(value) => {
                        blueField.handleChange(value)
                        clearServerError('opponent_team_id')
                      }}
                      onRedBlur={redField.handleBlur}
                      onBlueBlur={blueField.handleBlur}
                      redInvalid={isRedInvalid}
                      blueInvalid={isBlueInvalid}
                      redInputId={redField.name}
                      blueInputId={blueField.name}
                    />
                    {isRedInvalid && (
                      <FieldError
                        errors={[
                          ...redField.state.meta.errors,
                          ...redServerErrors,
                        ]}
                      />
                    )}
                    {isBlueInvalid && (
                      <FieldError
                        errors={[
                          ...blueField.state.meta.errors,
                          ...redServerErrors,
                        ]}
                      />
                    )}
                  </Field>
                )
              }}
            />
          )}
        />
        <form.Field
          name="videoFile"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel className="text-sm text-muted" htmlFor={field.name}>
                  Upload Match
                </FieldLabel>
                <VideoDropzone
                  value={field.state.value}
                  onChange={(file) => field.handleChange(file)}
                  onBlur={field.handleBlur}
                  isInvalid={isInvalid}
                  inputId={field.name}
                  errorId={`${field.name}-error`}
                />
                {isInvalid && (
                  <FieldError
                    id={`${field.name}-error`}
                    errors={field.state.meta.errors}
                  />
                )}
              </Field>
            )
          }}
        />
        {formError && (
          <p role="alert" className="text-xs/relaxed text-destructive">
            {formError}
          </p>
        )}
        <Field orientation="horizontal" className="justify-end">
          <Button
            type="submit"
            className="rounded-none"
            size="lg"
            disabled={isSubmitting}
          >
            {isSendingInfo
              ? 'Sending match info...'
              : isUploadingVideo
                ? 'Uploading video...'
                : 'Start Analyzing'}
            {isSubmitting && <Spinner />}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
